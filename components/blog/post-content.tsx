interface PostContentProps {
  html: string;
}

export function PostContent({ html }: PostContentProps) {
  return (
    <article
      className="post-content prose prose-neutral prose-lg dark:prose-invert prose-headings:font-heading prose-headings:tracking-tight prose-headings:scroll-mt-24 prose-a:text-primary prose-a:no-underline hover:prose-a:underline prose-img:rounded-xl prose-pre:my-6"
      style={{ maxWidth: "none" }}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
