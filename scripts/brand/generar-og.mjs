/**
 * Genera las imágenes Open Graph por página a partir de la plantilla de
 * desarrollo /brand/og (ver src/pages/brand/og.astro):
 *
 *   npm run dev   (en otra terminal)
 *   node scripts/brand/generar-og.mjs
 *
 *   → public/og/servicios/<etapa>.jpg        una por etapa de servicios
 *   → public/og/conocimiento/<slug>.jpg      una por artículo publicado
 *
 * Los datos se leen de las mismas fuentes que las páginas (CATEGORIAS en
 * src/constants/servicios.ts y el frontmatter de src/content/conocimiento),
 * así que al publicar un artículo basta con volver a correr el script.
 */
import { execFileSync } from 'node:child_process';
import { mkdir, readFile, readdir, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import sharp from 'sharp';

const BASE = process.env.OG_BASE ?? 'http://localhost:7002';
const CHROME = process.env.CHROME ?? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const raiz = new URL('../../', import.meta.url).pathname;

/** Campos de texto `clave: '…'` dentro de un bloque. */
const campo = (bloque, clave) => bloque.match(new RegExp(`${clave}:\\s*'([^']*)'`))?.[1];

async function etapas() {
   const fuente = await readFile(join(raiz, 'src/constants/servicios.ts'), 'utf8');
   const bloque = fuente.slice(fuente.indexOf('export const CATEGORIAS'), fuente.indexOf('export const SERVICIOS'));
   return bloque
      .split(/\n\s{3}\{/)
      .slice(1)
      .map((b) => ({
         archivo: `servicios/${campo(b, 'id')}.jpg`,
         etiqueta: `Etapa ${campo(b, 'numero')} · Servicios`,
         titulo: campo(b, 'nombre'),
         lema: campo(b, 'lema'),
      }));
}

async function articulos() {
   const dir = join(raiz, 'src/content/conocimiento');
   const lista = [];
   for (const nombre of (await readdir(dir)).filter((n) => n.endsWith('.md'))) {
      const frontmatter = (await readFile(join(dir, nombre), 'utf8')).split('---')[1] ?? '';
      if (/^borrador:\s*true/m.test(frontmatter)) continue;
      const categorias = frontmatter.match(/^categorias:\s*\[([^\]]*)\]/m)?.[1].match(/'([^']+)'/g) ?? [];
      lista.push({
         archivo: `conocimiento/${nombre.replace(/\.md$/, '')}.jpg`,
         etiqueta: ['Conocimiento', ...categorias.slice(0, 1).map((c) => c.slice(1, -1))].join(' · '),
         titulo: campo(frontmatter, 'titulo'),
         lema: campo(frontmatter, 'fuente') ? `Fuente: ${campo(frontmatter, 'fuente')}` : '',
      });
   }
   return lista;
}

const tmp = join(tmpdir(), 'bioaltaris-og.png');

for (const { archivo, etiqueta, titulo, lema } of [...(await etapas()), ...(await articulos())]) {
   const url = `${BASE}/brand/og?${new URLSearchParams({ etiqueta, titulo, lema })}`;
   execFileSync(
      CHROME,
      [
         '--headless=new',
         '--hide-scrollbars',
         '--window-size=1200,630',
         '--virtual-time-budget=3000',
         `--screenshot=${tmp}`,
         url,
      ],
      { stdio: 'ignore' },
   );

   const destino = join(raiz, 'public/og', archivo);
   await mkdir(join(destino, '..'), { recursive: true });
   // JPEG y no PNG: la captura pesa ~250 KB y con paleta reducida los
   // degradados del fondo se ven punteados.
   await sharp(tmp).resize(1200, 630).jpeg({ quality: 85, mozjpeg: true }).toFile(destino);
   console.log(`public/og/${archivo}`);
}

await rm(tmp, { force: true });
