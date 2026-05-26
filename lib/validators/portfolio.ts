import { z } from "zod";
import { translationsObject } from "@/lib/i18n/zod-helpers";

const portfolioTranslationSchema = z.object({
  title: z.string().min(1, "Title is required").max(255),
  shortDescription: z.string().min(1, "Short description is required").max(300),
  fullDescription: z.string().min(1, "Full description is required"),
});

/** Looser fields-only schema for non-default locales in the client form. */
const portfolioTranslationFormFieldsSchema = z.object({
  title: z.string().max(255),
  shortDescription: z.string().max(300),
  fullDescription: z.string(),
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

/** Server schema: validates the payload sent to server actions. */
export const portfolioSchema = portfolioBaseSchema.extend({
  translations: translationsObject(portfolioTranslationSchema),
});

/** Client form schema: same shape but with looser non-default locale fields. */
export const portfolioFormSchema = portfolioBaseSchema.extend({
  translations: translationsObject(portfolioTranslationFormFieldsSchema),
});

export type PortfolioTranslationData = z.infer<
  typeof portfolioTranslationSchema
>;
export type PortfolioFormData = z.infer<typeof portfolioSchema>;
export type PortfolioFormInput = z.infer<typeof portfolioFormSchema>;
