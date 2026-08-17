import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import { getSiteConfig } from '@utils/config';
import { SERVICIOS } from '@constants/servicios';

/**
 * Sitemap generado desde las mismas fuentes que renderizan las páginas: el
 * catálogo de servicios y la colección de conocimiento. Movapp lo mantiene a
 * mano y se le quedaron rutas fuera; así no puede desincronizarse.
 */

interface Entrada {
   path: string;
   changefreq: string;
   priority: string;
   lastmod?: string;
}

const ESTATICAS: Entrada[] = [
   { path: '/', changefreq: 'monthly', priority: '1.0' },
   { path: '/servicios', changefreq: 'monthly', priority: '0.9' },
   { path: '/nosotros', changefreq: 'yearly', priority: '0.7' },
   { path: '/conocimiento', changefreq: 'weekly', priority: '0.8' },
   { path: '/contacto', changefreq: 'yearly', priority: '0.7' },
   { path: '/aviso-de-privacidad', changefreq: 'yearly', priority: '0.2' },
];

export const GET: APIRoute = async ({ request }) => {
   const base = getSiteConfig(request).siteUrl.replace(/\/$/, '');

   const articulos = await getCollection('conocimiento', ({ data }) => !data.borrador);

   const entradas: Entrada[] = [
      ...ESTATICAS,
      ...SERVICIOS.map((s) => ({
         path: `/servicios/${s.slug}`,
         changefreq: 'yearly',
         priority: '0.8',
      })),
      ...articulos.map((a) => ({
         path: `/conocimiento/${a.id}`,
         changefreq: 'yearly',
         priority: '0.6',
         lastmod: a.data.fecha.toISOString().split('T')[0],
      })),
   ];

   const urls = entradas
      .map(
         ({ path, changefreq, priority, lastmod }) => `
  <url>
    <loc>${base}${path}</loc>${lastmod ? `\n    <lastmod>${lastmod}</lastmod>` : ''}
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`,
      )
      .join('');

   const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls}
</urlset>`;

   return new Response(xml, {
      headers: { 'Content-Type': 'application/xml; charset=utf-8' },
   });
};
