import { defineCollection, z } from 'astro:content';

// Each project is a markdown/mdx file in src/content/projects/.
// Edit a file, `git push`, and Vercel redeploys. This schema type-checks the frontmatter.
const projects = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    summary: z.string(),
    tech: z.array(z.string()).default([]),
    repo: z.string().url().optional(),
    demo: z.string().url().optional(),
    featured: z.boolean().default(false),
    date: z.coerce.date(),
  }),
});

export const collections = { projects };
