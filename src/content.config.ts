import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

/**
 * "Impulsando el conocimiento": noticias regulatorias y publicaciones.
 * El PPTX pide que se actualice semanalmente, así que publicar tiene que ser
 * añadir un .md — sin tocar código ni desplegar nada más.
 */
const conocimiento = defineCollection({
   loader: glob({ pattern: '**/*.md', base: './src/content/conocimiento' }),
   schema: z.object({
      titulo: z.string(),
      // Resumen para el listado, la meta description y el JSON-LD.
      resumen: z.string(),
      fecha: z.coerce.date(),
      // Origen del contenido: publicación, agencia, revista…
      fuente: z.string().optional(),
      categorias: z.array(z.string()).default([]),
      // Oculta la entrada sin borrar el archivo.
      borrador: z.boolean().default(false),
   }),
});

export const collections = { conocimiento };
