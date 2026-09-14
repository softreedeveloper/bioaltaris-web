/** Enlaces de navegación. Los consumen Header, menú móvil y footer. */

export interface NavLink {
   href: string;
   label: string;
}

export const NAV_LINKS: NavLink[] = [
   { href: '/servicios', label: 'Servicios' },
   { href: '/nosotros', label: 'Nosotros' },
   { href: '/conocimiento', label: 'Conocimiento' },
   { href: '/contacto', label: 'Contacto' },
];

/** CTA principal del sitio (header, hero, cierres). Cambiado a "Hablemos" en la revisión de septiembre de 2026. */
export const CTA_PRINCIPAL = {
   href: '/contacto',
   label: 'Hablemos',
};

export const FOOTER_LEGAL: NavLink[] = [{ href: '/aviso-de-privacidad', label: 'Aviso de privacidad' }];
