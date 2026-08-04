# Contrato — Webhook de estado de sync de menú (X-MART → Backoffice)

> **Dirección:** inbound. X-MART llama a Backoffice.
> **Propósito:** notificar el resultado del publish asíncrono de productos de un vendor, para
> finalizar los `channel_sync_logs` que quedaron en `PROCESSING` y recomputar el `sync_status` del
> menú.
> **Estado:** v1. **Sin autenticación** (decisión tomada, ver §Auth).
> **Propuesta v2 (sin implementar):** `eventId` opcional para cerrar la fila de un solo assignment en
> canales agregador — ver §Anexo al final.
> **Verificado contra código:** 2026-07-27 — se corrigieron el shape de las respuestas (envelope
> `{ success, data }`), los códigos HTTP reales (errores de DB salen **400**, no 500) y dónde se
> persiste `message` (`error_message`, no `response_payload`).

---

## Endpoint

```
POST /api/v1/webhooks/xmart/sync-status
Content-Type: application/json
```

Ruta del handler: `src/app/api/v1/webhooks/xmart/sync-status/route.ts`.

---

## Autenticación

**Ninguna en v1.** No requiere `x-api-key` ni firma HMAC.

> Riesgo asumido: cualquiera con la URL puede flipear el estado de sync de un vendor. Mitigantes:
> idempotencia + el efecto se limita a estado de sincronización (no muta catálogo). Endurecer a
> futuro con API key (`webhooks:xmart`) o HMAC inbound.

---

## Request

### Body

| Campo | Tipo | Req | Descripción |
|---|---|---|---|
| `vendorId` | `string` | ✅ | Identificador del vendor en formato **dotted** (`"100.6.1350"`) = mismo que `channel_sync_logs.vendor_id` / `stores.vendor_id`. Match directo (`WHERE vendor_id = ?`), sin normalización. (Nota: el outbound `list.vendorId` usa el numérico legacy `1350`; el webhook **no** — envía dotted.) |
| `type` | `string` | ✅ | Qué entidad publicó X-MART. Se compara en **lowercase** contra `entity_type`. `PRODUCTS` → finaliza filas `menus` **Y** `products` (el sync de menú empuja productos; X-MART lo reporta como PRODUCTS). Cualquier otro valor (`STORES`, etc.) → match **exacto** `entity_type = lower(type)`. |
| `status` | `string` | ✅ | Resultado del publish del vendor. Enum: `SUCCESS` \| `FAILED`. |
| `message` | `string` | ❌ | Detalle opcional (motivo del fallo, traza). Se persiste en `channel_sync_logs.error_message` **solo si `status = FAILED`**; si viene vacío se escribe `"Publish failed in X-MART"`. Con `status = SUCCESS` se ignora (y `error_message` se limpia a `null`). |

### Ejemplo

```json
{
  "vendorId": "100.6.1350",
  "type": "PRODUCTS",
  "status": "FAILED",
  "message": "Product 4471 rejected: missing tax info"
}
```

### Semántica de `type` (qué `entity_type` se finaliza)

| `type` (lowercased) | `entity_type` afectados | Por qué |
|---|---|---|
| `products` | `menus` **y** `products` | El Sync de menú empuja productos a X-MART; X-MART notifica el resultado como PRODUCTS. Ambas dimensiones del vendor se cierran con esa notificación. |
| cualquier otro (`stores`, …) | match exacto `[lower(type)]` | Cada tipo cierra solo sus propias filas. |

### Semántica del status (granularidad vendor)

X-MART reporta **un único estado por vendor** (no por producto ni por assignment). Backoffice aplica
ese estado a **todas** las filas `PROCESSING` del vendor para los `entity_type` resueltos por `type`
(all-or-nothing). Si el vendor tenía varios assignments y solo algunos fallaron, X-MART igual manda
un solo `FAILED` y todas van a `FAILED` — no se distingue cuál falló (limitación de X-MART).

---

## Comportamiento del handler

