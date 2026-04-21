# Instrucciones del proyecto de documentación

> Conocimiento del producto Mintlify (componentes, configuración, redacción): `npx skills add https://mintlify.com/docs`

## Sobre este proyecto

- Sitio de documentación con [Mintlify](https://mintlify.com).
- Las páginas son archivos MDX con frontmatter YAML.
- La configuración está en `docs.json`.
- Comandos útiles: `mint dev` (vista previa local), `mint broken-links`, `mint validate`.

## Internacionalización (obligatorio)

Este sitio tiene **tres idiomas**: **inglés (por defecto)**, **español** y **portugués**.

### Regla principal

Siempre que **añadas, edites o elimines** contenido de documentación:

1. **Replica el cambio en los tres idiomas** (`es/`, `en/`, `pt/`) con la **misma estructura de rutas** (mismos nombres de archivo y carpetas).
2. Si una página solo aplica a un idioma (excepcional), coméntalo en el PR y mantén paridad en `docs.json` solo donde corresponda; por defecto asume **paridad completa**.
3. Actualiza **`docs.json`** si cambias la navegación: cada idioma tiene su bloque en `navigation.languages` con sus pestañas (`tabs`) y listas de páginas.
4. **Barra superior (navbar)**: este sitio usa **dos capas** para que los botones se vean y se traduzcan: (a) un **`navbar` en la raíz** de `docs.json` con el idioma por defecto (inglés: Support + Dashboard); (b) otro **`navbar` al final de cada** bloque en `navigation.languages` (después de `tabs`), con **Support**/**Soporte**/**Suporte** (enlace `mailto`) y el botón **Dashboard**/**Panel**/**Painel** hacia el dashboard. **No** pongas el `navbar` *antes* de `tabs` en cada idioma: en el tema `mint` el orden comprobado es `footer` → `tabs` → `navbar`. Solo dos acciones: soporte y dashboard (sin enlace extra “Comenzar” a menos que el producto lo pida de nuevo).
5. En los MDX, usa enlaces internos con **prefijo de idioma**: `/es/...`, `/en/...`, `/pt/...` según el archivo donde estés.
6. Fragmentos reutilizables en `snippets/`: si el texto es visible para el usuario, valora **`snippet-intro.es.mdx`**, **`snippet-intro.pt.mdx`** y el **`snippet-intro.mdx`** base para inglés, o un solo snippet compartido si el contenido es idéntico en todos los idiomas.

### Estructura de carpetas

```text
en/index.mdx          → URL: /en/ (idioma por defecto)
es/index.mdx          → URL: /es/
pt/index.mdx          → URL: /pt/
```

Misma lógica para `quickstart`, `development`, `essentials/*`, `ai-tools/*`, `api-reference/*`.

### Idioma por defecto

El inglés es el idioma por defecto (`"language": "en"` y `"default": true` en `docs.json`). Las nuevas páginas deben existir al menos en **en**, y en condiciones normales también en **es** y **pt**.

## Terminología

_(Plantilla) Añade términos del producto y uso preferido. Ej.: usar "espacio de trabajo" y no "proyecto"._

## Estilo

- Voz activa y segunda persona ("tú" / "usted" según el tono del proyecto).
- Frases breves: una idea por frase.
- Títulos en estilo oración (sentence case) salvo convención contraria del proyecto.
- Negrita para elementos de interfaz: pulsa **Guardar**.
- Código inline para archivos, comandos, rutas y referencias técnicas.

## Límites del contenido

_(Plantilla) Define qué documentar y qué no. Ej.: no documentar funciones internas de administración._
