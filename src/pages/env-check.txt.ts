import type { APIRoute } from 'astro';
import { getSiteConfig } from '@utils/config';

/**
 * Diagnóstico de despliegue: en qué entorno se resolvió esta respuesta y qué
 * URL base está usando. Sirve para confirmar de un vistazo que un deploy de
 * stage no se está anunciando como producción.
 *
 * Solo reporta si las claves de tracking están presentes, nunca su valor.
 */
export const GET: APIRoute = ({ request }) => {
   const cfg = getSiteConfig(request);

   // En producción no se expone: solo responde con la cabecera X-Env-Check
   // igual a ENV_CHECK_TOKEN (variable de entorno del servidor).
   if (cfg.isProduction) {
      const token = import.meta.env.ENV_CHECK_TOKEN;
      if (!token || request.headers.get('x-env-check') !== token) {
         return new Response('Not found', { status: 404, headers: { 'X-Robots-Tag': 'noindex' } });
      }
   }

   const lineas = [
      `PUBLIC_SITE_ENV : ${import.meta.env.PUBLIC_SITE_ENV ?? '(sin definir)'}`,
      `environment     : ${cfg.environment}`,
      `siteUrl         : ${cfg.siteUrl}`,
      `noIndex         : ${cfg.noIndex}`,
      `robots          : ${cfg.robotsContent}`,
      '',
      `GTM   configurado: ${Boolean(import.meta.env.PUBLIC_GTM_ID)}`,
      `GA4   configurado: ${Boolean(import.meta.env.PUBLIC_GA4_ID)}`,
      `Pixel configurado: ${Boolean(import.meta.env.PUBLIC_META_PIXEL_ID)}`,
      `n8n   configurado: ${Boolean(import.meta.env.N8N_WEBHOOK_URL)}`,
   ].join('\n');

   return new Response(lineas + '\n', {
      headers: { 'Content-Type': 'text/plain; charset=utf-8', 'X-Robots-Tag': 'noindex' },
   });
};
