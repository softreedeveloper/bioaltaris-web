/**
 * IDs de medición leídos del entorno y validados por formato. Un valor de
 * ejemplo (`GTM-XXXXXXXXXX`, `G-XXXXXXXXXX`, `xxxxxxxx`) cuenta como ausente:
 * cargarlo descarga ~400 KB de scripts que no registran nada y deja errores
 * en consola. Así un .env de plantilla copiado a Netlify no degrada el sitio.
 */
const valido = (id: string | undefined, patron: RegExp): string | undefined => {
   const limpio = id?.trim();
   if (!limpio || !patron.test(limpio) || /X{4,}/i.test(limpio)) return undefined;
   return limpio;
};

export const GTM_ID = valido(import.meta.env.PUBLIC_GTM_ID, /^GTM-[A-Z0-9]{5,}$/);
export const GA4_ID = valido(import.meta.env.PUBLIC_GA4_ID, /^G-[A-Z0-9]{6,}$/);
// El Pixel de Meta es numérico (15–16 dígitos).
export const META_PIXEL_ID = valido(import.meta.env.PUBLIC_META_PIXEL_ID, /^\d{10,20}$/);
