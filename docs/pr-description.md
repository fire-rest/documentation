Actúa como un Senior Backend Engineer y Tech Lead.

A partir del código modificado, el diff contra main del Pull Request y/o el resumen de cambios proporcionado,
redacta la descripción del Pull Request siguiendo **ESTRICTAMENTE** la estructura de salida definida abajo. Si algún criterio choca con secciones numeradas antiguas, **prevalece esta estructura y estos parámetros**.

---

## Estructura de salida obligatoria (Markdown)

Genera el cuerpo de la descripción usando **exactamente** estos encabezados y bloques, en este orden. Completa cada bloque según las instrucciones de la sección “Instrucciones por bloque”.

```markdown
## 📝 Descripción



**Funcionalidades:**

- …

## 🎯 Tipo de cambio

- [ ] 🐛 Bug fix (corrección de error)
- [ ] ✨ Nueva feature (funcionalidad nueva)
- [ ] 🔨 Refactor (mejora de código sin cambiar funcionalidad)
- [ ] 📚 Documentación
- [ ] 🧪 Tests
- [ ] 🔧 Configuración/DevOps

## 💥 Breaking Changes

- [ ] Este PR **NO** introduce breaking changes
- [ ] Este PR **SÍ** introduce breaking changes (detallar abajo)

## 🔗 Issues relacionados

Closes #…
Related to #…

---

## 📋 Checklist Pre-merge

- [ ] He probado los cambios localmente
- [ ] Los tests pasan (`pnpm test:unit`)
- [ ] TypeScript compila sin errores (`pnpm type-check`)

## 🖼️ Screenshots (si hay cambios UI)

| Antes | Después |
|-------|---------|
| … | … |

## 📋 Notas para el revisor

- …
```

---

### Instrucciones por bloque

**Título del Pull Request (previo al cuerpo, no es una sección del markdown anterior)**

- Genera un título conciso en inglés y español.
- Máximo 10–15 palabras.
- Debe reflejar el QUÉ y el PARA QUÉ del cambio, no solo el nombre de la rama.
- Formato recomendado: `[tipo]: <beneficio o mejora percibida> + <qué se controla o protege>`
- Escribe como si lo fuera a leer un Tech Lead o un PM, no solo un engineer.
- Prioriza el impacto sobre el mecanismo interno.

**📝 Descripción**

- Empieza con uno o dos párrafos cortos (descripción general + motivo); después del párrafo(s) viene el subtítulo **Funcionalidades** o, si el PR no es orientado a producto/UI, **Cambios clave:** con la misma lista con viñetas.
- Equivale a la antigua “Descripción General”: párrafo corto, claro, sin inventar alcance.
- Incorpora el **objetivo o motivo** (antes/después, impacto en rendimiento, confiabilidad o mantenibilidad) en el mismo apartado si cabe en pocas frases o bullets adicionales.
- Los **cambios principales** (por archivo, módulo o componente) deben resumirse en bullets bajo **Funcionalidades** / **Cambios clave**; indica QUÉ y POR QUÉ cuando sea relevante.

**🎯 Tipo de cambio**

- Infiere del diff; puede haber más de una opción marcada si aplica.

**💥 Breaking Changes**

- Si hay cambios en endpoints, payloads o contratos públicos, refléjalos aquí y en notas si hace falta ampliar.
- Si no hay cambios de contrato, marca explícitamente que **NO** hay breaking changes.

**🔗 Issues relacionados**

- Usa `Closes` / `Related to` solo si el contexto aporta números de issue; no inventes referencias.

**📋 Checklist Pre-merge**

- Sustituye comandos (`pnpm …`) por los que use el repositorio si el contexto los indica.
- La antigua “Checklist de Validación antes del Merge” queda **reemplazada** por esta lista; añade ítems equivalentes (documentación, revisión por pares) dentro del mismo bloque si el proyecto lo exige.

**🖼️ Screenshots**

- Solo para cambios visuales; si no hay UI, N/A explícito.

**📋 Notas para el revisor**

- **Tests y cobertura:** qué se añadió, modificó o validó; tipo (unitario, integración, mocks, manual); escenarios y retrocompatibilidad.
- **API (si aplica):** parámetros, validaciones, ejemplos breves; si no aplica, una línea: “No hay cambios en contratos públicos.”
- Pendientes conscientes, hooks existentes, decisiones de diseño.

### Reglas de formato y contenido

- Usa Markdown; emojis alineados con la plantilla.
- Mantén el texto conciso, técnico y claro.
- No inventes cambios que no estén en el código o el diff.
- No omitas secciones del template: si algo no aplica, indícalo explícitamente (N/A, checkbox sin marcar, etc.).

### Salida esperada (artefacto en disco)

- Escribe el resultado en un archivo Markdown bajo **`docs/pr-description/`**.
- Nombre del archivo: **`slug-reducido-del-titulo-ingles.md`** — el slug se obtiene del **título en inglés** del PR (no del nombre de la rama): minúsculas, palabras separadas por guiones, sin signos de puntuación ni caracteres especiales, sin prefijos tipo `feat/`; recorta palabras vacías innecesarias si el nombre queda muy largo, pero mantén el sentido.
  - Ej.: título en inglés `Add close-day dashboard with sales summary` → `docs/pr-description/add-close-day-dashboard-with-sales-summary.md`
- El archivo debe incluir **título + cuerpo completo** del Pull Request (el cuerpo sigue la estructura obligatoria anterior).
- Crea el directorio `docs/pr-description/` si no existe.
- NO presentes el contenido completo del PR por pantalla como respuesta de chat.
- Confirma al usuario la ruta absoluta o relativa del archivo creado una vez terminado.