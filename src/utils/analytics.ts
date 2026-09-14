/**
 * Capa de medición del lado del cliente.
 *
 * Movapp mide todos los clics con triggers de GTM apuntando al `id` del
 * elemento. Funciona, pero renombrar un id rompe el tag en silencio y no queda
 * rastro en el código. Acá los eventos se empujan explícitamente al dataLayer
 * desde el componente que los origina, y además se conserva la convención de
 * `id` para que los triggers por Element ID sigan siendo posibles.
 *
 * Este módulo se importa desde <script> de cliente, nunca desde el frontmatter.
 */

declare global {
   interface Window {
      dataLayer: Record<string, unknown>[];
      fbq?: (...args: unknown[]) => void;
      metaPixel?: {
         track: (
            event: string,
            customData?: Record<string, unknown>,
            userData?: Record<string, unknown>,
         ) => Promise<unknown>;
         trackPageView: (customData?: Record<string, unknown>) => Promise<unknown>;
      };
      metaPixelUtils?: {
         initMetaPixel: (pixelId: string) => void;
         trackEvent: (
            event: string,
            customData?: Record<string, unknown>,
            userData?: Record<string, unknown>,
         ) => Promise<string | undefined>;
         trackPageView: (customData?: Record<string, unknown>) => Promise<string | undefined>;
      };
   }
}

/** Empuja un evento al dataLayer. GTM lo recoge y lo reenvía a GA4. */
export function pushEvent(event: string, params: Record<string, unknown> = {}): void {
   if (typeof window === 'undefined') return;
   window.dataLayer = window.dataLayer || [];
   window.dataLayer.push({ event, ...params });
}

/**
 * Evento en Meta Pixel. Es seguro llamarlo aunque el pixel no haya cargado o
 * esté desactivado: simplemente no hace nada.
 */
export function trackMeta(
   event: string,
   customData: Record<string, unknown> = {},
   userData: Record<string, unknown> = {},
): void {
   if (typeof window === 'undefined' || !window.metaPixel) return;
   void window.metaPixel.track(event, customData, userData).catch(() => {
      /* la medición nunca debe romper la interacción del usuario */
   });
}

/** Clic en un CTA. `location` identifica desde qué sección se convirtió. */
export function trackCta(location: string, label: string): void {
   pushEvent('cta_iniciar_proyecto', { cta_location: location, cta_label: label });
}

/**
 * Clics en cualquier enlace de WhatsApp (`data-whatsapp="<ubicación>"`). Se
 * miden como lead igual que el CTA de contacto: el que abre el chat ya
 * convirtió aunque no llene el formulario.
 */
export function initWhatsAppLinks(): void {
   if (typeof window === 'undefined') return;

   document.addEventListener('click', (e) => {
      const link = (e.target as HTMLElement | null)?.closest?.<HTMLAnchorElement>('a[data-whatsapp]');
      if (!link) return;

      const location = link.dataset.whatsapp || 'desconocido';
      pushEvent('contacto_whatsapp', { cta_location: location });
      trackMeta('Contact', { content_name: `WhatsApp ${location}`, content_category: 'lead_generation' });
   });
}

/**
 * Profundidad de scroll en 25/50/75/100. Cada hito se emite una sola vez por
 * carga. Movapp no mide esto y es la señal más barata para saber si el
 * contenido largo de una página se está leyendo o se abandona arriba.
 */
export function initScrollDepth(): void {
   if (typeof window === 'undefined') return;

   const hitos = [25, 50, 75, 100];
   const alcanzados = new Set<number>();
   let pendiente = false;

   const medir = () => {
      pendiente = false;
      const alto = document.documentElement.scrollHeight - window.innerHeight;
      if (alto <= 0) return;

      const porcentaje = (window.scrollY / alto) * 100;
      for (const hito of hitos) {
         if (porcentaje >= hito && !alcanzados.has(hito)) {
            alcanzados.add(hito);
            pushEvent('scroll_depth', { percent_scrolled: hito });
         }
      }
      if (alcanzados.size === hitos.length) {
         window.removeEventListener('scroll', onScroll);
      }
   };

   const onScroll = () => {
      if (pendiente) return;
      pendiente = true;
      requestAnimationFrame(medir);
   };

   window.addEventListener('scroll', onScroll, { passive: true });
   medir(); // páginas cortas que ya están al 100% sin scrollear
}

/** Clics a dominios externos, para saber a dónde se fuga el tráfico. */
export function initOutboundLinks(): void {
   if (typeof window === 'undefined') return;

   document.addEventListener('click', (e) => {
      const link = (e.target as HTMLElement | null)?.closest?.('a');
      if (!link || !link.href) return;

      let url: URL;
      try {
         url = new URL(link.href, window.location.href);
      } catch {
         return;
      }
      if (url.protocol !== 'http:' && url.protocol !== 'https:') return;
      if (url.hostname === window.location.hostname) return;

      pushEvent('click_externo', {
         link_url: url.href,
         link_domain: url.hostname,
         link_text: (link.textContent || link.getAttribute('aria-label') || '').trim().slice(0, 100),
      });
   });
}
