# Fire Documentation — Contexto del proyecto

## Qué es Fire
Fire es un OS para la gestión integral de restaurantes: tiendas, menús, productos y canales de venta (web, app, kioscos, agregadores).

## Modelo de integración (distinto a X-Mart)
- **X-Mart (anterior):** el integrador empujaba datos a X-Mart vía API
- **Fire (nuevo):** Fire es el sistema maestro que EMITE eventos (webhooks) y RECIBE órdenes

## Cliente (concepto clave)
El integrador se trata como un "cliente" genérico — cualquier sistema externo que necesite escuchar eventos de Fire puede hacerlo. NO usar "orquestador" como concepto central en la doc.
- El primer cliente real (Brasil) SÍ es un orquestador de múltiples agregadores, pero eso es solo un caso de uso.
- La doc debe reflejar que la integración es genérica: el cliente puede ser un orquestador, un POS, un sistema de analytics, etc.

## Arquitectura
Fire → Tu sistema (cliente) → (lo que sea downstream: agregadores, POS, etc.) — flujo de publicación
Tu sistema → Fire — para inyección de órdenes
Fire → Tu sistema — para notificaciones de estado de órdenes

## Flujo de webhooks (Fire emite)
- Fire emite eventos de publicación: tienda, menú, producto
- El payload incluye TODA la data embebida (misma estructura que X-Mart recibía)
- El evento indica a qué canales/agregadores hay que publicar
- El cliente obtiene identificadores de canal/servicio desde los webhooks de publicación o la configuración en el panel
- El cliente inyecta órdenes en un endpoint de Fire
- El payload debe incluir el canal de venta
- Fire notificará cambios de estado de la orden de vuelta al cliente

## Configuración de webhooks
- Desde el dashboard de Fire: contexto **Agregadores** → **Herramientas de desarrollo** → **Integraciones de agregadores** (endpoints, secretos, eventos de prueba)
- El cliente registra la URL de destino y la suscripción a eventos por integración

## Idioma
Trilingüe: inglés (EN), español (ES) y portugués (PT)

## Estructura de doc planificada
1. Get Started: Introduction, Key Concepts, Authentication, Quickstart
2. Configuration: Integraciones de agregadores (webhooks y pruebas)
3. Guides: Store Publication, Menu Publication, Product Publication, Order Injection, Order Status Notifications
4. Webhook Reference: Events Overview + payload de cada evento
5. API Reference: POST Orders

## Referencia
Doc anterior de X-Mart: https://docs.x-mart.io/ingles/introduction
Plataforma: Mintlify (MDX)

## API Reference — patrón REST en Mintlify
Las páginas de API reference usan el campo `api` en el frontmatter para activar el playground interactivo (igual al de X-Mart Docs con el botón "Try it"):

```yaml
---
title: "Inject order"
api: "POST https://api.fire.com/v1/orders"
description: "..."
authMethod: "bearer"
---
```

Reglas:
- Parámetros del body/query/path: componente `<ParamField body/query/path "nombre" type="tipo" required>`
- Campos de respuesta: componente `<ResponseField name="campo" type="tipo">`
- Auth: siempre `authMethod: "bearer"` — el playground añade automáticamente el header `Authorization: Bearer`
- NUNCA usar tablas markdown para documentar parámetros de API — siempre ParamField/ResponseField para que el playground los reconozca y pueda hacer el "Try it"
- Los objetos anidados se documentan con `<Expandable>` dentro del ParamField

## Eventos webhook — decisiones de diseño
- store/menu: full replacement (el payload es la config completa)
- product.updated: incremental — productos en el payload se crean/actualizan, nunca se borran
- product.availability_changed: activa/desactiva un producto (campo `active`)
- Para borrar un producto: enviar menu.updated completo sin ese producto
- Todos los eventos incluyen `account` y `country` en `data` (requeridos por sistemas downstream)
- product.updated y product.availability_changed usan `targets[]` — un solo evento cubre todas las tiendas afectadas
- stores.sync y menus.sync: batches de hasta 50 items, con batchIndex/batchTotal

## Changelog — usá la skill `changelog-entry`
Antes de escribir o editar una entrada en `*/changelog.mdx`, leé
`.claude/skills/changelog-entry/SKILL.md`: formato, tono, cuándo advertir y las reglas
del correo. Lo de abajo es el resumen mínimo.

## Changelog — el formato dispara correos, no lo rompas
Al publicar una entrada en `*/changelog.mdx` hay un envío de email atrás
(`.github/workflows/changelog-newsletter.yml`). Reglas que el script asume:

- **La entrada nueva va arriba de todo, con `## ` de primer nivel.** El script toma
  desde el primer `## ` hasta el siguiente; el título en inglés es el asunto del correo.
- **Un solo correo lleva los tres idiomas.** `en/changelog.mdx` decide si sale; ES y PT
  se suman solo si su propia entrada también cambió en ese commit. Escribí las tres
  versiones juntas o las traducciones se pierden ese envío.
- **Cambiar el título `## ` de una entrada ya publicada reenvía el correo.** Para
  corregir una errata, editá el cuerpo, nunca el título.
- **Nada de contenido nuevo por encima del primer `## `** — ahí vive el formulario de
  suscripción y todo lo que esté ahí queda fuera del correo.
- Solo `<Note>/<Warning>/<Info>/<Tip>/<Check>` sobreviven la conversión a Markdown
  (pasan a blockquote). Cualquier otro componente pierde el tag y conserva el texto.

## Pendiente para construir payloads
- Lista definitiva de estados de orden (order.status_changed)
- Confirmación de mecanismo de firma de webhooks (X-Fire-Signature)
- Confirmación de base URL de la API de Fire
