import { addHeadingIds } from "@/lib/blog/heading-ids";
import { highlightCodeBlocks } from "@/lib/blog/highlight";
import { calculateReadingMinutes } from "@/lib/blog/reading-time";
import { sanitizePostHtml } from "@/lib/blog/sanitize";
import type { TiptapJSON } from "@/lib/db/schema";

export async function processPostContent(
  contentJson: TiptapJSON,
  rawHtml: string,
) {
  const highlighted = await highlightCodeBlocks(rawHtml);
  const sanitized = sanitizePostHtml(highlighted);
  const contentHtml = await addHeadingIds(sanitized);
  const readingMinutes = calculateReadingMinutes(contentJson);

  return { contentHtml, readingMinutes };
}
