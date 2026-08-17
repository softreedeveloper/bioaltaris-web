import type { APIRoute } from 'astro';
import { getSiteConfig } from '@utils/config';

/**
 * robots.txt con conciencia de entorno: staging y desarrollo se bloquean
 * enteros para que nunca compitan en el índice con producción.
 */
export const GET: APIRoute = ({ request }) => {
   const cfg = getSiteConfig(request);
   const base = cfg.siteUrl.replace(/\/$/, '');

   const contenido = cfg.isProduction
      ? `User-agent: *
Allow: /

Sitemap: ${base}/sitemap.xml
`
      : `User-agent: *
Disallow: /
`;

   return new Response(contenido, {
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
   });
};
