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
- El cliente necesita poder consultar los canales de Fire y hacer un mapeo (Fire recibe)
- El cliente inyecta órdenes en un endpoint de Fire
- El payload debe incluir el canal de venta
- Fire notificará cambios de estado de la orden de vuelta al cliente

## Configuración de webhooks
- Se configurará desde el dashboard de Fire > Settings > Endpoints
- El cliente registra su endpoint URL y credenciales

## Idioma
Trilingüe: inglés (EN), español (ES) y portugués (PT)

## Estructura de doc planificada
1. Get Started: Introduction, Key Concepts, Authentication, Quickstart
2. Configuration: Webhook Setup, Sales Channels (mapeo de IDs)
3. Guides: Store Publication, Menu Publication, Product Publication, Order Injection, Order Status Notifications
4. Webhook Reference: Events Overview + payload de cada evento
5. API Reference: POST Orders, GET Sales Channels

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

## Pendiente para construir payloads
- Lista definitiva de estados de orden (order.status_changed)
- Confirmación de mecanismo de firma de webhooks (X-Fire-Signature)
- Confirmación de base URL de la API de Fire
