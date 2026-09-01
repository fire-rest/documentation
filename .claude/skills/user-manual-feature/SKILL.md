---
name: user-manual-feature
description: Documentar un feature del backoffice en el manual de usuario (User manuals), en EN/ES/PT y con capturas de pantalla reales. Usar siempre que haya que explicar una pantalla a quien opera el negocio — antes de crear o editar cualquier archivo en en|es|pt/manuals/. Cubre estructura del documento, generación de capturas por script, navegación y verificación.
---

# Documentar un feature en el manual de usuario

Un manual de usuario no describe botones: explica **qué problema resuelve la pantalla** y
**cuáles son los errores que cuestan plata**. Quien lo lee opera el negocio, no escribe código.

Referencia viva hecha con esta skill: `en|es|pt/manuals/backoffice/price-lists.mdx`.

## Antes de escribir: usá el producto

No se puede documentar bien algo que no se usó. Antes de la primera línea:

- Abrí la pantalla en el backoffice local y hacé el flujo completo.
- Si tenés acceso al repo de la app, leé el módulo. El *porqué* de cada decisión suele estar
  en los comentarios del código, y es lo que convierte una descripción en una explicación.
- Anotá tres cosas: qué problema del negocio resuelve, qué errores caros puede cometer alguien,
  y qué **no** hace todavía.

Si algo no lo entendés (tiempos de publicación, permisos, qué pasa con una integración),
**preguntá**. No lo deduzcas: una frase inventada en un manual se convierte en una promesa
comercial que alguien va a tener que sostener.

## Estructura que funciona

En este orden. Cada sección tiene un motivo:

1. **Frontmatter** — `title` y `description` de una frase, orientada al beneficio.
2. **Apertura con el problema del negocio**, no con el feature. *"El mismo producto puede
   costar distinto en el local, en delivery o dentro de un combo — y sostener eso a mano es
   donde se pierde dinero."*
3. **"Lo mínimo que hay que saber"** — 3 puntos en un `<Note>`, para quien no va a leer todo.
4. **El camino simple** — el 80 % de la gente no necesita más. Cerralo con un `<Tip>` que diga
   explícitamente *"si tu caso es este, ya terminaste"*.
5. **Las funcionalidades**, de menor a mayor complejidad.
6. **Recetas** — `<AccordionGroup>` con 4-6 casos reales de negocio, resueltos en 4-6 pasos.
   Es lo que la gente busca: nadie busca "listas conectadas", busca "cómo subo el delivery".
7. **Un ejemplo trabajado con números** en tabla, antes/después. Es lo que hace clic.
8. **"Errores que salen caros"** — un `<Warning>` por cada uno, con la consecuencia concreta.
9. **Glosario** en tabla — para que producto, marketing y soporte usen las mismas palabras.
10. **Preguntas frecuentes** en `<AccordionGroup>`, empezando por la que más se va a buscar.
11. **"Lo que viene"** — lo que todavía NO existe. Si no está escrito, alguien lo va a prometer.

## Redacción

- **Español LATAM estándar. Nada de voseo rioplatense.** Verificalo antes de cerrar:
  ```bash
  grep -noE "\b(tenés|podés|querés|elegí|acá|seguís|editá|guardá|mirá|poné|hacé|empezá|vos)\b" es/manuals/**/*.mdx
  ```
- Nombres de la interfaz **en negrita**, tal como aparecen en pantalla.
- Ejemplos con **datos reales** del entorno (productos y precios que existen), no inventados.
- Componentes: `<Note>` para lo que hay que saber, `<Tip>` para atajos, `<Warning>` para lo que
  sale caro, `<Info>` para el porqué, `<Frame>` para capturas, `<AccordionGroup>` para recetas y FAQ.

## Capturas de pantalla

Las capturas se generan con un **script Playwright reproducible** que vive en el repo de la app
(`XMART_BACKOFFICE`), no acá: cuando la pantalla cambie se vuelve a correr y las imágenes quedan
al día solas. Base para copiar: `scripts/docs/capture-price-list-screenshots.ts`.

