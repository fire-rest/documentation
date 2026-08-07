# Checklist de capturas — Manuales BOH (provisional)

Archivo temporal: bórralo cuando todas las imágenes estén guardadas.

Las imágenes se comparten entre los 3 idiomas. Guárdalas exactamente con la ruta indicada (crear las subcarpetas bajo `images/manuals/boh/`). Formato PNG.

## admin-overview

- [ ] `images/manuals/boh/admin-overview/01-boh-home.png` — Dashboard de inicio del módulo BOH (`/boh/admin`), con el flujo de stock y accesos rápidos.
- [ ] `images/manuals/boh/admin-overview/02-boh-menu.png` — Sidebar con las secciones del menú BOH desplegadas (Catálogo, Recetas, Reportes, Abastecimiento, Movimientos).

## stores-suppliers

- [ ] `images/manuals/boh/stores-suppliers/01-stores-list.png` — Lista de tiendas BOH (`/boh/admin/stores`).
- [ ] `images/manuals/boh/stores-suppliers/02-store-form.png` — Formulario de creación de tienda con el selector de tienda de Restaurant OS (`/boh/admin/stores/new`).
- [ ] `images/manuals/boh/stores-suppliers/03-suppliers-list.png` — Lista de proveedores (`/boh/admin/suppliers`).
- [ ] `images/manuals/boh/stores-suppliers/04-supplier-item-link.png` — Formulario de vínculo ítem–proveedor con unidad de compra, precio y SKU (`/boh/admin/suppliers/{id}/items/new`).

## catalog

- [ ] `images/manuals/boh/catalog/01-units-list.png` — Lista de unidades agrupadas por grupo de unidad (`/boh/admin/units`).
- [ ] `images/manuals/boh/catalog/02-items-list.png` — Lista de ítems con filtros de tipo/proveedor/clasificación (`/boh/admin/items`).
- [ ] `images/manuals/boh/catalog/03-item-form.png` — Formulario de creación de ítem con unidad base y opciones de seguimiento (`/boh/admin/items/new`).
- [ ] `images/manuals/boh/catalog/04-item-tag.png` — Detalle de una etiqueta de ítems con miembros y estrategia de selección (`/boh/admin/item-tags/{id}`).
- [ ] `images/manuals/boh/catalog/05-classifications.png` — Pantallas de categorías y valores de clasificación (`/boh/admin/classifications/categories`).
- [ ] `images/manuals/boh/catalog/06-account-currency.png` — Pantalla de configuración de moneda de la cuenta (`/boh/admin/account/currency`), con el selector de moneda ISO 4217.

## recipes

- [ ] `images/manuals/boh/recipes/01-recipes-list.png` — Lista de recetas con filtro por tipo (`/boh/admin/recipes`).
- [ ] `images/manuals/boh/recipes/02-recipe-form.png` — Formulario de receta con líneas de consumo; incluye el campo `service_codes` en una línea de ejemplo (`/boh/admin/recipes/new`).
- [ ] `images/manuals/boh/recipes/03-recipe-detail.png` — Detalle de receta con historial de versiones y botón Publicar (`/boh/admin/recipes/{id}`).
- [ ] `images/manuals/boh/recipes/04-simulate-sale.png` — Simulador de venta: selector de tipo de servicio visible y la expansión de ingredientes resultante según el canal seleccionado (`/boh/admin/recipes/effective`).

## procurement

- [ ] `images/manuals/boh/procurement/01-schedules.png` — Lista de programaciones de recepción (`/boh/admin/procurement/schedules`).
- [ ] `images/manuals/boh/procurement/02-po-detail.png` — Detalle de orden de compra con líneas y acciones de ciclo de vida (`/boh/admin/procurement/orders/{id}`).
- [ ] `images/manuals/boh/procurement/03-suggested-order.png` — Pedido sugerido según niveles par y stock actual.

## goods-receipts-returns

