import rehypeParse from "rehype-parse";
import rehypeSlug from "rehype-slug";
import rehypeStringify from "rehype-stringify";
import { unified } from "unified";

/** Assign stable `id` attributes to h2–h4 for deep linking. */
export async function addHeadingIds(html: string): Promise<string> {
  const file = await unified()
    .use(rehypeParse, { fragment: true })
    .use(rehypeSlug)
    .use(rehypeStringify)
    .process(html);
  return String(file);
}
