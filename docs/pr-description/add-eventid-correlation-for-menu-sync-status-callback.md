# Add `eventId` correlation for menu sync-status callback / Añadir correlación por `eventId` al callback de sync status del menú

## 📝 Descripción

Documenta el nuevo campo opcional `eventId` en el endpoint `POST /v1/webhooks/xmart/sync-status`, que permite a integradores de canal agregador finalizar un único sync-log (store × canal × fulfillment) en vez del sweep vendor-wide por defecto. También actualiza la doc de respuestas para reflejar el envelope estándar de Fire (`success`/`data`) y el nuevo código `400 DOMAIN_ERROR` para fallos server-side durante el finalize/recompute, que antes se documentaba como `500`.

Este cambio es puramente de documentación (`.mdx`), replicado en los tres idiomas (EN/ES/PT) sobre `en|es|pt/api-reference/menu-sync-status.mdx`.

**Funcionalidades:**

- Nuevo `ParamField body="eventId"` (formato `evt_<12 hex>`), opcional, solo para canales agregadores; documenta el comportamiento de resolución de fila única vs. sweep por `vendorId`.
- Nuevo ejemplo de body `PRODUCTS — aggregator channel, single assignment failed (eventId)`.
- Actualiza sección "What Fire does" para reflejar la rama de resolución con/sin `eventId`.
- Actualiza `ResponseField` de `ok`/`updated` a `success`/`data.ok`/`data.updated`, agregando ejemplos de respuesta con el envelope anidado.
- Documenta `400 DOMAIN_ERROR` (retryable) como código para fallos de finalize/recompute, separado de `400 VALIDATION_ERROR` (no retryable) y de `500 INTERNAL_SERVER_ERROR`.
- Actualiza tabla de idempotencia/retries y agrega `<Warning>` explicando que "retry solo en 5xx" es insuficiente.
- Documenta comportamiento de `message` cuando `status` es `SUCCESS` (se ignora/limpia) vs. default genérico si se omite en `FAILED`.
- Actualiza sección "Correlation & the vendor lock" con la rama `eventId` vs. `vendorId`-only.
- Limpieza de redacción menor (reemplaza guiones largos "—" por comas/puntos en varios párrafos).

## 🎯 Tipo de cambio

- [ ] 🐛 Bug fix (corrección de error)
- [ ] ✨ Nueva feature (funcionalidad nueva)
- [ ] 🔨 Refactor (mejora de código sin cambiar funcionalidad)
- [x] 📚 Documentación
- [ ] 🧪 Tests
- [ ] 🔧 Configuración/DevOps

## 💥 Breaking Changes

- [x] Este PR **NO** introduce breaking changes

La doc refleja un contrato ya soportado por Fire (campo `eventId` opcional, envelope `success`/`data`, código `400 DOMAIN_ERROR`); no hay cambios de contrato introducidos por este PR en sí, solo se documenta el comportamiento actual de la API.

## 🔗 Issues relacionados

N/A — no se referencian issues en el contexto disponible.

---

## 📋 Checklist Pre-merge

- [ ] He probado los cambios localmente (preview de Mintlify)
- [ ] Los tests pasan — N/A, repo de documentación sin suite de tests
- [ ] TypeScript compila sin errores — N/A, repo de documentación sin TypeScript

## 🖼️ Screenshots (si hay cambios UI)

N/A — cambios de contenido `.mdx`, sin componentes visuales nuevos fuera de los ya soportados por Mintlify (`ParamField`, `ResponseField`, `Note`, `Warning`).

## 📋 Notas para el revisor

- **Tests y cobertura:** No aplica — cambio de documentación. Validación manual sugerida: renderizar las 3 páginas (`en`, `es`, `pt`) en el preview de Mintlify y confirmar que el playground ("Try it") reconoce el nuevo `ParamField body="eventId"` y los `ResponseField` anidados (`data.ok`, `data.updated`).
- **API (si aplica):** Se documenta el campo `eventId` (string, opcional, formato `evt_<12 hex>`) y el envelope de respuesta `{ success, data: { ok, updated } }`. Confirmar con backend que el código `400 DOMAIN_ERROR` y el comportamiento de `message` en `SUCCESS` (ignorado/limpiado) coinciden exactamente con la implementación actual antes de mergear, ya que este PR asume que esa es la fuente de verdad.
- Verificar consistencia de traducción ES/PT contra el texto EN, especialmente los nuevos bloques `<Note>`/`<Warning>` y la tabla de idempotencia.