- [ ] `images/manuals/boh/goods-receipts-returns/01-receipts-list.png` — Lista de recepciones (`/boh/admin/operations/goods-receipts`).
- [ ] `images/manuals/boh/goods-receipts-returns/02-receipt-form.png` — Formulario de recepción con líneas, unidades y costos (`/boh/admin/operations/goods-receipts/new`).
- [ ] `images/manuals/boh/goods-receipts-returns/03-return-form.png` — Formulario de devolución a proveedor con condición por línea (`/boh/admin/operations/supplier-returns/new`).

## waste-consumption

- [ ] `images/manuals/boh/waste-consumption/01-waste-reasons.png` — Catálogo de razones de merma (`/boh/admin/operations/waste-reasons`).
- [ ] `images/manuals/boh/waste-consumption/02-waste-form.png` — Formulario de merma con razón por línea (`/boh/admin/operations/waste-events/new`).
- [ ] `images/manuals/boh/waste-consumption/03-internal-consumption.png` — Formulario de consumo interno (`/boh/admin/operations/internal-consumptions/new`).

## transfers-production

- [ ] `images/manuals/boh/transfers-production/01-transfer-form.png` — Formulario de transferencia con tienda origen y destino (`/boh/admin/operations/transfers/new`).
- [ ] `images/manuals/boh/transfers-production/02-production-batch.png` — Formulario de lote de producción con output planificado y real (`/boh/admin/operations/production-batches/new`).

## stock-counts

- [ ] `images/manuals/boh/stock-counts/01-inventory-areas.png` — Lista de áreas de inventario de una tienda (`/boh/admin/operations/inventory-areas`).
- [ ] `images/manuals/boh/stock-counts/02-count-detail.png` — Detalle de conteo con diferencias contra el balance teórico (`/boh/admin/operations/stock-counts/{id}`).
- [ ] `images/manuals/boh/stock-counts/03-mobile-count.png` — Pantalla de sesión de conteo individual en la app móvil (`/count`): selector de tienda y entrada ítem por ítem.
- [ ] `images/manuals/boh/stock-counts/04-field-count-session.png` — Sesión de conteo colaborativo en la app móvil (`/count`): varios dispositivos visibles con sus áreas reclamadas, al menos un área marcada como "Área lista" y un participante en rol admin. Muestra el estado de la sesión (fase conteo o revisión).

## reports

- [ ] `images/manuals/boh/reports/01-reports-hub.png` — Hub de reportes (`/boh/admin/reports`).
- [ ] `images/manuals/boh/reports/02-usage-report.png` — Reporte de usos y consumos con desglose por tipo de movimiento (`/boh/admin/reports/inventory/usage`).
- [ ] `images/manuals/boh/reports/03-waste-report.png` — Reporte de mermas agrupado por razón (`/boh/admin/reports/inventory/waste`).
- [ ] `images/manuals/boh/reports/04-yield-report.png` — Reporte de rendimiento de producción (`/boh/admin/reports/inventory/yield`).
- [ ] `images/manuals/boh/reports/05-balance-at.png` — Balance histórico a una fecha (`/boh/admin/reports/inventory/at`).

**Total: 37 capturas.** (34 originales + 3 nuevas: `catalog/06-account-currency`, actualización de `recipes/02-recipe-form` y `recipes/04-simulate-sale` para reflejar channel-scoped lines, y `stock-counts/04-field-count-session`)

---

## Notas sobre capturas actualizadas

- **`recipes/02-recipe-form`** — re-capturar para mostrar el campo `service_codes` en al menos una línea del formulario.
- **`recipes/04-simulate-sale`** — re-capturar para que se vea el selector de tipo de servicio y cómo cambia la lista de ingredientes según el canal elegido.
- **`stock-counts/03-mobile-count`** — el nombre se mantiene igual; si la pantalla cambió para soportar las sesiones colaborativas, volver a capturar.
