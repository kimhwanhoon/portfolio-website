import rehypeHighlight from "rehype-highlight";
import rehypeParse from "rehype-parse";
import rehypeSanitize from "rehype-sanitize";
import rehypeSlug from "rehype-slug";
import rehypeStringify from "rehype-stringify";
import { unified } from "unified";
import { calculateReadingMinutes } from "@/lib/blog/reading-time";
import { postHtmlSanitizeSchema } from "@/lib/blog/sanitize";
import type { TiptapJSON } from "@/lib/db/schema";

const postHtmlProcessor = unified()
  .use(rehypeParse, { fragment: true })
  .use(rehypeSanitize, postHtmlSanitizeSchema)
  .use(rehypeHighlight, { detect: true })
  .use(rehypeSlug)
  .use(rehypeStringify);

export async function processPostContent(
  contentJson: TiptapJSON,
  rawHtml: string,
) {
  const file = await postHtmlProcessor.process(rawHtml);
  const contentHtml = String(file);
  const readingMinutes = calculateReadingMinutes(contentJson);

  return { contentHtml, readingMinutes };
}
