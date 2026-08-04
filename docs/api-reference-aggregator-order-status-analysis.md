# Análisis — API Reference & Aggregator Order Status

## 1. Cómo está construida la API Reference

### Plataforma
- Mintlify (MDX). Páginas viven en `en/api-reference/`, `es/api-reference/`, `pt/api-reference/` (trilingüe: EN/ES/PT).
- Navegación en `docs.json`. Grupo API Reference (EN) en líneas ~201–213; ES espeja en ~426–438; PT análogo.
- Config OpenAPI mínima en `api-reference/openapi.json` (5 KB) — no es la fuente principal; el playground se activa por frontmatter.

### Patrón de página (frontmatter `api:`)
Cada endpoint usa el campo `api` en frontmatter para activar playground interactivo ("Try it"):

```yaml
---
title: "Aggregator order status"
api: "POST https://app.fire.rest/api/v1/webhooks/aggregators/order-status"
description: "..."
authMethod: "bearer"
---
```

Reglas (consistentes con CLAUDE.md):
- **Params** (body/header/query/path): componente `<ParamField>`. Nunca tablas markdown para params — el playground no las lee.
- **Respuesta**: `<ResponseField name= type=>`.
- **Auth**: `authMethod: "bearer"` — playground añade header `Authorization: Bearer` automático.
- Objetos anidados: `<Expandable>` dentro de ParamField.
- Ejemplos de request: bloques ```json con título.
- Ejemplos de respuesta: `<ResponseExample>` con un bloque ```json por status code.

### Base URL real
`https://app.fire.rest/api/v1/...` (nota: distinta de la genérica `api.fire.com` de CLAUDE.md — la doc real usa `app.fire.rest`).

### Familia de webhooks inbound (mismo molde)
Tres endpoints comparten estructura async + cola + idempotencia:
| Endpoint | Path | Fuente de verdad | Anti-regresión |
|---|---|---|---|
| Fiscal callback | `/webhooks/fiscal/callback` | Fire emite `eventId` (se echa de vuelta) | — |
| KDS order status | `/webhooks/kds/order-status` | Fire emite `eventId` (se echa de vuelta) | **Sí** (estado no retrocede) |
| Aggregator order status | `/webhooks/aggregators/order-status` | Externo (spontaneous), sin `eventId` de Fire | **No** (último timestamp gana) |

---

## 2. Cómo ocurre el Aggregator Order Status

Archivo: `en/api-reference/aggregator-order-status.mdx` (+ `es/`, `pt/`).

### Dirección y propósito
- **Inbound.** El agregador de delivery (Rappi, Uber, Didi, iFood, PedidosYa, Glovo…) hace POST cuando avanza la orden de su lado (courier asignado, recogido, en ruta, entregado…).
- Fire autentica → resuelve la orden → espeja el último status en `orders.aggregator` → registra evento en su log de agregadores.

### Tres decisiones de diseño clave (Notes)
1. **Asíncrono.** Fire autentica, resuelve (tenant + channel), deduplica, **encola** → devuelve **`202 Accepted`** con `webhookEventId` (<100 ms). El mirror de la orden lo actualiza un worker de fondo (~2 s). Outcome se consulta con `GET /v1/webhooks/events/{webhookEventId}`. Errores corregibles por el cliente (payload malo, orden no encontrada, tenant/canal errado, ids en conflicto) se rechazan **síncronamente** con `4xx` **antes** del `202`.
2. **Status passthrough.** No hay enum. `status` se guarda **verbatim** como tipo de evento (`courier_assigned`, `on_route`, `entregue`, lo que use el canal). El status **actual** = el de `occurredAt` más reciente. **Sin gate anti-regresión** — timestamp mayor gana, punto. Labels amigables/traducidos son solo de display (catálogo de canal).
3. **Sin `eventId` de Fire que echar de vuelta.** A diferencia de fiscal callback y KDS (que echan un `event.id` emitido por Fire), el status de agregador es un evento externo espontáneo. Fire no es fuente de verdad aquí → no hay check de `eventId`. En su lugar indicas **qué orden** vía [order resolution]. Idempotencia se llavea en `providerEventId`.

### Order resolution (dos caminos, al menos uno requerido)
| Campo | Resuelve por | Cuándo |
|---|---|---|
| `orderId` | `orders.id` (UUID de Fire) | Guardaste el id de Fire |
| `externalOrderId` | id externo (XMART/agregador), contra `metadata.order_id` de la orden | Solo conoces tu referencia |

- Ambos **vendor-scoped**: la orden resuelta debe pertenecer a account+vendor de tu API key, y su canal debe coincidir con `channelCode`.
- Si envías **ambos ids y resuelven a órdenes distintas** → **`409 Conflict`** (Fire no adivina).

