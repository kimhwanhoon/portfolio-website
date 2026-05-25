import { z } from "zod";

export const portfolioSchema = z.object({
  title: z.string().min(1, "Title is required").max(255),
  slug: z.string().max(255).optional(),
  shortDescription: z.string().min(1, "Short description is required").max(300),
  fullDescription: z.string().min(1, "Full description is required"),
  thumbnailUrl: z.string().url().optional().or(z.literal("")),
  techStack: z.array(z.string()).default([]),
  liveUrl: z.string().url().optional().or(z.literal("")),
  githubUrl: z.string().url().optional().or(z.literal("")),
  featured: z.boolean().default(false),
  sortOrder: z.number().int().default(0),
  status: z.enum(["draft", "published"]).default("draft"),
  startDate: z.coerce.date().optional().nullable(),
  endDate: z.coerce.date().optional().nullable(),
});

export type PortfolioFormData = z.infer<typeof portfolioSchema>;
