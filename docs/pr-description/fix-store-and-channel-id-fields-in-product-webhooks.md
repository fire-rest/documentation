# Fix `storeId`/`channelId` field docs and move `vendorId`/`timezone` to `targets` in product webhooks

# Corregir documentación de `storeId`/`channelId` y mover `vendorId`/`timezone` a `targets` en webhooks de producto

## 📝 Descripción

Corrige la referencia de webhooks de `product.updated`, `product.price_updated` y `product.availability_changed` para reflejar la convención real de ids que usa XMART Backoffice como emisor: `storeId` y `channelId` en `data.targets[]` son ids **internos** de la plataforma (PK `stores.id` / `channels.id`), no el `store_number` ni el `channel_id` externo del agregador. La doc anterior describía estos campos incorrectamente y usaba ejemplos con el UUID externo de X-MART, lo que podía inducir a integradores a mapear mal estos campos contra sus propios sistemas.

De forma adicional, se corrigió una inconsistencia previa: `vendorId` aparecía repetido dentro de `data.products[n]` en `product.availability_changed` (mismo valor por producto) en vez de vivir a nivel de tienda. Se movió a `data.targets[n]`, junto a `storeId`/`storeName`, y se replicó esa misma estructura (incluyendo `timezone`) en los 3 eventos para que sean consistentes entre sí y con `menu.updated`.

**Funcionalidades:**

- `data.targets[n].storeId`: descripción corregida a "UUID interno de la tienda (PK `stores.id`)"; ejemplos JSON actualizados a UUIDs v4 de ejemplo en lugar de `"805"`/`"806"`
- `data.targets[n].channels[n].channelId`: descripción corregida a "UUID interno del canal (PK `channels.id`)"; ejemplo JSON actualizado a UUID interno en lugar del UUID externo de X-MART
- `vendorId` y `timezone` movidos/agregados a `data.targets[n]` en los 3 eventos (`product.updated`, `product.price_updated`, `product.availability_changed`), eliminados de `data.products[n]` en `product.availability_changed`
- Cambios replicados en los 9 archivos equivalentes (ES/EN/PT)

## 🎯 Tipo de cambio

- [ ] 🐛 Bug fix (corrección de error)
- [ ] ✨ Nueva feature (funcionalidad nueva)
- [ ] 🔨 Refactor (mejora de código sin cambiar funcionalidad)
- [x] 📚 Documentación
- [ ] 🧪 Tests
- [ ] 🔧 Configuración/DevOps

## 💥 Breaking Changes

- [ ] Este PR **NO** introduce breaking changes
- [x] Este PR **SÍ** introduce breaking changes (detallar abajo)

Este PR no cambia el contrato real del webhook (el emisor XMART Backoffice ya envía `storeId`/`channelId` como ids internos, y `vendorId` ya vive a nivel de tienda según logs de producción). Es una corrección documental para que la referencia coincida con el payload real. Sin embargo, cualquier integrador que haya interpretado literalmente la doc anterior (`storeId` = `store_number`, `channelId` = UUID externo) y construyó lógica de mapeo sobre esa base incorrecta deberá revisar su integración — de ahí el marcado como breaking a nivel de contrato documentado, aunque no haya cambio en el emisor.

## 🔗 Issues relacionados

N/A — no se referenciaron issues en la conversación de origen.

---

## 📋 Checklist Pre-merge

- [x] He probado los cambios localmente (revisión visual de los 9 archivos `.mdx`)
- [ ] Los tests pasan (`pnpm test:unit`) — N/A, repo de documentación sin suite de tests
- [ ] TypeScript compila sin errores (`pnpm type-check`) — N/A, no aplica a contenido MDX

## 🖼️ Screenshots (si hay cambios UI)

N/A — cambios de contenido en páginas de referencia Markdown/MDX, sin impacto visual de UI.

## 📋 Notas para el revisor

- **Tests y cobertura:** no aplica; cambio de documentación puro. Validación manual: se comparó `data.targets[n]` de los 3 eventos contra la estructura de `menu.updated`/`menu-updated-v2` para mantener consistencia de nombres y descripciones.
- **API (si aplica):** No hay cambios en contratos públicos de la API de Fire. Los ejemplos de UUID (`storeId`, `channelId`) son valores ilustrativos, no ids reales de ninguna tienda/canal en producción.
- **Fuente de verdad:** el ajuste se basó en un evento real capturado en `aggregator-event-receiver/logs/events.ndjson` (XMART_BACKOFFICE_HELPERS), donde `storeId: "1"` y `channelId: "ch-ifood"` confirman que son ids internos/slugs de la plataforma, no el `store_number` operativo ni el UUID externo del agregador.
- **Pendiente consciente:** se removió intencionalmente (a pedido del usuario) una nota explicativa que mencionaba la convención compartida con `menu.updated`, por ser información de contexto interno del equipo, no para consumo del integrador externo.