### Autenticación
- API key **vendor-scoped con scope `webhooks:aggregator`** (binding account+vendor).
- Header `x-api-key` (requerido). `Authorization: Bearer <token>` aceptado como alternativa legacy.
- Sin scope o sin vendor binding → `403 Forbidden`.

### Request body (todos ParamField)
| Campo | Tipo | Req | Nota |
|---|---|---|---|
| `channelCode` | string | ✅ | debe == `metadata.channel.code` de la orden; mismatch → `403` |
| `status` | string | ✅ | passthrough, cualquier string no vacío |
| `providerEventId` | string | ✅ | id del agregador; **idempotency key** junto con `channelCode` |
| `occurredAt` | string | ✅ | ISO 8601 UTC; **ordena el journey** (latest gana) |
| `orderId` | string | — | requerido si falta `externalOrderId` |
| `externalOrderId` | string | — | requerido si falta `orderId` |
| `metadata` | object | — | bag libre (courier, trackingUrl…), guardado as-is |

### Respuesta `202` (dos ids distintos)
- `eventId` — id interno estable de Fire para el par `(channelCode, providerEventId)`.
- `webhookEventId` — id del registro encolado (para polling).
- `received` (bool), `duplicate` (bool), `status` (queue: `queued`→`processing`→`processed`; también `retry`/`failed`/`dead`/`ignored`), `firstReceivedAt`, `message`.

### Códigos de error
`400` validación · `401` sin/mala API key · `403` sin scope/tenant errado/channel mismatch · `404` orden no encontrada · `409` orderId y externalOrderId distintos · `503` auth store transitorio (retry).

### Checking the outcome
`GET /v1/webhooks/events/{webhookEventId}` (misma key `webhooks:aggregator`).
- `status` (queue lifecycle), `attempts`, `result` (ej. `{ "kind": "merged", "current": "delivered" }`), `error`.
- `404` para ids desconocidos o de otro tenant (sin leak de existencia).

### Idempotencia & journey
- Dedup en orden + `(channelCode, providerEventId)` + `status` — **no** en un `eventId` de Fire.
- `status` distinto **nunca** es duplicado → es un paso nuevo. Mismo `(channelCode, providerEventId, status)` reenviado → `202 duplicate:true` (no re-procesa).
- Mantener `providerEventId` único por reporte de status para no replayar pasos.

### El order mirror
Procesado → último status en bloque `orders.aggregator`, journey completo en `history` (ordenado por `occurredAt`). Current = latest `occurredAt`:

```json
{
  "channelCode": "RAPPI",
  "status": "delivered",
  "occurredAt": "2026-06-14T19:07:00.000Z",
  "history": [
    { "status": "courier_assigned", "occurredAt": "2026-06-14T18:46:00.000Z" },
    { "status": "on_route",         "occurredAt": "2026-06-14T18:52:00.000Z" },
    { "status": "delivered",        "occurredAt": "2026-06-14T19:07:00.000Z" }
  ]
}
```
Raw se guarda as-is; label traducido se resuelve en display del catálogo de canal.

---

## 3. Flujo completo (resumen)

```
Agregador  ──POST /webhooks/aggregators/order-status──▶  Fire
                                                          │ 1. Autentica (x-api-key, scope webhooks:aggregator)
                                                          │ 2. Resuelve orden (orderId / externalOrderId, vendor-scoped)
                                                          │ 3. Valida channelCode == canal de la orden
                                                          │ 4. Deduplica (channelCode, providerEventId, status)
                                                          │ 5. Encola
                                                          ▼
                                              202 Accepted { webhookEventId, eventId, status:"queued" }
                                                          │
                            (worker de fondo ~2s)         ▼
                                              espeja en orders.aggregator (+ history por occurredAt)
                                                          │
Cliente  ──GET /webhooks/events/{webhookEventId}──▶  { status:"processed", result:{kind:"merged", current:"delivered"} }
```

Rechazos síncronos `4xx` antes del `202`: `400`/`401`/`403`/`404`/`409`. Transitorio `503` → retry.

---

## 4. Notas / observaciones
- Base URL en doc real = `https://app.fire.rest` (CLAUDE.md menciona `api.fire.com` genérico — a confirmar cuál es canónica).
- El endpoint de polling `GET /v1/webhooks/events/{webhookEventId}` está documentado inline en la misma página, no como página aparte.
- Consistencia trilingüe: los tres idiomas presentes y en nav de `docs.json`.
- Diferenciador clave vs KDS/fiscal: **passthrough sin enum** + **sin anti-regresión** + **sin eventId de Fire** (idempotencia en `providerEventId`).