1. Resolver `entityTypes` desde `type`: `lower(type) === 'products' ? ['menus','products'] : [lower(type)]`.
2. `UPDATE channel_sync_logs SET status = body.status, completed_at = now(), error_message = (status='FAILED' ? (message || 'Publish failed in X-MART') : null) WHERE entity_type IN (entityTypes) AND vendor_id = body.vendorId AND status = 'PROCESSING'` → filas afectadas.
3. Si **0 filas** → **no-op idempotente** → `200 { success: true, data: { ok: true, updated: 0 } }`.
4. Recompute **solo** de las filas afectadas con `entity_type = 'menus'` (su `entity_id` es un menú). Por cada menú → recomputar `catalog_menus.sync_status` leyendo el último log por terna:
   - alguna terna aún `PROCESSING` → `PENDING`.
   - todas terminales y todas `SUCCESS` → `SYNCED`.
   - todas terminales y alguna `FAILED` → `FAILED`.
   - Las filas `products`/`stores` solo se marcan (no alimentan recompute de menú).
5. El UPDATE **libera el lock** del vendor (ya no hay filas `PROCESSING` para esos `entity_type`).
   El lock del lado Backoffice solo observa filas `entity_type = 'menus'`; las filas `products` (sync
   de un producto suelto) se cierran igual pero nunca bloquearon.

---

## Responses

Todas las respuestas usan el **envelope estándar del proyecto** (`ApiHandler`): éxito
`{ success: true, data: … }`, error `{ success: false, error: "<CODE>", message: "…", details?: … }`.
El payload útil **no** está en la raíz.

| HTTP | Body | Cuándo |
|---|---|---|
| `200` | `{ "success": true, "data": { "ok": true, "updated": <number> } }` | Procesado. `updated` = filas flipeadas (0 si idempotente/no-op). |
| `400` | `{ "success": false, "error": "VALIDATION_ERROR", "message": "Datos de entrada inválidos", "details": [ /* issues Zod */ ] }` | Body inválido (falta `vendorId`/`type`/`status`, `status` fuera del enum, `status` en minúsculas). |
| `400` | `{ "success": false, "error": "DOMAIN_ERROR", "message": "..." }` | ⚠️ Fallo de DB al finalizar los logs o al recomputar el menú. **Es un 4xx pese a ser error del servidor** (el repo lanza `DomainError` y `ApiHandler` lo mapea a 400). Ver §Idempotencia. |
| `500` | `{ "success": false, "error": "INTERNAL_SERVER_ERROR", "message": "...", "details"?: {…} }` | Excepción no tipada. Incluye **JSON malformado** (falla antes de la validación Zod). |

No hay respuestas `401`/`403` (no hay auth) ni `404`.

### Ejemplo 200

```json
{ "success": true, "data": { "ok": true, "updated": 3 } }
```

### Idempotencia y reintentos

- Reenvío del mismo callback tras finalizar → `200 { "success": true, "data": { "ok": true, "updated": 0 } }`
  (no-op). El `UPDATE` filtra `status = 'PROCESSING'`, así que un estado terminal ya escrito no se revierte.
- El handler es seguro de re-ejecutar siempre.
- ⚠️ **Reintentar solo ante `5xx` no alcanza:** el caso más probable de error transitorio (DB caída)
  responde `400 DOMAIN_ERROR`. Si X-MART no reintenta ese 400, la tanda queda `PROCESSING` y el vendor
  bloqueado indefinidamente (el lock no tiene TTL). Recomendación para el emisor: reintentar también
  ante `400` con `"error": "DOMAIN_ERROR"` (`VALIDATION_ERROR` **no** es reintentable — es body inválido).

---

## Notas de correlación

- **No hay requestId.** La única llave es `vendor_id`. La correctitud depende del **lock por vendor**
  del lado Backoffice: nunca hay dos tandas `PROCESSING` simultáneas para un mismo vendor, por lo que
  todas las filas `PROCESSING` del vendor pertenecen a la tanda que este callback finaliza.
- El lock es **indefinido** (sin TTL). Solo este webhook lo libera. Si el callback nunca llega, el
  vendor queda bloqueado hasta intervención manual (operación fuera de este contrato).
