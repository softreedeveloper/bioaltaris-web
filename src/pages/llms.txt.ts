import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import { getSiteConfig } from '@utils/config';
import { CATEGORIAS, serviciosPorCategoria } from '@constants/servicios';
import { PAGE_SCHEMA } from '@utils/schema';

/**
 * llms.txt (https://llmstxt.org): índice en Markdown para asistentes de IA.
 * Sale de las mismas constantes que el sitemap y las páginas, así no se
 * desincroniza al añadir un servicio o un artículo.
 */
export const GET: APIRoute = async ({ request }) => {
   const cfg = getSiteConfig(request);
   const base = cfg.siteUrl.replace(/\/$/, '');
   const pagina = (path: string) => `${base}${path === '/' ? '' : path}`;

   const articulos = (await getCollection('conocimiento', ({ data }) => !data.borrador)).sort(
      (a, b) => b.data.fecha.getTime() - a.data.fecha.getTime(),
   );

   const servicios = CATEGORIAS.map(
      (cat) =>
         `### ${cat.nombre}\n\n` +
         serviciosPorCategoria(cat.id)
            .map((s) => `- [${s.titulo}](${pagina(`/servicios/${s.slug}`)}): ${s.resumen}`)
            .join('\n'),
   ).join('\n\n');

   const contenido = `# ${cfg.site.name}

> ${cfg.site.description}

Empresa con sede en ${cfg.contact.city}, México. Contacto: ${cfg.contact.email} · WhatsApp ${cfg.contact.whatsappDisplay}.

## Páginas principales

- [Inicio](${pagina('/')}): ${PAGE_SCHEMA['/'].description}
- [Servicios](${pagina('/servicios')}): ${PAGE_SCHEMA['/servicios'].description}
- [Conocimiento](${pagina('/conocimiento')}): ${PAGE_SCHEMA['/conocimiento'].description}
- [Contacto](${pagina('/contacto')}): ${PAGE_SCHEMA['/contacto'].description}

## Servicios

${servicios}

## Conocimiento

${articulos.map((a) => `- [${a.data.titulo}](${pagina(`/conocimiento/${a.id}`)}): ${a.data.resumen}`).join('\n')}
`;

   return new Response(contenido, {
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
   });
};
