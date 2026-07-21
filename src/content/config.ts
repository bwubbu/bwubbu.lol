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
    embed: z.boolean().default(false), // show a live <iframe> preview of `demo` (only for hosts that allow framing)
    image: z.string().optional(), // screenshot path for projects with no live embed (use /tv-placeholder.svg until one exists)
    featured: z.boolean().default(false),
    date: z.coerce.date(),
  }),
});

export const collections = { projects };
