import { defineMiddleware } from 'astro:middleware';

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

export const onRequest = defineMiddleware(async (_context, next) => {
   const respuesta = await next();
   for (const [nombre, valor] of Object.entries(CABECERAS)) {
      if (!respuesta.headers.has(nombre)) respuesta.headers.set(nombre, valor);
   }
   return respuesta;
});
