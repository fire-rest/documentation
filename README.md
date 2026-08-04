# FIRE Docs

Sitio de documentación del proyecto, generado con [Mintlify](https://mintlify.com). La configuración principal está en [`docs.json`](docs.json); el contenido vive en archivos MDX bajo `es/`, `en/` y `pt/`.

## Idiomas

El sitio está en **tres idiomas**:

| Idioma    | Carpeta | Notas                          |
| --------- | ------- | ------------------------------ |
| Inglés    | `en/`   | Idioma por defecto (`default`) |
| Español   | `es/`   |                                |
| Portugués | `pt/`   |                                |

Las rutas públicas usan prefijo: `/en/...`, `/es/...`, `/pt/...`.

## Contribuir

Para el flujo de trabajo, paridad entre idiomas, navegación y comprobaciones antes del PR, sigue **[CONTRIBUTING.md](CONTRIBUTING.md)**.

## Agentes e IA

Las reglas que deben seguir asistentes y agentes al editar esta documentación están en **[AGENTS.md](AGENTS.md)** (internacionalización obligatoria, `docs.json`, navbar, enlaces por idioma, etc.).

- **Cursor / reglas del workspace:** el repositorio puede incluir instrucciones en `.cursor/rules` o referencias a `AGENTS.md` según tu configuración; lo canónico para este proyecto es **`AGENTS.md`**.
- **Skills de Mintlify** (componentes, `docs.json`, flujo): en el repo hay skills en **`.claude/skills/`** y **`.agents/skills/`** (por ejemplo `mintlify`, `mintlify-docs`, `mintlify-api`). Para instalar la skill oficial en tu herramienta:

  ```bash
  npx skills add https://mintlify.com/docs
  ```

Guías de herramientas de IA en la propia documentación (idioma por defecto inglés): [en/ai-tools/cursor](/en/ai-tools/cursor), [es/ai-tools/cursor](/es/ai-tools/cursor), [pt/ai-tools/cursor](/pt/ai-tools/cursor).

## Desarrollo local

Instala la [CLI de Mintlify](https://www.npmjs.com/package/mint):

```bash
npm i -g mint
```

En la raíz del repositorio (donde está `docs.json`):

```bash
mint dev
```

Vista previa habitual: `http://localhost:3000`.

Antes de un cambio grande o un PR:

```bash
mint validate
mint broken-links
```

## Publicar cambios

Con el repositorio conectado a Mintlify, los cambios en la rama por defecto suelen desplegarse al hacer push. Ajustes de dominio e integración GitHub se gestionan en el [dashboard](https://dashboard.mintlify.com) de Mintlify.

## Suscripción al changelog

Los lectores pueden suscribirse desde el botón **Subscribe to updates** de la barra
superior o desde el formulario al inicio de `*/changelog.mdx`. El alta, el captcha, el
doble opt-in y la baja los gestiona [Buttondown](https://buttondown.com); este
repositorio no almacena ningún correo.

El formulario está escrito como JSX plano dentro de cada `*/changelog.mdx`, arriba de la
primera entrada. Se intentó factorizarlo a un snippet con props, pero el MDX de Mintlify
no renderizaba el resto de la página: cualquier contenido debajo del componente
importado desaparecía. Repetir el marcado en tres archivos es el precio de que funcione.

Al cambiar la URL de la lista hay que tocar los tres, más `docs.json`.

Cuando una entrada nueva llega a `main`, el workflow
[`changelog-newsletter.yml`](.github/workflows/changelog-newsletter.yml) toma la
sección `##` más reciente de `en/changelog.mdx` y la envía a la lista.

**EN es la fuente de disparo.** El workflow solo reacciona a cambios en
`en/changelog.mdx`; publicar primero en ES o PT no envía nada. Escribí siempre la
entrada en inglés en el mismo commit.

**Solo se envía si el título `##` más nuevo cambió.** Editar una entrada ya publicada
(una errata, un enlace roto) no vuelve a enviar el correo.

El formulario de suscripción queda por encima del primer `##`, así que nunca entra en
el cuerpo del correo.

### Configuración necesaria

En **Settings** del repositorio en GitHub:

| Tipo | Nombre | Valor |
| --- | --- | --- |
| Secret | `BUTTONDOWN_API_KEY` | Clave de API de Buttondown (Settings → Programming) |
| Variable | `DOCS_BASE_URL` | URL pública de la doc, p. ej. `https://docs.fire.rest` |

La lista en Buttondown es `fire-docs`, y ese nombre aparece en cuatro lugares:
`en/changelog.mdx`, `es/changelog.mdx`, `pt/changelog.mdx` (el `action` del formulario)
y `docs.json` (el link **Subscribe to updates** de la barra superior).

### Probar sin enviar

En la pestaña **Actions** → *Changelog newsletter* → **Run workflow**, con
`dry_run` activado: imprime el correo en el log sin enviarlo. El modo dry-run
renderiza la entrada más reciente aunque un envío real no la mandaría (por ser una
edición), para que siempre se pueda previsualizar. En local:

```bash
DRY_RUN=true DOCS_BASE_URL=https://docs.fire.rest node .github/scripts/send-changelog-email.mjs
```

## Ayuda

- [Documentación de Mintlify](https://mintlify.com/docs)
- Si el entorno local falla: `mint update` para actualizar la CLI.
- Si una página devuelve 404: comprueba que ejecutas `mint dev` en la carpeta que contiene un `docs.json` válido y que la página está listada en `docs.json`.
