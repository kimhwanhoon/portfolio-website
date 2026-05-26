import { z } from "zod";

const portfolioTranslationSchema = z.object({
  title: z.string().min(1, "Title is required").max(255),
  shortDescription: z.string().min(1, "Short description is required").max(300),
  fullDescription: z.string().min(1, "Full description is required"),
});

const portfolioBaseSchema = z.object({
  slug: z.string().max(255).optional(),
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

const portfolioTranslationFormFieldsSchema = z.object({
  title: z.string().max(255),
  shortDescription: z.string().max(300),
  fullDescription: z.string(),
});

const portfolioTranslationsSchema = z.object({
  en: portfolioTranslationSchema,
  fr: portfolioTranslationSchema.optional(),
});

const portfolioTranslationsFormSchema = z.object({
  en: portfolioTranslationSchema,
  fr: portfolioTranslationFormFieldsSchema.optional(),
});

export const portfolioSchema = portfolioBaseSchema.extend({
  translations: portfolioTranslationsSchema,
});

export const portfolioFormSchema = portfolioBaseSchema.extend({
  translations: portfolioTranslationsFormSchema,
});

export type PortfolioTranslationData = z.infer<
  typeof portfolioTranslationSchema
>;
export type PortfolioFormData = z.infer<typeof portfolioSchema>;
export type PortfolioFormInput = z.infer<typeof portfolioFormSchema>;
