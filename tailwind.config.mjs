/**
 * Los colores no son literales: apuntan a custom properties definidas en
 * src/styles/global.css como triplete de canales RGB ("12 21 38"), no como
 * hex. Eso es lo que permite que los modificadores de opacidad de Tailwind
 * (bg-panel/50, text-muted/70) sigan funcionando y que un mismo token sirva
 * en dark y en light sin duplicar clases con el prefijo `dark:`.
 *
 * @type {import('tailwindcss').Config}
 */
export default {
   darkMode: 'class',
   theme: {
      extend: {
         colors: {
            bg: 'rgb(var(--bg) / <alpha-value>)',
            bg2: 'rgb(var(--bg-2) / <alpha-value>)',
            panel: 'rgb(var(--panel) / <alpha-value>)',
            text: 'rgb(var(--text) / <alpha-value>)',
            muted: 'rgb(var(--muted) / <alpha-value>)',
            accent: 'rgb(var(--accent) / <alpha-value>)',
            accent2: 'rgb(var(--accent-2) / <alpha-value>)',
            line: 'rgb(var(--line) / <alpha-value>)',
         },
         fontFamily: {
            sans: ['Inter Variable', 'Inter', 'Segoe UI', 'system-ui', 'sans-serif'],
            serif: ['Lora', 'Georgia', 'Times New Roman', 'serif'],
         },
         // Ritmo vertical único del sitio: cada <section> usa "py-section".
         spacing: {
            section: '4.5rem',
         },
         maxWidth: {
            content: '1200px',
            wide: '1350px',
         },
         boxShadow: {
            card: '0 10px 30px -10px rgb(0 0 0 / 0.5)',
            glow: '0 0 20px rgb(var(--accent) / 0.35)',
            'glow-lg': '0 0 40px rgb(var(--accent) / 0.4)',
         },
         letterSpacing: {
            eyebrow: '0.25em',
         },
         keyframes: {
            fadeUp: {
               '0%': { opacity: '0', transform: 'translateY(15px)' },
               '100%': { opacity: '1', transform: 'translateY(0)' },
            },
            spinSlow: {
               '0%': { transform: 'rotate(0deg)' },
               '100%': { transform: 'rotate(360deg)' },
            },
            slideUp: {
               '0%': { transform: 'translateY(100%)' },
               '100%': { transform: 'translateY(0)' },
            },
         },
         animation: {
            fadeUp: 'fadeUp 0.5s ease-out both',
            spinSlow: 'spinSlow 20s linear infinite',
            slideUp: 'slideUp 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards',
         },
      },
   },
   content: ['./src/**/*.{astro,html,js,jsx,ts,tsx,md,mdx}'],
   plugins: [],
};
