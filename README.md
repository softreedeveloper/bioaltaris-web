# BioAltaris — sitio web

Sitio de la consultoría biofarmacéutica BioAltaris. Astro 5 en SSR con adapter de
Netlify, Tailwind 3, tema dark/light y medición con GTM + GA4 + Meta Pixel
(navegador y Conversions API).

La arquitectura está tomada del proyecto Movapp (`../../Movapp/AppMovapp/movapp-web`):
resolución de entorno por hostname, `PAGE_SCHEMA` para JSON-LD, endpoints de
`robots.txt`/`sitemap.xml`/`env-check.txt` y el patrón `pages → sections → constants`.

## Arrancar

```bash
npm install
cp .env.example .env      # rellenar
npm run dev               # http://localhost:7002
```

| Script | Qué hace |
|---|---|
| `npm run dev` | Servidor de desarrollo en el puerto 7002 |
| `npm run build` | Build de producción (función SSR de Netlify) |
| `npm run preview` | Sirve el build |
| `npm run check` | Type-check, incluidos los `.astro` |
| `npm run format` | Prettier |

## Variables de entorno

Todas en `.env.example`. Las que llevan prefijo `PUBLIC_` llegan al navegador;
el resto solo son legibles desde el servidor.

**Si un ID de tracking se deja vacío, ese script no se inyecta.** No hace falta
comentar código para desarrollar sin medición.

`N8N_WEBHOOK_URL` no lleva prefijo `PUBLIC_` a propósito: si se expusiera,
cualquiera podría inyectar leads falsos saltándose la validación del endpoint.

## Estructura

```
src/
├── constants/          Contenido como datos: servicios, fases, equipo, navegación
├── content/            Colección "conocimiento" (noticias en Markdown)
├── components/
│   ├── analytics/      GTM, GA4, Meta Pixel, Consent Mode
│   ├── layout/         Header, Footer, Logo, ThemeToggle
│   ├── decorative/     Campo de estrellas del hero
│   └── ui/             Tarjetas, formulario, migas, CTA
├── layouts/            BaseLayout: head SEO, JSON-LD, tracking, reveal
├── pages/              Rutas + endpoints (api/lead, sitemap, robots, env-check)
├── sections/           Bloques de página, agrupados por ruta
└── utils/              config (entorno + SEO), schema (JSON-LD), analytics
```

Las páginas no llevan markup pesado: componen secciones y les pasan datos de
`constants/`.

## Publicar una noticia

Crear un `.md` en `src/content/conocimiento/`. El nombre del archivo es la URL.

```markdown
---
titulo: 'Título de la noticia'
resumen: 'Una o dos frases. Se usa en el listado, la meta description y el JSON-LD.'
fecha: 2026-03-01
fuente: 'COFEPRIS'          # opcional
categorias: ['Regulatorio']
borrador: false             # true la oculta sin borrar el archivo
---

Cuerpo en Markdown.
```

Aparece sola en `/conocimiento`, en la home y en el sitemap.

## Añadir un servicio

Añadir una entrada a `SERVICIOS` en `src/constants/servicios.ts`. De ahí salen el
catálogo filtrable, la página de detalle `/servicios/[slug]`, el JSON-LD de tipo
`Service`, el sitemap y los enlaces del footer. `fases.ts` referencia servicios
por slug: si un slug deja de existir, el build falla en vez de dejar un hueco en
producción.

## Medición

```
<head>  ConsentMode → GTM → GA4        (Consent Mode v2 concedido por defecto,
                                       sin banner; debe ir primero igualmente)
<body>  noscript de GTM → Meta Pixel
```

Eventos que empuja el sitio al `dataLayer`:

| Evento | Dónde | Parámetros |
|---|---|---|
| `page_view` | Todas | `page_path`, `page_title`, `page_location` |
| `cta_iniciar_proyecto` | Cada CTA | `cta_location`, `cta_label` |
| `view_service` | `/servicios/[slug]` | `service_slug`, `service_name`, `service_category` |
| `filter_services` | `/servicios` | `filter_category`, `results_count` |
| `form_start` | Contacto | `form_name` |
| `generate_lead` | Contacto (envío correcto) | `form_name` |
| `scroll_depth` | Todas | `percent_scrolled` (25/50/75/100) |
| `click_externo` | Todas | `link_url`, `link_domain`, `link_text` |
| `cambio_tema` | Toggle | `theme` |

