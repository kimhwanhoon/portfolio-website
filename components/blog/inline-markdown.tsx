import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface InlineMarkdownProps {
  content: string;
}

export function InlineMarkdown({ content }: InlineMarkdownProps) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      allowedElements={["p", "a", "strong", "em", "code", "del", "br"]}
      unwrapDisallowed
      components={{
        p: ({ children }) => <>{children}</>,
        a: ({ href, children }) => (
          <a
            href={href}
            className="underline decoration-foreground/30 underline-offset-4 transition-colors hover:decoration-foreground"
            target="_blank"
            rel="noopener noreferrer"
          >
            {children}
          </a>
        ),
        code: ({ children }) => (
          <code className="rounded-md bg-muted px-1.5 py-0.5 font-mono text-[0.85em] font-medium text-foreground">
            {children}
          </code>
        ),
        strong: ({ children }) => (
          <strong className="font-semibold text-foreground">{children}</strong>
        ),
      }}
    >
      {content}
    </ReactMarkdown>
  );
}
