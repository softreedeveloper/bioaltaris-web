/**
 * Meta Conversions API — envío de eventos desde el servidor.
 *
 * Recibe el evento del navegador con su `event_id` y lo reenvía a Meta con el
 * mismo id, para que los dos se dedupliquen. Toda la PII se hashea en SHA-256
 * aquí: el token de acceso nunca sale del servidor y el cliente jamás manda
 * datos ya hasheados (no podría verificarse).
 *
 * A diferencia de la versión de Movapp, el CORS está restringido a los
 * dominios propios en vez de abierto con '*'.
 */

import crypto from 'node:crypto';

const ORIGENES_PERMITIDOS = [
   'https://bioaltaris.com',
   'https://www.bioaltaris.com',
   'https://stage.bioaltaris.com',
   'https://stage-bioaltaris.netlify.app',
   'http://localhost:7002',
];

/** Campos de user_data que Meta espera hasheados, y cómo normalizarlos antes. */
const CAMPOS_HASHEABLES = {
   em: (v) => v.trim().toLowerCase(),
   ph: (v) => v.replace(/\D/g, ''),
   fn: (v) => v.trim().toLowerCase(),
   ln: (v) => v.trim().toLowerCase(),
   ct: (v) => v.trim().toLowerCase().replace(/\s/g, ''),
   st: (v) => v.trim().toLowerCase(),
   zp: (v) => v.trim().toLowerCase(),
   country: (v) => v.trim().toLowerCase(),
};

function hash(valor) {
   return crypto.createHash('sha256').update(valor).digest('hex');
}

function corsHeaders(origin) {
   const permitido = ORIGENES_PERMITIDOS.includes(origin) ? origin : ORIGENES_PERMITIDOS[0];
   return {
      'Access-Control-Allow-Origin': permitido,
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      Vary: 'Origin',
   };
}

function extraerCookie(cookieHeader, nombre) {
   if (!cookieHeader) return undefined;
   const match = cookieHeader.match(new RegExp('(?:^|;\\s*)' + nombre + '=([^;]+)'));
   return match ? match[1] : undefined;
}

function json(statusCode, body, headers) {
   return {
      statusCode,
      headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
   };
}

export async function handler(event) {
   const origin = event.headers?.origin || event.headers?.Origin || '';
   const headers = corsHeaders(origin);

   if (event.httpMethod === 'OPTIONS') {
      return { statusCode: 204, headers, body: '' };
   }

   if (event.httpMethod !== 'POST') {
      return json(405, { error: 'Method not allowed' }, headers);
   }

   const { META_PIXEL_ID, META_ACCESS_TOKEN, META_TEST_EVENT_CODE, PUBLIC_SITE_ENV } = process.env;

   // Sin credenciales la CAPI simplemente no opera. Se responde 200 para que el
   // cliente no registre un error: el evento de navegador ya se envió y la
   // medición no está rota, solo incompleta.
   if (!META_PIXEL_ID || !META_ACCESS_TOKEN) {
      return json(200, { success: false, reason: 'capi_no_configurada' }, headers);
   }

   let payload;
   try {
      payload = JSON.parse(event.body || '{}');
   } catch {
      return json(400, { error: 'JSON inválido' }, headers);
   }

   const { event_name, custom_data, user_data, event_id, event_source_url } = payload;
   if (!event_name) {
      return json(400, { error: 'event_name requerido' }, headers);
   }

   const cookie = event.headers?.cookie || event.headers?.Cookie;

   const userData = {
      client_ip_address:
         (event.headers?.['x-nf-client-connection-ip'] ||
            event.headers?.['x-forwarded-for'] ||
            '')
            .split(',')[0]
            .trim() || undefined,
      client_user_agent: event.headers?.['user-agent'],
      fbc: extraerCookie(cookie, '_fbc'),
      fbp: extraerCookie(cookie, '_fbp'),
   };

   // Hashea los campos de PII que hayan llegado. Se aceptan como string o como
   // array (Meta admite varios valores por campo).
   if (user_data && typeof user_data === 'object') {
      for (const [campo, normalizar] of Object.entries(CAMPOS_HASHEABLES)) {
         const bruto = user_data[campo];
         if (bruto === undefined || bruto === null) continue;

         const valores = (Array.isArray(bruto) ? bruto : [bruto])
            .filter((v) => typeof v === 'string' && v.trim() !== '')
            .map((v) => hash(normalizar(v)));

         if (valores.length) userData[campo] = valores;
      }
   }

   for (const clave of Object.keys(userData)) {
      if (userData[clave] === undefined) delete userData[clave];
   }

   const pixelEvent = {
      event_name,
      event_time: Math.floor(Date.now() / 1000),
      action_source: 'website',
      event_source_url: event_source_url || event.headers?.referer || ORIGENES_PERMITIDOS[0],
      event_id: event_id || `server-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`,
      user_data: userData,
      custom_data: custom_data || {},
   };

   const metaPayload = { data: [pixelEvent], access_token: META_ACCESS_TOKEN };

   // El test_event_code hace que el evento aparezca en "Test Events" del Events
   // Manager en vez de contar como tráfico real. Solo fuera de producción.
   if (PUBLIC_SITE_ENV !== 'production' && META_TEST_EVENT_CODE) {
      metaPayload.test_event_code = META_TEST_EVENT_CODE;
   }

   try {
      const res = await fetch(`https://graph.facebook.com/v21.0/${META_PIXEL_ID}/events`, {
         method: 'POST',
         headers: { 'Content-Type': 'application/json' },
         body: JSON.stringify(metaPayload),
      });
      const result = await res.json();

      if (!res.ok) {
         console.error('Meta CAPI error', result);
         return json(502, { success: false, error: 'meta_api_error' }, headers);
      }

      return json(
         200,
         {
            success: true,
            event_id: pixelEvent.event_id,
            events_received: result.events_received ?? 1,
         },
         headers,
      );
   } catch (error) {
      console.error('Meta CAPI fallo de red', error);
      return json(502, { success: false, error: 'network_error' }, headers);
   }
}
