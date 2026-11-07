import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import netlify from '@astrojs/netlify';

/**
 * Enlaces externos del Markdown (fuentes de los artículos de conocimiento) en
 * otra pestaña. Sin dependencia: recorre el árbol hast y marca los <a> cuyo
 * href es http(s).
 */
function enlacesExternosNuevaPestana() {
   const visitar = (nodo) => {
      if (nodo.type === 'element' && nodo.tagName === 'a' && /^https?:\/\//.test(String(nodo.properties?.href ?? ''))) {
         nodo.properties.target = '_blank';
         nodo.properties.rel = ['noopener', 'noreferrer'];
      }
      nodo.children?.forEach(visitar);
   };
   return (arbol) => visitar(arbol);
}

export default defineConfig({
   // applyBaseStyles: false — la integración inyectaría su propia hoja con las
   // directivas @tailwind en cada página. El único punto de entrada de Tailwind
   // es src/styles/global.css, importado desde BaseLayout.astro.
   integrations: [tailwind({ applyBaseStyles: false })],

   // Artículos retirados de Conocimiento → listado (301), para no dejar 404
   // en URLs que ya pudieron indexarse o compartirse.
   redirects: {
      '/conocimiento/cofepris-alianza-ops-oms-ue': { status: 301, destination: '/conocimiento' },
      '/conocimiento/fda-elimina-rems-car-t': { status: 301, destination: '/conocimiento' },
      '/conocimiento/sindrome-liberacion-citocinas-revision': { status: 301, destination: '/conocimiento' },
   },

   markdown: {
      rehypePlugins: [enlacesExternosNuevaPestana],
   },

   vite: {
      resolve: {
         alias: {
            '@': '/src/',
            '@components': '/src/components/',
            '@layouts': '/src/layouts/',
            '@sections': '/src/sections/',
            '@styles': '/src/styles/',
            '@assets': '/src/assets/',
            '@utils': '/src/utils/',
            '@constants': '/src/constants/',
         },
      },
   },

   // SSR: el canonical y robots.txt se resuelven por hostname del request, de
   // modo que un mismo build sirve production y staging con los valores
   // correctos (ver src/utils/config.ts).
   output: 'server',
   adapter: netlify(),

   // 'never': /servicios/ y /servicios serían dos URLs con el mismo contenido.
   // En SSR Astro responde 301 a la variante con barra final antes de enrutar.
   trailingSlash: 'never',

   // 'always': evita que Astro extraiga los <style> con scope de componente a
   // archivos _astro/*.css enlazados aparte, que Lighthouse marca como
   // solicitudes de bloqueo de renderización.
   build: {
      inlineStylesheets: 'always',
   },

   server: {
      port: 7002,
      headers: {
         'X-Frame-Options': 'SAMEORIGIN',
         'X-Content-Type-Options': 'nosniff',
         'Referrer-Policy': 'strict-origin-when-cross-origin',
      },
   },
});