- El match es **solo por `vendor_id`**: no se filtra por `account_id`. Un mismo `vendor_id` usado por
  dos cuentas cerraría las filas de ambas.

---

## Relación con el outbound (`auto_publish`)

Este callback es la contraparte del `autoPublish: true` que Backoffice envía en el **último request
por vendor** del flujo de Sync — en la **raíz del bundle** `XMartSyncProductsRequest` (camelCase),
no dentro de `list`. Ejemplo:

```json
[
  {
    "autoPublish": true,
    "list": [{ "listId": "menu-app-kfc", "vendorId": 1350, "storeId": 72, "channelId": "APP", "channelReferenceName": "APP_KFC", "replicateInAll": false }],
    "categories": [ ... ],
    "products": [ ... ],
    "modifierGroups": []
  }
]
```

Ese flag dispara el publish async en X-MART; este webhook reporta su resultado.

---

## Anexo — `eventId` opcional para canales agregador (v2, ⛔ NO IMPLEMENTADO)

> **Estado: propuesta acordada, sin código.** Nada de esta sección funciona hoy. Documentada acá para
> que el equipo agregador tenga el contrato objetivo antes de implementarlo.
> **Análisis contra código: 2026-07-27.**
>
> ⚠️ **No enviar `eventId` todavía.** El schema Zod actual no es `strict`: un `eventId` en el body se
> **ignora en silencio** y el callback ejecuta el barrido **por vendor completo** (cierra todas las
> filas `PROCESSING` del vendor). Es decir, mandarlo hoy no acota nada y puede cerrar de más.

### Qué se propone

Campo **opcional** `eventId` en el body. Cuando viene, el callback cierra **solo la fila del
assignment (terna store × canal × fulfillment) que originó ese evento**, en vez de barrer todo el
vendor. Resuelve la limitación *all-or-nothing* descrita arriba, pero **solo para canales agregador**.

| Campo | Tipo | Req | Descripción |
|---|---|---|---|
| `eventId` | `string` | ❌ | `event.id` del sobre Fire que Backoffice emitió al agregador (`menu.updated` / `product.updated`). Formato `evt_<12 hex>` (ej. `evt_9f2c41ab77de`). Uno por assignment. Si viene → match por evento (fila única). Si no viene → comportamiento actual (barrido por vendor). |

```json
{
  "vendorId": "100.6.1350",
  "type": "PRODUCTS",
  "status": "FAILED",
  "eventId": "evt_9f2c41ab77de",
  "message": "Product 4471 rejected: missing tax info"
}
```

### Decisiones tomadas (2026-07-27)

| Decisión | Valor |
|---|---|
| **Emisor** | El **agregador** (canal `authMode: WEBHOOK_HMAC`). **No X-MART** — X-MART nunca ve el `event.id`, solo viaja en el sobre Fire. |
| **Id a usar** | `event.id` del envelope Fire. **No** `data.groupId` (ese es por tanda, no por terna) ni el `requestId` de X-MART. |
| **Granularidad** | **Solo la fila de esa terna.** `vendorId` se sigue exigiendo y actúa como guard: la fila debe pertenecer a ese vendor. |
| **Path agregador async** | **Diferido.** Hoy el POST firmado marca `SUCCESS`/`FAILED` sincrónico. Cuando el equipo lo implemente, pasará a `PROCESSING` (2xx = *aceptado*, no *aplicado*) y recién ahí el callback cierra algo. |

### De dónde sale el `eventId` (lo que hoy ya existe)

Backoffice **ya genera** ese id en cada emisión al agregador:

```
event.id          = "evt_<12 hex>"   ← uno POR assignment/POST  (newFireEventId)
event.executionId = "exec_<uuid>"    ← ídem, por envelope
data.groupId      = <uuid>           ← uno POR TANDA de Sync (compartido por los N assignments)
```

Builders: `buildMenuUpdatedFireEnvelope` / `buildProductUpdatedFireEnvelope`
(`src/modules/aggregators/utils/contract-fire-test-payload.builders.ts`).

