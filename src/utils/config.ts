/**
 * Fuente única de verdad del sitio: identidad, URLs por entorno, datos de
 * contacto y generación de meta tags.
 *
 * El entorno NO se resuelve solo por variable de build, sino por el hostname
 * del request en runtime. Eso permite que un único build sirva production y
 * staging con canonical y robots correctos en cada uno, en vez de tener que
 * construir dos artefactos distintos.
 */

export const siteConfigData = {
   site: {
      name: 'BioAltaris',
      title: 'Consultoría biofarmacéutica',
      description:
         'Consultoría biofarmacéutica especializada en desarrollo preclínico, validación analítica, control de calidad y regulación de productos biológicos. Te acompañamos desde el laboratorio hasta el expediente regulatorio.',
      author: 'BioAltaris',
      locale: 'es_MX',
      language: 'es',
   },
   urls: {
      production: 'https://bioaltaris.com',
      staging: 'https://stage.bioaltaris.com',
      development: 'http://localhost:7002',
   },
   // Hostnames que deben tratarse como staging aunque PUBLIC_SITE_ENV diga otra cosa.
   stagingHostnames: ['stage-bioaltaris.netlify.app', 'stage.bioaltaris.com'],
   contact: {
      email: 'contacto@bioaltaris.com',
      // WhatsApp de contacto (México). `whatsapp` va en formato internacional
      // sin "+" ni espacios, que es el que exige wa.me; `whatsappDisplay` es
      // como se muestra en pantalla.
      whatsapp: '525534857570',
      whatsappDisplay: '+52 55 3485 7570',
      whatsappMensaje: 'Hola, BioAltaris. Me gustaría recibir más información sobre sus servicios.',
      // PENDIENTE: el PPTX dice "[Dirección de oficinas — pendiente de confirmar]".
      // Mientras esté vacío no se emite PostalAddress en el JSON-LD ni se
      // pinta el bloque de dirección en el footer.
      address: '',
      city: 'Ciudad de México',
      country: 'MX',
   },
   social: {
      // PENDIENTE: el PPTX menciona LinkedIn e Instagram pero no da las URLs.
      // Los enlaces vacíos no se renderizan.
      linkedin: '',
      instagram: '',
   },
   assets: {
      defaultOgImage: '/og/bioaltaris-og.png',
      favicon: '/favicon.svg',
   },
   business: {
      legalName: 'BioAltaris',
      serviceType: 'Consultoría biofarmacéutica y regulatoria',
      contactType: 'customer service',
      availableLanguage: ['Spanish', 'English'],
      areaServed: 'MX',
   },
   seo: {
      robots: {
         staging: 'noindex, nofollow',
         production: 'index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1',
      },
      themeColor: '#0C1526',
   },
} as const;

export type SiteEnv = 'production' | 'staging' | 'development';

function resolveEnv(hostname: string | null): SiteEnv {
   if (
      !hostname ||
      hostname === 'localhost' ||
      hostname.startsWith('localhost:') ||
      hostname.startsWith('127.') ||
      hostname.startsWith('192.168.')
   ) {
      return 'development';
   }

   if (siteConfigData.stagingHostnames.some((h) => hostname.includes(h))) {
      return 'staging';
   }

   const envVar = import.meta.env.PUBLIC_SITE_ENV;
   if (envVar === 'staging' || envVar === 'development') return envVar;

   return 'production';
}

function buildConfig(env: SiteEnv) {
   const isDev = env === 'development';
   const isStaging = env === 'staging';
   const isProduction = env === 'production';

   return {
      ...siteConfigData,
      environment: env,
      isDev,
      isStaging,
      isProduction,

      get siteUrl(): string {
         if (isStaging) return this.urls.staging;
         if (isDev) return this.urls.development;
         return this.urls.production;
      },
      get canonicalUrl(): string {
         return this.siteUrl;
      },
      /** Staging y dev nunca deben indexarse. */
      get noIndex(): boolean {
         return isStaging || isDev;
      },
      get robotsContent(): string {
         return isStaging || isDev ? this.seo.robots.staging : this.seo.robots.production;
      },
      get defaultImage(): string {
         return `${this.siteUrl}${this.assets.defaultOgImage}`;
      },
      /** Enlace a WhatsApp con el mensaje inicial ya escrito. */
      get whatsappUrl(): string {
         return `https://wa.me/${this.contact.whatsapp}?text=${encodeURIComponent(this.contact.whatsappMensaje)}`;
      },
   };
}

/** Config resuelta a partir del request (SSR). Es la que hay que usar en páginas. */
export function getSiteConfig(request?: Request) {
   const hostname = request ? new URL(request.url).hostname : null;
   return buildConfig(resolveEnv(hostname));
}

/** Config sin request, para módulos que se evalúan fuera del ciclo de una página. */
export const siteConfig = buildConfig(resolveEnv(null));

export type SiteConfig = ReturnType<typeof buildConfig>;

/**
 * Recorta un texto a `max` caracteres sin partir palabras, para titles
 * (~60) y descriptions (~160) que Google truncaría igual.
 */
export function recortar(texto: string, max: number): string {
   if (texto.length <= max) return texto;
   const corte = texto.slice(0, max - 1);
   const ultimoEspacio = corte.lastIndexOf(' ');
   return `${corte.slice(0, ultimoEspacio > max * 0.6 ? ultimoEspacio : max - 1).replace(/[\s,.;:]+$/, '')}…`;
}

export interface SEOProps {
   title?: string;
   description?: string;
   image?: string;
   type?: string;
   url?: string;
   author?: string;
   publishedTime?: string;
   modifiedTime?: string;
   noIndex?: boolean;
}

export function generateSEOTags(props: SEOProps = {}, request?: Request) {
   const cfg = getSiteConfig(request);

   const {
      title = `${cfg.site.name} — ${cfg.site.title}`,
      description = cfg.site.description,
      image = cfg.defaultImage,
      type = 'website',
      url = cfg.siteUrl,
      author = cfg.site.author,
      publishedTime,
      modifiedTime,
      noIndex = false,
   } = props;

   return {
      title,
      description,
      // La imagen puede venir como ruta relativa desde una página; el canonical
      // la resuelve a absoluta porque Open Graph no acepta rutas relativas.
      image: new URL(image, cfg.canonicalUrl).href,
      type,
      author,
      publishedTime,
      modifiedTime,
      canonical: new URL(url, cfg.canonicalUrl).href,
      robots: noIndex || cfg.noIndex ? 'noindex, nofollow' : cfg.robotsContent,
   };
}
