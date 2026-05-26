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

/** Client form resolver — content is read from Tiptap at submit time. */
export const postFormSchema = z.object({
  title: z
    .string()
    .min(1, "Title is required")
    .max(255, "Title must be less than 255 characters"),
  slug: z.string().max(255, "Slug must be less than 255 characters").optional(),
  excerpt: z
    .string()
    .min(1, "Excerpt is required")
    .max(500, "Excerpt must be less than 500 characters"),
  coverImageUrl: z.string().url().optional().or(z.literal("")),
  status: z.enum(["draft", "published"]).default("draft"),
  featured: z.boolean().default(false),
  publishedAt: z.coerce.date().optional().nullable(),
  tagSlugs: z
    .array(z.string().min(1).max(50))
    .max(10, "Maximum 10 tags allowed")
    .default([]),
});

export type PostFormInput = z.infer<typeof postFormSchema>;

export const postSchema = z.object({
  title: z
    .string()
    .min(1, "Title is required")
    .max(255, "Title must be less than 255 characters"),
  slug: z.string().max(255, "Slug must be less than 255 characters").optional(),
  excerpt: z
    .string()
    .min(1, "Excerpt is required")
    .max(500, "Excerpt must be less than 500 characters"),
  coverImageUrl: z.string().url().optional().or(z.literal("")),
  contentJson: tiptapDocSchema.refine(hasNonEmptyContent, {
    message: "Post content is required",
  }),
  status: z.enum(["draft", "published"]).default("draft"),
  featured: z.boolean().default(false),
  publishedAt: z.coerce.date().optional().nullable(),
  tagSlugs: z
    .array(z.string().min(1).max(50))
    .max(10, "Maximum 10 tags allowed")
    .default([]),
});

export type PostFormData = z.infer<typeof postSchema>;