Las imágenes salen a `images/manuals/{grupo}/{slug}/NN-nombre.png` **de este repo** (el script
recibe la ruta por `DOCS_REPO_PATH` o `--out`).

### Trampas que ya costaron tiempo

- **El listado sale vacío** si el navegador no tiene el contexto de cuenta: vive en
  `localStorage` y hay que sembrarlo con `addInitScript` **antes** de navegar.
- **No esperes `tbody tr`**: los esqueletos de carga también son filas y capturás placeholders
  grises. Esperá contenido real con `waitForFunction` sobre el texto de las filas.
- **Igualá las capturas que ya existen.** Mirá una previa (`images/manuals/backoffice/fiscal/`)
  y replicá tema **oscuro**, UI en **inglés**, `deviceScaleFactor: 2`, viewport 1600×1000.
  Las imágenes se **comparten entre los tres idiomas**: por eso tienen que verse iguales.
- **Si lo importante está arriba de la tabla** (una barra de acciones), capturá la página
  entera. Un `screenshot` del selector `table` la deja afuera.
- **Si el script modifica datos** para lograr la captura, descartalos al final.
- Puede hacer falta `npx playwright install chromium`.

### Después de generar: miralas

Abrí cada imagen y verificá que no sea un esqueleto, que la pantalla tenga datos y que se vea
lo que el texto dice que se ve. Una captura equivocada es peor que ninguna.

### Insertarlas

```mdx
<Frame>
  <img src="/images/manuals/{grupo}/{slug}/02-nombre.png" alt="Descripción" />
</Frame>
```

El `src` **nunca** se traduce — solo el `alt`. Y si la captura reemplaza a un bloque de texto
ASCII que mostraba lo mismo, borrá el ASCII: no dupliques.

## Los tres idiomas

Paridad total, es regla del repo (ver `AGENTS.md`). Escribí primero el idioma en el que pensás
mejor y traducí después, manteniendo:

- Misma estructura: mismas secciones, mismo orden, mismos componentes.
- Fórmulas, código y números **sin cambiar**.
- Un glosario de términos definido de antemano y consistente en todo el archivo.

Si delegás la traducción en subagentes, pediles el archivo **completo en una sola escritura**:
las escrituras parciales sucesivas fallan a mitad y dejan el archivo roto.

Verificá la paridad:

```bash
for l in es en pt; do f="$l/manuals/{grupo}/{slug}.mdx"; \
  echo "$l: $(grep -c '^## ' $f) secciones · $(grep -c '<Frame>' $f) capturas · $(grep -c '<Accordion ' $f) acordeones"; done
```

Los tres números tienen que coincidir en los tres idiomas.

## Navegación (`docs.json`)

Agregá la página al grupo correspondiente **en los tres bloques de idioma**.

> **No leas y reescribas el JSON** con `json.load` + `json.dump`: reformatea arrays que no
> tocaste y ensucia el diff con decenas de líneas. Hacé una inserción de texto quirúrgica.

```bash
git diff docs.json    # deben aparecer SOLO las líneas nuevas, una por idioma
python3 -c "import json;json.load(open('docs.json'))"
```

## Changelog

Todo manual nuevo se anuncia. Usá la skill **`changelog-entry`** — el formato dispara un correo
y tiene reglas de mecánica, no de estilo.

## Verificación final

Antes de decir que está listo:

```bash
# Las tres páginas responden
for l in en es pt; do
  echo "$(curl -s -L -o /dev/null -w '%{http_code}' "http://localhost:3002/$l/manuals/{grupo}/{slug}")  $l"
done
```

- [ ] Las tres URLs responden 200.
- [ ] Paridad estructural entre idiomas (el conteo de arriba).
- [ ] Todas las imágenes referenciadas existen en disco.
- [ ] Los enlaces internos del changelog responden 200.
- [ ] Sin voseo en el español.
- [ ] El documento dice explícitamente lo que el feature **no** hace.