Hoy se persiste **solo** dentro del JSONB `channel_sync_logs.response_payload.fireBody.event.id`, y
únicamente al cerrar el log (`markSuccess` / `markFailed` de delivery). Si el POST lanza excepción, no
queda registrado. Sin columna propia ni índice.

### Semántica objetivo del handler

```
si eventId presente:
  UPDATE channel_sync_logs
     SET status, completed_at, error_message
   WHERE emit_event_id = :eventId          ← columna nueva, indexada
     AND vendor_id     = :vendorId         ← guard defensivo
     AND status        = 'PROCESSING'
  → cierra 1 fila (o 0 → no-op idempotente)

si eventId ausente:
  comportamiento actual (barrido por vendor + entity_type)
```

Respuestas: sin cambios (`200 { "success": true, "data": { "ok": true, "updated": 0|1 } }`).
`updated: 0` cubre callback duplicado, `eventId` desconocido, y fila ya terminal.

### Precondiciones técnicas (por qué no es solo agregar el campo)

1. **Columna propia `channel_sync_logs.emit_event_id`** (`text`, índice; único parcial si se quiere
   dedup en DB), escrita **al crear el log**. Matchear por path JSONB no está indexado y hoy el valor
   ni siquiera existe al momento de crear la fila.
2. **Capturar el id antes de emitir.** Hoy nace *dentro* del builder. Los builders ya aceptan
   `base.ids.eventId`, así que el service puede generarlo, guardarlo en el log y pasarlo al envelope
   — sin cambiar el contrato Fire de salida.
3. **Path agregador → `PROCESSING`** (diferido por decisión). Mientras siga cerrando sincrónico, el
   `UPDATE … WHERE status='PROCESSING'` no encuentra filas y el callback responde siempre
   `updated: 0`.
4. **Aislamiento agregador ↔ `catalog_menus.sync_status`** — ⚠️ hallazgo: las filas del path agregador
   se crean con `entity_type: 'menus'` + `entity_id = menuId` + `vendor_id`, **idénticas** a las de
   X-MART. El aislamiento (`results.filter(r => !r.isAggregatorChannel)`) existe solo **en memoria**,
   no en DB. Consecuencias al pasar el path agregador a `PROCESSING`:
   - `findLatestMenuLogs` (input del recompute) **no filtra por canal** → las filas agregador
     empezarían a alimentar `catalog_menus.sync_status`, rompiendo el aislamiento vigente.
   - `findProcessingByVendor` (lock) filtra `entity_type='menus'` sin filtro de canal → las filas
     agregador empezarían a **bloquear** el sync del vendor.
   - Un callback **sin** `eventId` (barrido por vendor) cerraría también filas de agregador.
   → Hay que marcar el canal en la fila (columna o flag en `request_payload`) y decidir explícitamente
   si el estado del menú considera agregadores.
5. **Auth.** El emisor pasa a ser un tercero externo escribiendo estado por id, sobre una ruta hoy
   **sin auth** y llamada `/webhooks/xmart/…`. Definir: endpoint propio
   (`/api/v1/webhooks/aggregators/menu-sync-status`) y/o API key con scope, como ya hace
   `/api/v1/webhooks/aggregators/order-status` (`authenticateApiKeyRequest(request, 'webhooks:aggregator')`).
6. **Dedup real (opcional).** Existe infra transversal reusable: `InboundWebhookIngestService.ingest({
   eventId, sourceOfTruth })` + tabla `webhook_events` (unique `event_id`), ya usada por
   `kds/order-status`, `aggregators/order-status` y `fiscal/callback`. Este webhook no la usa: su
   idempotencia es *0 filas → no-op*, que no distingue duplicado de callback tardío.

### Fuera de alcance

- **X-MART**: no aplica. Si en el futuro se quiere granularidad fina también ahí, el candidato es
  `XMartSyncProductsResponse.requestId` — el type ya lo declara y el adapter lo recibe, pero el path
  de menú descarta la respuesta y no lo persiste. Requiere confirmar con X-MART que lo emite.
- **`groupId`**: descartado como llave de correlación (granularidad de tanda, no de terna).
