import rehypeHighlight from "rehype-highlight";
import rehypeParse from "rehype-parse";
import rehypeStringify from "rehype-stringify";
import { unified } from "unified";

const processor = unified()
  .use(rehypeParse, { fragment: true })
  .use(rehypeHighlight, { detect: true })
  .use(rehypeStringify);

export async function highlightCodeBlocks(html: string): Promise<string> {
  const file = await processor.process(html);
  return String(file);
}
