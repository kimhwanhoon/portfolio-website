import { calculateReadingMinutes } from "@/lib/blog/reading-time";
import { renderPostHtml } from "@/lib/blog/render";
import { sanitizePostHtml } from "@/lib/blog/sanitize";
import type { TiptapJSON } from "@/lib/db/schema";

export async function processPostContent(contentJson: TiptapJSON) {
  const rawHtml = renderPostHtml(contentJson);
  const contentHtml = sanitizePostHtml(rawHtml);
  const readingMinutes = calculateReadingMinutes(contentJson);

  return { contentHtml, readingMinutes };
}
