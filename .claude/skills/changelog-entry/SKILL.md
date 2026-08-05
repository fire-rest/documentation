---
name: changelog-entry
description: Escribir una entrada del changelog de Fire Docs en EN/ES/PT. Usar siempre que haya que anunciar un cambio de API, de evento, una guía nueva o un manual — y antes de tocar en|es|pt/changelog.mdx. Cubre formato, tono, cuándo advertir y las reglas del correo que se dispara.
---

# Escribir una entrada del changelog

## Lo primero: esto manda un correo

`en|es|pt/changelog.mdx` no es solo una página. Al llegar a `main`, el workflow
`changelog-newsletter.yml` arma un correo con los tres idiomas y lo manda a la lista de
suscriptores. De ahí salen cuatro reglas que no son de estilo, son de mecánica:

1. **La entrada nueva va arriba de todo.** El script toma la primera sección `## ` del
   archivo. Si la insertás en el medio, se manda la que no es.
2. **El título `## ` es el asunto del correo.** Sin título no hay asunto: una entrada
   que solo diga la fecha manda un correo con una fecha pelada.
3. **Cambiar el título de una entrada ya publicada reenvía el correo.** Para corregir
   una errata, editá el cuerpo. Nunca el título.
4. **Los tres idiomas van en el mismo commit.** Inglés decide si el correo sale; ES y PT
   entran solo si su propia entrada también cambió en ese commit. Si traducís después,
   esos lectores se pierden la novedad.

Nada nuevo por encima del primer `## ` — ahí vive el bloque de suscripción.

## Formato

```mdx
## 2 August 2026 — `order.opened` and the deferred-payment blocks

<Una o dos oraciones: qué cambió y a quién le importa. Sin preámbulo.>

- **`campo.exacto`** — qué es, qué hace, qué tiene que hacer el lector.
- **[Nombre de la guía](/en/guides/slug)** — de qué trata.

Updated in **EN / ES / PT**.
```

**Título:** `## <D Month YYYY> — <tema en 8 palabras o menos>`. La fecha primero para que
ordene bien; el tema para que el asunto del correo diga algo. Fecha en el idioma de cada
archivo (`2 de agosto de 2026` en ES y PT).

**Orden:** estrictamente del más nuevo al más viejo. Antes de commitear, mirá que la
fecha de arriba sea la mayor. Hoy el archivo tiene entradas de julio metidas entre las
de junio — no repitas eso.

## Qué entra

| Entra | No entra |
|---|---|
| Campos nuevos en un evento o endpoint | Refactors internos |
| Cambios de contrato y de versión | Correcciones de tipeo en la doc |
| Eventos nuevos o eliminados | Cambios de infraestructura sin efecto visible |
| Guías y manuales nuevos | Reordenar la navegación |
| Comportamiento que cambia lo que el lector debe hacer | Nada que el integrador no pueda notar |

El criterio: **¿un integrador tiene que hacer algo distinto, o entender algo nuevo?** Si
no, no va.

## Tono

Escribí para alguien que va a integrar, no para quien escribió el código.

- **Decí el efecto, no la implementación.** "Se dispara cuando la orden se inyecta ya
  abierta" gana a "se agregó un handler en el publisher".
- **Nombres exactos entre backticks.** `data.policy.deferredPayment`, no "el campo de
  política de pago".
- **Voz activa y presente.** "Lleva el mismo snapshot que `order.completed`."
- **Enlazá siempre** al evento, endpoint o guía que se menciona.
- **Sin relleno.** Nada de "Nos complace anunciar" ni "Como parte de nuestro esfuerzo".

### Versionado

Cada evento avanza en su propia línea de versión — no hay número de contrato global.
Cuando cambien varias, tabla:

```mdx
| Event | Version |
|---|---|
| [`order.opened`](/en/events/order-opened) | **v1** (new event, first version) |
| [`order.completed`](/en/events/order-completed) | v1 → **v1.1** |
```

Y decí explícitamente si es retrocompatible. Un agregado sobre un shape existente lo es;
cambiar el tipo o el significado de un campo que ya se lee, no.

## Cuándo advertir, y cuándo no

Esta es la parte que más se abusa. Una advertencia en cada entrada no advierte nada.

| Componente | Solo cuando |
|---|---|
| **`<Warning>`** | El lector puede **romper algo en producción** si no lo lee. Datos mal facturados, cobros mal aplicados, órdenes perdidas |
| **`<Note>`** | Existe **un** malentendido predecible y concreto sobre este cambio. Uno solo, el más común |
| **Nada** | Todo lo demás — que es la mayoría |

Referencia real: en 18 entradas el changelog usa **un** `<Note>`, y es para avisar que en
`order.opened` los medios de pago son lo declarado, no lo cobrado. Ese es el nivel.

Si algo es importante pero no peligroso, **ponelo en negrita dentro del texto**. No
necesita caja.

**Rompe compatibilidad:** empieza el ítem con `**Breaking** — ` y va primero, antes que
todo lo demás. Decí qué se rompe, por qué, y qué hay que hacer.

## Antes de commitear

- [ ] La entrada está arriba de todo, con `## `
- [ ] La fecha es la mayor del archivo
- [ ] El título dice el tema, no solo la fecha
- [ ] Existe en los tres idiomas, en este commit
- [ ] Los nombres de campos van entre backticks y coinciden con el código
- [ ] Todo lo mencionado está enlazado
- [ ] Cero `<Warning>` salvo riesgo real en producción; como mucho un `<Note>`
- [ ] Si rompe compatibilidad, dice `**Breaking**` y va primero
- [ ] Cierra con `Updated in **EN / ES / PT**.` (o su traducción)

Para previsualizar el correo antes de que salga:

```bash
DRY_RUN=true DOCS_BASE_URL=https://docs.fire.rest node .github/scripts/send-changelog-email.mjs
```

Solo `<Note>`, `<Warning>`, `<Info>`, `<Tip>` y `<Check>` sobreviven la conversión a
correo — pasan a cita. Cualquier otro componente pierde la etiqueta y conserva el texto.
