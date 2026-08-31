# Contribuir a la documentación

Gracias por contribuir. Esta guía explica el flujo habitual y cómo respetar la **documentación en tres idiomas** (español, inglés y portugués).

## Idiomas del sitio

| Idioma     | Carpeta | Uso en `docs.json`      |
| ---------- | ------- | ------------------------ |
| Inglés     | `en/`   | Por defecto (`default`)  |
| Español    | `es/`   | `language`: `es`         |
| Portugués  | `pt/`   | `language`: `pt`         |

Las rutas públicas llevan prefijo: `/es/...`, `/en/...`, `/pt/...`.

## Qué hacer al cambiar contenido (flujo manual)

1. **Localiza o crea el mismo archivo** en `es/`, `en/` y `pt/`  
   Ejemplo: si editas `es/essentials/markdown.mdx`, actualiza también `en/essentials/markdown.mdx` y `pt/essentials/markdown.mdx`.

2. **Traduce** el texto visible (títulos, párrafos, etiquetas de componentes). Los **bloques de código** suelen mantenerse iguales salvo comentarios que deban traducirse.

3. **Frontmatter**: traduce `title` y `description` en cada idioma.

4. **Enlaces internos** en cada MDX deben usar el prefijo del idioma de esa página, por ejemplo en la versión en español: `href="/es/quickstart"`; en inglés: `href="/en/quickstart"`.

5. **Navegación**: si añades o renombras una página, edita **`docs.json`** en los tres bloques de `navigation.languages` (pestañas y grupos correspondientes) y mantén los nombres de grupo alineados con el idioma de cada bloque.

6. **Barra superior (Soporte + Panel / Support + Dashboard, etc.)**: mantén un **`navbar` en la raíz** (textos en inglés, idioma por defecto) **y** un **`navbar` por idioma** al **final** de cada entrada en `navigation.languages` (después del array `tabs`), con las etiquetas traducidas. Dos acciones: enlace de soporte (`mailto`) y botón al dashboard. Si cambias etiquetas o URLs, actualiza la raíz y los tres bloques de idioma.

7. **Fragmentos** (`snippets/`): si importas un snippet con texto visible, crea variantes por idioma o reutiliza uno neutro; alinea con lo descrito en `AGENTS.md`.

8. Antes de abrir el PR, en la raíz del repo ejecuta:

   ```bash
   mint validate
   mint broken-links
   ```

## Formas de contribuir

### Opción 1: Editar en GitHub

1. Abre el archivo en la rama por defecto.
2. Edita con el lápiz y crea una rama si te lo pide la UI.
3. Asegúrate de tocar **las tres rutas de idioma** si el cambio aplica a todo el sitio.
4. Abre un pull request.

### Opción 2: Desarrollo local

1. Haz fork y clona el repositorio.
2. Instala la CLI: `npm i -g mint`.
3. Crea una rama para tus cambios.
4. Edita los MDX en `es/`, `en/` y `pt/` según corresponda.
5. Ejecuta `mint dev` y revisa en `http://localhost:3000` (cambia de idioma con el selector del sitio).
6. `mint validate` y `mint broken-links`.
7. Commit y pull request.

Para detalles del entorno local, la guía equivalente está en las páginas `development` de cada idioma (por ejemplo `es/development.mdx`).

## Versionar un endpoint

Dos preguntas, en este orden.

### 1. ¿Hace falta una versión nueva?

**No**, si el cambio es aditivo: un campo más en la respuesta, un parámetro
opcional. Quien ya integra sigue funcionando sin enterarse.

**Sí**, si rompe una expectativa de quien ya integra. Dos formas típicas:

- El mismo campo pasa a traer otro valor. Es el caso de `fiscal-print`:
  `ambiente` pasó de `"2"` a `"PRODUCCION"`. El dato le cambia bajo los pies a
  quien ya lo lee.
- La respuesta puede dejar de traer algo que antes siempre venía. Es el caso de
  `fiscal/numbering`: en v2 una anulación que la política niega vuelve sin
  `document`, y un canal de v1 da por hecho que recibe números.

La forma puede seguir siendo compatible y aun así hacer falta una versión: lo que
manda es el comportamiento.

### 2. ¿La versión es del endpoint o de la API entera?

**Del endpoint** — cambia uno y el resto sigue igual. Es lo que tenemos hoy:
2 de 15 endpoints públicos tienen v2.

**De la API entera** — el contrato se mueve junto: el formato de errores, la
autenticación, el envelope de respuesta. El integrador pasa a estar «en v2» para
todo. Es lo que hacen Stripe y GitHub.

### Cómo se documenta cada caso

| Si la versión es… | Se documenta… |
|---|---|
| **de un endpoint** | Una página por versión, agrupadas en la navegación. Cada una con su propio `api:` en el frontmatter. |
| **de la API entera** | Con `versions` en `docs.json`, que parte el sitio y pone un selector arriba. |

**El `api:` es la razón de fondo** de que sean páginas separadas y no una sola con
los deltas marcados: apunta a UNA URL, así que con una página compartida el botón
«Pruébalo» ejercita v1 aunque estés leyendo v2.

**Por qué todavía no usamos el selector global**: diría «estás viendo la v2 de la
API» cuando 13 de 15 endpoints no tienen v2, y obligaría a duplicar el árbol de
navegación entero para que cambien dos páginas. El día que haya una versión del
contrato, ese selector es la respuesta correcta.

### El costo que hay que asumir

Dos páginas de un mismo endpoint comparten casi todo —headers, body, códigos de
estado— y **nada las compara**. Un cambio de contrato hay que llevarlo a las dos,
en los tres idiomas: **seis archivos**. Si no estás dispuesto a eso, no separes.

> Precedente distinto en este repo: `fiscal-print` documenta sus dos versiones en
> **una sola página**, con una sección «Two versions, both alive» y los campos
> marcados «Only in v2». Se hizo antes de que existiera esta regla. Funciona, pero
> su playground solo prueba v1.

## Guía de estilo (resumen)

- Voz activa: «Ejecuta el comando», no «El comando debe ejecutarse».
- Dirige al lector con «tú» o tratamiento acordado al producto.
- Frases cortas; una idea por frase.
- Empieza por el objetivo del usuario.
- Terminología consistente entre idiomas (mismo concepto, traducción estable).
- Incluye ejemplos cuando ayuden.

Si tienes dudas sobre componentes Mintlify, consulta la [documentación de Mintlify](https://mintlify.com/docs).
