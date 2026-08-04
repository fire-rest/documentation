# docs: Add Menu sync status webhook endpoint to API Reference (EN/ES/PT)
# docs: Agregar endpoint webhook Estado de sync de menú al API Reference (EN/ES/PT)

## 📝 Descripción

Documenta el endpoint entrante **Menu sync status** (`POST /api/v1/webhooks/xmart/sync-status`) en el API Reference de Fire, en los tres idiomas del sitio (EN/ES/PT). Es el callback con el que el cliente/integrador reporta a Fire el resultado de la publicación asíncrona del menú/productos de un vendor, cerrando el ciclo que abre un evento de publicación con `autoPublish`.

El endpoint es **síncrono** (a diferencia del webhook de aggregator order status, que es asíncrono con cola + polling): Fire finaliza los sync logs pendientes del vendor, recomputa el `syncStatus` del menú y responde `200 OK` con la cantidad de filas finalizadas. La página sigue el molde existente del API Reference (frontmatter `api:` para activar el playground, `ParamField`/`ResponseField`, `ResponseExample`) y se agrega a la navegación justo después de `aggregator-order-status` en cada idioma.

**Cambios clave:**

- `en/api-reference/menu-sync-status.mdx` — nueva página (fuente): intro, 3 `Note` (síncrono, un status por vendor all-or-nothing, sin id de correlación), Autenticación (`x-api-key` vendor-scoped, scope `webhooks:xmart`), body (`vendorId` dotted, `type`, `status` enum SUCCESS/FAILED, `message`), tabla de semántica de `type`, "What Fire does" (finaliza → recompute PENDING/SYNCED/FAILED → libera lock), respuesta (`ok`/`updated`) con ejemplos 200/200-noop/400/401/403/500, idempotencia, `Warning` del lock por vendor indefinido, relación con `autoPublish`, cards relacionadas.
- `es/api-reference/menu-sync-status.mdx` — traducción ES (voseo rioplatense), espejando convenciones del aggregator; componentes en inglés, prosa traducida, anchors/links `/es/…`.
- `pt/api-reference/menu-sync-status.mdx` — traducción PT-BR, mismas convenciones, links `/pt/…`.
- `docs.json` — 3 entradas de navegación (una por idioma) tras `aggregator-order-status`.

Decisiones tomadas para alinear con el proyecto (el contrato interno de origen difería):
- Auth documentada como `x-api-key` vendor-scoped (`webhooks:xmart`) para consistencia con el resto del API Reference, en vez del "v1 sin auth" del contrato interno.
- Actores reenmarcados a vocabulario Fire ("tu cliente" hace POST a Fire), no X-MART/Backoffice.
- Detalle interno abstraído (sin nombres de tabla como `channel_sync_logs`), external-facing.

## 🎯 Tipo de cambio

- [ ] 🐛 Bug fix (corrección de error)
- [ ] ✨ Nueva feature (funcionalidad nueva)
- [ ] 🔨 Refactor (mejora de código sin cambiar funcionalidad)
- [x] 📚 Documentación
- [ ] 🧪 Tests
- [ ] 🔧 Configuración/DevOps

## 💥 Breaking Changes

- [x] Este PR **NO** introduce breaking changes
- [ ] Este PR **SÍ** introduce breaking changes (detallar abajo)

Solo agrega páginas de documentación y entradas de navegación. Aditivo — no modifica páginas existentes ni contratos.

## 🔗 Issues relacionados

N/A — no se aportaron números de issue en el contexto.

---

## 📋 Checklist Pre-merge

- [ ] Revisado localmente con `mint dev` (render y navegación correctos en EN/ES/PT)
- [ ] Sin enlaces rotos (`mint broken-links`)
- [ ] Paridad trilingüe verificada (misma estructura en EN/ES/PT)
- [ ] `docs.json` válido (JSON parseable) — verificado

> Repo de documentación (Mintlify/MDX): no aplican `pnpm test:unit` / `pnpm type-check`.

## 🖼️ Screenshots (si hay cambios UI)

N/A — cambio de contenido de documentación, sin cambios de UI de la aplicación. (Render de Mintlify; opcional adjuntar captura de la página en preview.)

## 📋 Notas para el revisor

- **Tests y cobertura:** N/A — repo de docs. Validación manual: `docs.json` parsea OK; estructura y anchors internos espejando `aggregator-order-status`.
- **API:** documenta un endpoint entrante existente. Puntos a confirmar contra el backend real antes de merge:
  1. **Auth** — la página documenta `x-api-key` vendor-scoped (`webhooks:xmart`); el contrato interno de origen indicaba "v1 sin auth". Confirmar cuál es el estado real del handler.
  2. **Base URL** — se usó `https://app.fire.rest` (igual que aggregator/fiscal/KDS). Get-store usa `https://api.fire.rest`. Confirmar host canónico para webhooks.
  3. **Path** — conserva `xmart` en la ruta (`/webhooks/xmart/sync-status`) por ser la ruta técnica real, aunque la prosa usa "cliente".
  4. **Códigos de error** — se agregaron `401`/`403` (por la decisión de auth); el contrato solo listaba `400`/`500`. No se incluyó `503` (aggregator sí lo tiene) — decidir si agregarlo por consistencia.
- **Pendiente:** una vez confirmados los puntos de arriba, ajustar los 3 idiomas en conjunto para mantener paridad.
