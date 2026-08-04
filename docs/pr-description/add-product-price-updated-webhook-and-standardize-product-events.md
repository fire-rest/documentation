# PR Title

**EN:** `docs: add product.price_updated webhook and standardize product event payloads`
**ES:** `docs: agregar webhook product.price_updated y estandarizar payloads de eventos de producto`

---

## 📝 Descripción

Se documenta un nuevo evento webhook `product.price_updated`, que notifica cambios de precio (`priceInfo`) sin necesidad de reenviar el resto de los atributos del producto. Adicionalmente, se estandariza `product.availability_changed` para que soporte múltiples productos por evento, alineándolo con el patrón `products[]` ya usado en `product.updated` y en el nuevo `product.price_updated`.

El motivo es reducir el acoplamiento entre eventos de dominio distintos (precio, disponibilidad, datos generales) y evitar que un cliente downstream tenga que procesar payloads completos de producto cuando solo cambió el precio o la disponibilidad. También corrige inconsistencias detectadas entre los idiomas (EN tenía `"country": "6"` en vez de código ISO, y faltaba `timezone` en el ejemplo de PT).

**Funcionalidades:**

- Nuevo webhook `product.price_updated` (ES/EN/PT) — evento acotado que transmite solo `productId` + `priceInfo` por producto, soporta batch de productos y reutiliza la estructura `targets[]` de `product.updated`.
- `product.availability_changed` migrado de un único `productId`/`active` a nivel raíz hacia un array `products[]` (cada uno con `productId`, `vendorId`, `active`), permitiendo notificar disponibilidad de varios productos en un solo evento.
- Alta de las 3 páginas nuevas en la navegación de `docs.json` (en/es/pt), ubicadas entre `product-updated` y `product-availability-changed`.
- Corrección de bug de contenido: `country: "6"` → `country: "EC"` en el ejemplo EN de `product-availability-changed`; se agregó `timezone` faltante en el ejemplo PT.

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

`product.availability_changed` cambia de forma: los campos `productId`, `vendorId` y `active` se mueven de `data` (raíz) a `data.products[n]`. Cualquier cliente que ya integró este webhook en su forma anterior (single-product, campos planos) necesita actualizar su parser antes de este cambio de contrato tomar efecto en producción. Este PR es solo documentación (`.mdx` + `docs.json`); el cambio real de contrato en el emisor (Fire) debe coordinarse aparte con el equipo de backend antes de publicarse como comportamiento real.

## 🔗 Issues relacionados

Closes #…
Related to #…

---

## 📋 Checklist Pre-merge

- [x] He probado los cambios localmente (build de Mintlify / previsualización de las páginas)
- [ ] Los tests pasan (`pnpm test:unit`) — N/A, repo de documentación sin suite de tests
- [ ] TypeScript compila sin errores (`pnpm type-check`) — N/A, no aplica a contenido MDX
- [ ] Revisión de paridad EN/ES/PT completada por segundo revisor

## 🖼️ Screenshots (si hay cambios UI)

N/A — cambios de contenido de documentación (Markdown/MDX), sin componentes de UI propios.

## 📋 Notas para el revisor

- **Tests y cobertura:** No aplica — no hay suite de tests en este repo de documentación. Validación manual: revisar que los 3 JSON de ejemplo (en/es/pt) sean válidos y consistentes entre sí, y que los enlaces cruzados (`product-updated#datatargetsn`) apunten a anclas existentes tras cualquier futuro reordenamiento de esas páginas.
- **API (si aplica):** No hay cambios en contratos públicos de código — este PR documenta payloads de webhooks que Fire emite. El cambio de forma en `product.availability_changed` (single-product → `products[]`) es una decisión de diseño ya validada con el usuario en conversación; falta coordinar con el equipo que implementa el emisor real del evento para que el comportamiento en producción coincida con lo documentado aquí.
- **Pendientes conscientes:** confirmar mecanismo de firma de webhooks (`X-Fire-Signature`) y lista definitiva de estados de orden siguen pendientes (fuera de alcance de este PR, ver `CLAUDE.md`).
