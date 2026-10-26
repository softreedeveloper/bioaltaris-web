import { defineMiddleware } from 'astro:middleware';
import { getSiteConfig } from '@utils/config';

/**
 * Cabeceras de seguridad para las respuestas que salen de la función SSR.
 * Las `[[headers]]` de netlify.toml solo aplican a archivos estáticos, no a
 * lo que responde la función; por eso las páginas las reciben aquí.
 */
const CABECERAS: Record<string, string> = {
   'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
   'X-Content-Type-Options': 'nosniff',
   'X-Frame-Options': 'SAMEORIGIN',
   'Referrer-Policy': 'strict-origin-when-cross-origin',
   'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), payment=()',
};

export const onRequest = defineMiddleware(async (context, next) => {
   const respuesta = await next();
   for (const [nombre, valor] of Object.entries(CABECERAS)) {
      if (!respuesta.headers.has(nombre)) respuesta.headers.set(nombre, valor);
   }

   const cfg = getSiteConfig(context.request);
   const esHtml = respuesta.headers.get('content-type')?.includes('text/html');

   if (!cfg.isProduction) {
      // Segunda barrera además del meta robots: cubre también endpoints y
      // archivos que no llevan <head> (previews, branch deploys).
      respuesta.headers.set('X-Robots-Tag', 'noindex, nofollow');
   } else if (esHtml && context.request.method === 'GET' && respuesta.status === 200) {
      // Las páginas no dependen del visitante (tema y consentimiento son de
      // cliente), así que el CDN de Netlify puede servirlas sin ejecutar la
      // función en cada visita. Cada deploy purga esta caché.
      // `?enviado=1` (contacto) y `?minimal=1` cambian el HTML: la caché
      // tiene que separar por query.
      respuesta.headers.set(
         'Netlify-CDN-Cache-Control',
         'public, durable, s-maxage=3600, stale-while-revalidate=86400',
      );
      respuesta.headers.set('Netlify-Vary', 'query');
   }
   return respuesta;
});
