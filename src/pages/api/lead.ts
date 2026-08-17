import type { APIRoute } from 'astro';
import { z } from 'astro/zod';

/**
 * Recepción de leads del formulario "Iniciar proyecto".
 *
 * Reenvía a un webhook de n8n, que es quien decide qué hacer con el lead
 * (correo al equipo, CRM, notificación). La URL del webhook vive en
 * N8N_WEBHOOK_URL, sin prefijo PUBLIC_: si se expusiera al navegador
 * cualquiera podría inyectar leads falsos saltándose estas validaciones.
 *
 * Atiende dos formatos:
 *  · application/json  → respuesta JSON (envío con fetch desde el formulario)
 *  · form-urlencoded   → redirección (el mismo formulario sin JavaScript)
 */

export const prerender = false;

const requerido = (campo: string) => ({ required_error: `Falta ${campo}`, invalid_type_error: `Falta ${campo}` });

const esquema = z.object({
   nombre: z.string(requerido('el nombre')).trim().min(2, 'Nombre demasiado corto').max(120),
   email: z.string(requerido('el correo')).trim().email('Correo inválido').max(160),
   organizacion: z.string().trim().max(120).optional(),
   telefono: z.string().trim().max(40).optional(),
   mensaje: z.string(requerido('el mensaje')).trim().min(10, 'Cuéntanos un poco más').max(2000),
   privacidad: z.union([z.literal('on'), z.literal('true'), z.literal(true)], {
      errorMap: () => ({ message: 'Hay que aceptar el aviso de privacidad' }),
   }),
   // Honeypot. NO se valida con max(0) a propósito: si el esquema lo rechazara,
   // el bot recibiría un error y sabría que fue detectado. Se acepta cualquier
   // valor y el descarte ocurre más abajo, respondiendo un éxito falso.
   empresa_web: z.string().max(200).optional(),
});

/**
 * Límite por IP. La memoria no se comparte entre instancias de la función, así
 * que esto frena el abuso trivial pero no un ataque distribuido; para eso hace
 * falta rate limiting en el borde.
 */
const RATE_LIMIT = { maxIntentos: 5, ventanaMs: 10 * 60 * 1000 };
const intentos = new Map<string, number[]>();

function vigentes(ip: string, ahora: number): number[] {
   return (intentos.get(ip) ?? []).filter((t) => ahora - t < RATE_LIMIT.ventanaMs);
}

/** Comprueba el límite sin consumir cupo. */
function superaLimite(ip: string): boolean {
   return vigentes(ip, Date.now()).length >= RATE_LIMIT.maxIntentos;
}

/**
 * Registra un envío. Solo se llama con envíos ya validados: si contáramos
 * también los inválidos, alguien que se equivoca cinco veces al escribir su
 * correo quedaría bloqueado diez minutos. Un aluvión de payloads basura no
 * llega a hacer la petición saliente, así que sale barato.
 */
function registrarIntento(ip: string): void {
   const ahora = Date.now();
   const previos = vigentes(ip, ahora);
   previos.push(ahora);
   intentos.set(ip, previos);

   // Poda para que el Map no crezca sin control en instancias longevas
   if (intentos.size > 500) {
      for (const [clave, marcas] of intentos) {
         if (marcas.every((t) => ahora - t >= RATE_LIMIT.ventanaMs)) intentos.delete(clave);
      }
   }
}

const json = (status: number, body: Record<string, unknown>) =>
   new Response(JSON.stringify(body), {
      status,
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
   });

export const POST: APIRoute = async ({ request, clientAddress, redirect }) => {
   const contentType = request.headers.get('content-type') ?? '';
   const esJson = contentType.includes('application/json');

   const fallo = (status: number, error: string) =>
      esJson ? json(status, { ok: false, error }) : redirect(`/contacto?error=${encodeURIComponent(error)}`, 303);

   let datos: Record<string, unknown>;
   try {
      datos = esJson
         ? await request.json()
         : Object.fromEntries(await request.formData());
   } catch {
      return fallo(400, 'Solicitud inválida');
   }

   const ip = clientAddress || request.headers.get('x-nf-client-connection-ip') || 'desconocida';
   if (superaLimite(ip)) {
      return fallo(429, 'Demasiados envíos. Inténtalo más tarde.');
   }

   const parsed = esquema.safeParse(datos);
   if (!parsed.success) {
      const primero = parsed.error.issues[0];
      return fallo(400, primero?.message ?? 'Datos inválidos');
   }

   registrarIntento(ip);

   // El honeypot llegó relleno: es un bot. Se responde éxito a propósito para
   // no darle la señal de que fue detectado, pero no se reenvía nada.
   if (parsed.data.empresa_web) {
      return esJson ? json(200, { ok: true }) : redirect('/contacto?enviado=1', 303);
   }

   const webhook = import.meta.env.N8N_WEBHOOK_URL;
   if (!webhook) {
      console.error('N8N_WEBHOOK_URL no está configurada: el lead no se reenvió.');
      return fallo(500, 'El formulario no está disponible en este momento.');
   }

   const { nombre, email, organizacion, telefono, mensaje } = parsed.data;

   try {
      const res = await fetch(webhook, {
         method: 'POST',
         headers: { 'Content-Type': 'application/json' },
         body: JSON.stringify({
            nombre,
            email,
            organizacion: organizacion || null,
            telefono: telefono || null,
            mensaje,
            origen: 'bioaltaris-web',
            pagina: request.headers.get('referer') ?? null,
            recibido_en: new Date().toISOString(),
         }),
      });

      if (!res.ok) {
         console.error('n8n respondió', res.status, await res.text().catch(() => ''));
         return fallo(502, 'No pudimos registrar tu mensaje. Inténtalo de nuevo.');
      }
   } catch (error) {
      console.error('Fallo al contactar n8n', error);
      return fallo(502, 'No pudimos registrar tu mensaje. Inténtalo de nuevo.');
   }

   return esJson ? json(200, { ok: true }) : redirect('/contacto?enviado=1', 303);
};
