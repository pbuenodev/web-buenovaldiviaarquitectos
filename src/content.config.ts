import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

// Cada obra es una carpeta `src/content/obras/<slug>/` con un `index.yaml` y sus fotos.
// El nombre de la carpeta es el identificador y el slug de la URL.
const obras = defineCollection({
  loader: glob({
    base: './src/content/obras',
    pattern: '*/index.{yaml,yml}',
    generateId: ({ entry }) => entry.split('/')[0]!,
  }),
  schema: z.object({
    nombre: z.string().min(1),
    ciudad: z.string().min(1),
    ubicacion: z.string().min(1),
    categoria: z.enum(['casas', 'edificios']),
    orden: z.number().int(),
    portada: z.string().min(1).optional(),
    carrusel: z
      .object({
        foto: z.string().min(1),
        orden: z.number().int(),
      })
      .optional(),
  }),
});

export const collections = { obras };
