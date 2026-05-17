import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

const chapter = defineCollection({
  loader: glob({ pattern: "**/*.mdx", base: "./src/content/chapter" }),
  schema: z.object({
    title: z.string(),
    slug: z.string(),
    order: z.number(),
    chapter: z.number(),
    summary: z.string(),
    sourceUrl: z.string().url(),
  }),
});

export const collections = { chapter };
