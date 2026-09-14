/**
 * JSON-LD del sitio.
 *
 * Reglas que sostienen este archivo:
 *  · Solo JSON-LD, emitido en el HTML de la respuesta SSR. Nunca desde un
 *    script de cliente: tiene que verse con `curl`.
 *  · Las URLs siempre absolutas — de ahí `abs()`.
 *  · Solo se declara schema de lo que existe visualmente en la página. Por eso
 *    los textos se importan de las mismas constantes que renderizan el markup,
 *    en vez de escribirse aquí una segunda vez.
 *  · La `description` de PAGE_SCHEMA es también la meta description por
 *    defecto de esa ruta (BaseLayout hace el fallback), así el copy no se
 *    escribe dos veces.
 */

import { getSiteConfig, type SiteConfig } from './config';
import { SERVICIOS, CATEGORIAS, getCategoria, type Servicio } from '@constants/servicios';
import { EQUIPO } from '@constants/equipo';

const CONTEXT = 'https://schema.org';

/** Convierte una ruta del sitio en URL absoluta. */
function abs(path: string | undefined, cfg: SiteConfig): string {
   if (!path) return cfg.canonicalUrl;
   if (/^https?:\/\//.test(path)) return path;
   return new URL(path, cfg.canonicalUrl).href;
}

/** Quita claves nulas para no emitir campos vacíos en el JSON-LD. */
function prune<T extends Record<string, unknown>>(obj: T): Partial<T> {
   return Object.fromEntries(
      Object.entries(obj).filter(([, v]) => {
         if (v === null || v === undefined || v === '') return false;
         if (Array.isArray(v) && v.length === 0) return false;
         return true;
      }),
   ) as Partial<T>;
}

/** "/servicios/" y "/servicios" son la misma página; "" es "/". */
function normalize(pathname: string | undefined): string {
   if (!pathname) return '/';
   const clean = pathname.replace(/\/+$/, '');
   return clean === '' ? '/' : clean;
}

// ---------------------------------------------------------------------------
// Generadores
// ---------------------------------------------------------------------------

export function generateOrganizationSchema(request?: Request) {
   const cfg = getSiteConfig(request);

   return prune({
      '@context': CONTEXT,
      '@type': 'Organization',
      '@id': `${cfg.canonicalUrl}/#organization`,
      name: cfg.site.name,
      legalName: cfg.business.legalName,
      url: cfg.canonicalUrl,
      description: cfg.site.description,
      email: cfg.contact.email,
      telephone: `+${cfg.contact.whatsapp}`,
      logo: {
         '@type': 'ImageObject',
         url: abs('/brand/bioaltaris-logo-512.png', cfg),
         width: 512,
         height: 512,
      },
      image: cfg.defaultImage,
      address: cfg.contact.address
         ? {
              '@type': 'PostalAddress',
              streetAddress: cfg.contact.address,
              addressLocality: cfg.contact.city,
              addressCountry: cfg.contact.country,
           }
         : undefined,
      areaServed: cfg.business.areaServed,
      knowsLanguage: cfg.business.availableLanguage,
      sameAs: [cfg.social.linkedin, cfg.social.instagram].filter(Boolean),
      contactPoint: {
         '@type': 'ContactPoint',
         contactType: cfg.business.contactType,
         email: cfg.contact.email,
         telephone: `+${cfg.contact.whatsapp}`,
         availableLanguage: cfg.business.availableLanguage,
      },
   });
}

export function generateWebSiteSchema(request?: Request) {
   const cfg = getSiteConfig(request);

   return {
      '@context': CONTEXT,
      '@type': 'WebSite',
      '@id': `${cfg.canonicalUrl}/#website`,
      name: cfg.site.name,
      url: cfg.canonicalUrl,
      description: cfg.site.description,
      inLanguage: cfg.site.language,
      publisher: { '@id': `${cfg.canonicalUrl}/#organization` },
   };
}

interface WebPageInput {
   type?: string;
   name: string;
   path: string;
   description?: string | null;
}

export function generateWebPageSchema(page: WebPageInput, request?: Request) {
   const cfg = getSiteConfig(request);

   return prune({
      '@context': CONTEXT,
      '@type': page.type || 'WebPage',
      name: page.name,
      url: abs(page.path, cfg),
      description: page.description || cfg.site.description,
      inLanguage: cfg.site.language,
      isPartOf: { '@id': `${cfg.canonicalUrl}/#website` },
      publisher: { '@id': `${cfg.canonicalUrl}/#organization` },
   });
}

export function generateBreadcrumbSchema(items: { name: string; path: string }[], request?: Request) {
   const cfg = getSiteConfig(request);

   return {
      '@context': CONTEXT,
      '@type': 'BreadcrumbList',
      itemListElement: [{ name: 'Inicio', path: '/' }, ...items].map((item, i) => ({
         '@type': 'ListItem',
         position: i + 1,
         name: item.name,
         item: abs(item.path, cfg),
      })),
   };
}

export function generateServiceSchema(servicio: Servicio, request?: Request) {
   const cfg = getSiteConfig(request);
   const categoria = getCategoria(servicio.categoria);

   return prune({
      '@context': CONTEXT,
      '@type': 'Service',
      name: servicio.titulo,
      url: abs(`/servicios/${servicio.slug}`, cfg),
      description: servicio.resumen,
      serviceType: cfg.business.serviceType,
      category: categoria.nombre,
      areaServed: cfg.business.areaServed,
      availableLanguage: cfg.business.availableLanguage,
      provider: { '@id': `${cfg.canonicalUrl}/#organization` },
      hasOfferCatalog: {
         '@type': 'OfferCatalog',
         name: `Alcance de ${servicio.titulo}`,
         itemListElement: servicio.alcance.map((item) => ({
            '@type': 'Offer',
            itemOffered: { '@type': 'Service', name: item },
         })),
      },
   });
}

/** Catálogo completo, para la página índice de servicios. */
export function generateServiceCatalogSchema(request?: Request) {
   const cfg = getSiteConfig(request);

   return {
      '@context': CONTEXT,
      '@type': 'ItemList',
      name: 'Catálogo de servicios de BioAltaris',
      numberOfItems: SERVICIOS.length,
      itemListElement: SERVICIOS.map((servicio, i) => ({
         '@type': 'ListItem',
         position: i + 1,
         name: servicio.titulo,
         url: abs(`/servicios/${servicio.slug}`, cfg),
      })),
   };
}

export function generatePersonSchemas(request?: Request) {
   const cfg = getSiteConfig(request);

   return EQUIPO.map((miembro) =>
      prune({
         '@context': CONTEXT,
         '@type': 'Person',
         name: miembro.nombre,
         jobTitle: miembro.area,
         description: miembro.bio,
         // `src` de ImageMetadata ya es la ruta emitida (/_astro/…hash.jpg).
         image: miembro.foto ? abs(miembro.foto.src, cfg) : undefined,
         worksFor: { '@id': `${cfg.canonicalUrl}/#organization` },
         alumniOf: miembro.credenciales.map((c) => ({
            '@type': 'EducationalOrganization',
            name: c.split(',').slice(1).join(',').trim() || c,
         })),
      }),
   );
}

interface ArticleInput {
   title: string;
   description: string;
   path: string;
   publishedTime: string;
   modifiedTime?: string;
   image?: string;
   tags?: string[];
}

export function generateArticleSchema(article: ArticleInput, request?: Request) {
   const cfg = getSiteConfig(request);

   return prune({
      '@context': CONTEXT,
      '@type': 'Article',
      headline: article.title,
      description: article.description,
      url: abs(article.path, cfg),
      mainEntityOfPage: abs(article.path, cfg),
      datePublished: article.publishedTime,
      dateModified: article.modifiedTime || article.publishedTime,
      inLanguage: cfg.site.language,
      image: article.image ? abs(article.image, cfg) : cfg.defaultImage,
      keywords: article.tags,
      author: { '@id': `${cfg.canonicalUrl}/#organization` },
      publisher: { '@id': `${cfg.canonicalUrl}/#organization` },
   });
}

// ---------------------------------------------------------------------------
// Mapa de páginas estáticas
// ---------------------------------------------------------------------------

interface PageSchemaEntry {
   name: string;
   /** <title> por defecto de la ruta (≤ 60 caracteres, keyword primero). */
   title?: string;
   /** Meta description por defecto de la ruta. null = usa la del sitio. */
   description: string | null;
   /** Label de la miga de pan. null = es la raíz. */
   breadcrumb: string | null;
   type?: string;
   build?: (request?: Request) => unknown[];
}

export const PAGE_SCHEMA: Record<string, PageSchemaEntry> = {
   '/': {
      name: 'BioAltaris — Consultoría biofarmacéutica',
      title: 'Consultoría biofarmacéutica en México | BioAltaris',
      description:
         'Consultoría biofarmacéutica en México: bioensayos, modelos in vivo, caracterización analítica, estrategia regulatoria ante COFEPRIS y patentes. Hablemos.',
      breadcrumb: null,
      build: (request) => [
         generateWebSiteSchema(request),
         generateOrganizationSchema(request),
         generateServiceCatalogSchema(request),
      ],
   },
   '/servicios': {
      name: 'Servicios',
      title: 'Servicios de consultoría biofarmacéutica | BioAltaris',
      description: `${SERVICIOS.length} servicios en ${CATEGORIAS.length} etapas: evaluación preclínica, caracterización analítica y estrategia regulatoria para biológicos en México. Uno o el recorrido completo.`,
      breadcrumb: 'Servicios',
      type: 'CollectionPage',
      build: (request) => [
         generateWebPageSchema(
            {
               type: 'CollectionPage',
               name: 'Servicios',
               path: '/servicios',
               description: PAGE_SCHEMA['/servicios'].description,
            },
            request,
         ),
         generateServiceCatalogSchema(request),
         breadcrumbFor('/servicios', request),
      ],
   },
   '/nosotros': {
      name: 'Nosotros',
      title: 'Equipo científico biofarmacéutico en México | BioAltaris',
      description:
         'Doctores y maestros en ciencias (CINVESTAV, IPN, UNAM) en inmunología, farmacología y modelos preclínicos. Conoce al equipo de BioAltaris en México y hablemos.',
      breadcrumb: 'Nosotros',
      type: 'AboutPage',
      build: (request) => [
         generateWebPageSchema(
            {
               type: 'AboutPage',
               name: 'Nosotros',
               path: '/nosotros',
               description: PAGE_SCHEMA['/nosotros'].description,
            },
            request,
         ),
         ...generatePersonSchemas(request),
         breadcrumbFor('/nosotros', request),
      ],
   },
   '/conocimiento': {
      name: 'Impulsando el conocimiento',
      title: 'Novedades regulatorias y científicas | BioAltaris',
      description:
         'Novedades de COFEPRIS, FDA y EMA, publicaciones y avances en desarrollo biofarmacéutico seleccionados por el equipo de BioAltaris en México.',
      breadcrumb: 'Conocimiento',
      type: 'CollectionPage',
   },
   '/contacto': {
      name: 'Contacto',
      title: 'Contacto: inicia tu proyecto biofarmacéutico | BioAltaris',
      description:
         'Cuéntanos tu reto en desarrollo biofarmacéutico. Escríbenos por formulario, correo o WhatsApp y el equipo de BioAltaris en México te responde a la brevedad.',
      breadcrumb: 'Contacto',
      type: 'ContactPage',
   },
   '/aviso-de-privacidad': {
      name: 'Aviso de privacidad',
      title: 'Aviso de privacidad | BioAltaris',
      description:
         'Aviso de privacidad de BioAltaris: qué datos personales tratamos, con qué fin y cómo ejercer tus derechos ARCO.',
      breadcrumb: 'Aviso de privacidad',
   },
};

function breadcrumbFor(pathname: string, request?: Request) {
   const page = PAGE_SCHEMA[normalize(pathname)];
   if (!page?.breadcrumb) return generateBreadcrumbSchema([], request);
   return generateBreadcrumbSchema([{ name: page.breadcrumb, path: pathname }], request);
}

// ---------------------------------------------------------------------------
// API pública
// ---------------------------------------------------------------------------

export function getPageEntry(pathname: string): PageSchemaEntry | null {
   return PAGE_SCHEMA[normalize(pathname)] ?? null;
}

export function getPageSchema(pathname: string, request?: Request): unknown[] {
   const page = getPageEntry(pathname);
   // Rutas dinámicas (/servicios/[slug], /conocimiento/[slug]) pasan su schema
   // por prop del layout; aquí solo se cae al mínimo razonable.
   if (!page) return [generateOrganizationSchema(request)];

   if (page.build) return page.build(request);

   const route = normalize(pathname);
   return [
      generateWebPageSchema({ type: page.type, name: page.name, path: route, description: page.description }, request),
      ...(page.breadcrumb ? [breadcrumbFor(route, request)] : []),
   ];
}

export { breadcrumbFor };
