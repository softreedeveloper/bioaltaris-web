/**
 * Meta Pixel — motor de eventos.
 *
 * Cada evento se envía dos veces: desde el navegador (fbq) y desde el servidor
 * (Conversions API). Ambos comparten el mismo `event_id`, que es lo que
 * permite a Meta deduplicarlos y no contar la conversión dos veces. El envío
 * de servidor recupera eventos que los bloqueadores de anuncios impiden.
 *
 * Se expone en window.metaPixelUtils; MetaPixelScript.astro lo inicializa.
 */
(function () {
   'use strict';

   var pixelInitialized = false;
   var capiEndpoint = '/.netlify/functions/meta-conversion';

   function generateEventId() {
      return Date.now() + '-' + Math.random().toString(36).slice(2, 11);
   }

   function initMetaPixel(pixelId) {
      if (typeof window === 'undefined' || pixelInitialized || !pixelId) return;

      /* Snippet oficial de Meta: crea la cola fbq y carga fbevents.js */
      !(function (f, b, e, v, n, t, s) {
         if (f.fbq) return;
         n = f.fbq = function () {
            n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments);
         };
         if (!f._fbq) f._fbq = n;
         n.push = n;
         n.loaded = true;
         n.version = '2.0';
         n.queue = [];
         t = b.createElement(e);
         t.async = true;
         t.src = v;
         s = b.getElementsByTagName(e)[0];
         s.parentNode.insertBefore(t, s);
      })(window, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js');

      window.fbq('init', pixelId);
      pixelInitialized = true;

      trackPageView();
   }

   function sendServerEvent(eventName, customData, userData, eventId) {
      return fetch(capiEndpoint, {
         method: 'POST',
         headers: { 'Content-Type': 'application/json' },
         body: JSON.stringify({
            event_name: eventName,
            custom_data: customData || {},
            user_data: userData || {},
            event_id: eventId,
            event_source_url: window.location.href,
         }),
         keepalive: true, // sobrevive a la navegación si el clic sale de la página
      })
         .then(function (res) {
            return res.ok ? res.json() : null;
         })
         .catch(function () {
            // Un fallo de la CAPI no debe romper nada: el evento de navegador
            // ya salió y es el que sostiene la medición.
            return null;
         });
   }

   function trackEvent(eventName, customData, userData) {
      if (typeof window === 'undefined') return Promise.resolve(undefined);

      var eventId = generateEventId();

      if (window.fbq) {
         window.fbq('track', eventName, customData || {}, { eventID: eventId });
      }

      return sendServerEvent(eventName, customData, userData, eventId).then(function () {
         return eventId;
      });
   }

   function trackPageView(customData) {
      if (typeof window === 'undefined') return Promise.resolve(undefined);

      var pageData = Object.assign(
         {
            page_title: document.title,
            page_url: window.location.href,
         },
         customData || {},
      );

      return trackEvent('PageView', pageData, {});
   }

   window.metaPixelUtils = {
      initMetaPixel: initMetaPixel,
      trackEvent: trackEvent,
      trackPageView: trackPageView,
      generateEventId: generateEventId,
   };

   // Avisa a quien esté esperando (ver MetaPixelScript.astro): evita depender
   // del orden entre este script diferido y DOMContentLoaded.
   document.dispatchEvent(new Event('metapixel:ready'));
})();
