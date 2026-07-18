import { defineCollection, reference, z } from "astro:content";
import { glob } from "astro/loaders";

const infoCard = z.object({
  title: z.string(),
  detail: z.string().optional(),
  link: z.string().optional(),
});

const photo = z.object({
  src: z.string(),
  caption: z.string().optional(),
});

const trips = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/trips" }),
  schema: z.object({
    title: z.string(),
    destination: z.string(),
    status: z.enum(["upcoming", "candidate", "done"]),
    startDate: z.coerce.date().optional(),
    endDate: z.coerce.date().optional(),
    summary: z.string(),
    emoji: z.string().default("✈️"),
    cover: z.string().optional(),
    budget: z.string().optional(),
    tags: z.array(z.string()).default([]),
    flight: infoCard.optional(),
    lodging: infoCard.optional(),
    photos: z.array(photo).default([]),
  }),
});

const checklists = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/checklists" }),
  schema: z.object({
    title: z.string(),
    trip: reference("trips"),
    summary: z.string().optional(),
  }),
});

export const collections = { trips, checklists };
