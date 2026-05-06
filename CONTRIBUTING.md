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

## Guía de estilo (resumen)

- Voz activa: «Ejecuta el comando», no «El comando debe ejecutarse».
- Dirige al lector con «tú» o tratamiento acordado al producto.
- Frases cortas; una idea por frase.
- Empieza por el objetivo del usuario.
- Terminología consistente entre idiomas (mismo concepto, traducción estable).
- Incluye ejemplos cuando ayuden.

Si tienes dudas sobre componentes Mintlify, consulta la [documentación de Mintlify](https://mintlify.com/docs).
