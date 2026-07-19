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

const sheetLinks = z.object({
  itinerary: z.string().url().optional(),
  budget: z.string().url().optional(),
  checklist: z.string().url().optional(),
});

const itineraryItem = z.object({
  time: z.string().optional(),
  title: z.string(),
  lat: z.number().optional(),
  lng: z.number().optional(),
});

const itineraryDay = z.object({
  day: z.number(),
  items: z.array(itineraryItem),
});

const budgetItem = z.object({
  category: z.string().optional(),
  label: z.string(),
  planned: z.number().optional(),
  actual: z.number().optional(),
});

const candidate = z.object({
  name: z.string(),
  note: z.string().optional(),
  link: z.string().optional(),
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
    sheet: sheetLinks.optional(),
    itinerary: z.array(itineraryDay).default([]),
    budgetItems: z.array(budgetItem).default([]),
    places: z.array(candidate).default([]),
    foods: z.array(candidate).default([]),
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
