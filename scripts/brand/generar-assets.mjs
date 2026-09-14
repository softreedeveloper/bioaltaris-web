/**
 * Genera los PNG de marca a partir de public/favicon.svg (el isotipo con
 * fondo de marca), usando el `sharp` que ya trae Astro:
 *
 *   node scripts/brand/generar-assets.mjs
 *
 *   → public/apple-touch-icon.png          180×180
 *   → public/brand/bioaltaris-logo-512.png  512×512 (Organization.logo)
 *
 * La imagen Open Graph (public/og/bioaltaris-og.png) lleva el wordmark en
 * Inter, que sharp no puede tipografiar sin la fuente instalada; se captura
 * desde la página de desarrollo /brand/og con Chrome headless:
 *
 *   npm run dev   (en otra terminal)
 *   "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" \
 *     --headless=new --hide-scrollbars --window-size=1200,630 \
 *     --screenshot=public/og/bioaltaris-og.png http://localhost:7002/brand/og
 */
import { readFile, mkdir } from 'node:fs/promises';
import sharp from 'sharp';

const svg = await readFile(new URL('../../public/favicon.svg', import.meta.url));

await mkdir(new URL('../../public/brand/', import.meta.url), { recursive: true });

await sharp(svg, { density: 384 }).resize(180, 180).png().toFile('public/apple-touch-icon.png');
await sharp(svg, { density: 384 }).resize(512, 512).png().toFile('public/brand/bioaltaris-logo-512.png');

console.log('apple-touch-icon.png y brand/bioaltaris-logo-512.png generados');
