import { z } from "zod";
import type { TiptapJSON } from "@/lib/db/schema";

const tiptapDocSchema = z
  .object({
    type: z.literal("doc"),
    content: z.array(z.unknown()).min(1),
  })
  .passthrough();

function nodeHasContent(node: unknown): boolean {
  if (!node || typeof node !== "object") return false;
  const n = node as {
    type?: string;
    text?: string;
    content?: unknown[];
    attrs?: { src?: string };
  };

  if (n.type === "text" && n.text?.trim()) return true;
  if (n.type === "image" && n.attrs?.src) return true;

  if (Array.isArray(n.content)) {
    return n.content.some(nodeHasContent);
  }

  return false;
}

function hasNonEmptyContent(doc: TiptapJSON): boolean {
  const content = doc.content;
  if (!Array.isArray(content) || content.length === 0) return false;
  return content.some(nodeHasContent);
}

const postTranslationFieldsSchema = z.object({
  title: z
    .string()
    .min(1, "Title is required")
    .max(255, "Title must be less than 255 characters"),
  excerpt: z
    .string()
    .min(1, "Excerpt is required")
    .max(500, "Excerpt must be less than 500 characters"),
});

const postTranslationSchema = postTranslationFieldsSchema.extend({
  contentJson: tiptapDocSchema.refine(hasNonEmptyContent, {
    message: "Post content is required",
  }),
  contentHtml: z.string().min(1, "Post content is required"),
});

const postBaseSchema = z.object({
  slug: z.string().max(255, "Slug must be less than 255 characters").optional(),
  coverImageUrl: z.string().url().optional().or(z.literal("")),
  status: z.enum(["draft", "published"]).default("draft"),
  featured: z.boolean().default(false),
  publishedAt: z.coerce.date().optional().nullable(),
  tagSlugs: z
    .array(z.string().min(1).max(50))
    .max(10, "Maximum 10 tags allowed")
    .default([]),
});

const postTranslationsSchema = z.object({
  en: postTranslationSchema,
  fr: postTranslationSchema.optional(),
});

const postTranslationFormFieldsSchema = z.object({
  title: z.string().max(255),
  excerpt: z.string().max(500),
});

const postTranslationsFormSchema = z.object({
  en: postTranslationFieldsSchema,
  fr: postTranslationFormFieldsSchema.optional(),
});

/** Client form resolver — Tiptap content is merged at submit time. */
export const postFormSchema = postBaseSchema.extend({
  translations: postTranslationsFormSchema,
});

export type PostFormInput = z.infer<typeof postFormSchema>;

export const postSchema = postBaseSchema.extend({
  translations: postTranslationsSchema,
});

export type PostTranslationData = z.infer<typeof postTranslationSchema>;
export type PostTranslationFields = z.infer<typeof postTranslationFieldsSchema>;
export type PostFormData = z.infer<typeof postSchema>;
