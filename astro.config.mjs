import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import netlify from '@astrojs/netlify';

export default defineConfig({
   // applyBaseStyles: false — la integración inyectaría su propia hoja con las
   // directivas @tailwind en cada página. El único punto de entrada de Tailwind
   // es src/styles/global.css, importado desde BaseLayout.astro.
   integrations: [tailwind({ applyBaseStyles: false })],

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