En Meta: `Lead` en los CTA y al enviar el formulario, `ViewContent` en el detalle
de servicio. Cada evento se envía por navegador y por Conversions API con el
**mismo `event_id`**, que es lo que permite a Meta deduplicarlos.

Consent Mode v2 arranca en `denied` y pasa a `granted` solo si el usuario acepta.

**`?minimal=1`** en cualquier URL apaga GTM, GA4 y el Pixel. Sirve para aislar el
coste de los terceros al medir rendimiento.

## Tema

Dark es el default: el `<html>` se sirve ya con `class="dark"` y un script inline
en el `<head>` solo la quita si el usuario eligió claro, así que no hay flash. Los
colores son custom properties en `src/styles/global.css`, declaradas como triplete
RGB para que los modificadores de opacidad de Tailwind (`bg-panel/50`) sigan
funcionando. El verde de marca se oscurece en el tema claro porque `#2FD699` sobre
blanco da 1.6:1; todos los pares de color pasan AA en ambos temas.

## Marca

El logotipo es `src/components/layout/Logo.astro` (isotipo SVG inline en
`Isotipo.astro` + wordmark en Inter); no hay archivo vectorial externo. Los
PNG de `public/` se generan desde `public/favicon.svg`:

```bash
node scripts/brand/generar-assets.mjs   # apple-touch-icon.png y brand/bioaltaris-logo-512.png
```

La imagen Open Graph (`public/og/bioaltaris-og.png`) se captura de la página
de desarrollo `/brand/og` (404 en producción) con Chrome headless; el comando
exacto está en la cabecera del script.

## SEO

- Canonical y `robots` se resuelven **por hostname en runtime**: un mismo build
  sirve producción y staging con los valores correctos. Staging y desarrollo
  emiten `noindex, nofollow` y un `robots.txt` con `Disallow: /`.
- El JSON-LD se emite en el HTML de la respuesta, nunca desde un script de
  cliente. Comprobar con:
  ```bash
  curl -s <URL> | grep -A 30 'application/ld+json'
  ```
- `PAGE_SCHEMA` (`src/utils/schema.ts`) es la fuente única: de ahí salen el JSON-LD,
  la meta description por defecto de cada ruta y el label de las migas de pan, de
  modo que no puedan divergir entre sí.
- El sitemap se genera desde `constants/servicios.ts` y la colección de contenido:
  no hay lista manual que se pueda quedar desfasada.
- `/env-check.txt` reporta el entorno resuelto y qué claves de tracking están
  presentes (nunca su valor).

## Despliegue

Netlify. `netlify.toml` define `PUBLIC_SITE_ENV` por contexto: `production` en el
principal y `staging` en `stage`, `branch-deploy` y `deploy-preview`. Las variables
de entorno se configuran en el panel de Netlify, no en el repo.

Tras el primer despliegue, actualizar en `src/utils/config.ts` las URLs de
producción y staging, y en `netlify/functions/meta-conversion.js` la lista
`ORIGENES_PERMITIDOS` del CORS.

## Pendiente de BioAltaris

- Dirección física (`contact.address` en `config.ts`; mientras esté vacía no se
  pinta el bloque ni se emite `PostalAddress` en el JSON-LD).
- URLs de LinkedIn e Instagram (`social` en `config.ts`; los enlaces vacíos no se
  renderizan).
- Dominio definitivo.
- Fotos del equipo: las publicadas salen de la diapositiva 5 del PPTX, que el propio
  cliente titula "Nuestro equipo (Las fotos serán otras)". Cuando lleguen las
  definitivas, sustituir los archivos de `src/assets/equipo/` conservando el nombre
  y el recorte cuadrado.
- Revisión legal del aviso de privacidad.
- Flujo de n8n que reciba el webhook de leads.
