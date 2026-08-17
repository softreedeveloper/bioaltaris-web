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

export const CTA_PRINCIPAL = {
   href: '/contacto',
   label: 'Iniciar proyecto',
};

export const FOOTER_LEGAL: NavLink[] = [{ href: '/aviso-de-privacidad', label: 'Aviso de privacidad' }];
