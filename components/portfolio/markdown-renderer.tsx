import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export function MarkdownRenderer({ content }: { content: string }) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        h1: ({ children }) => (
          <h1 className="font-heading text-2xl font-semibold mt-8 mb-4">
            {children}
          </h1>
        ),
        h2: ({ children }) => (
          <h2 className="font-heading text-xl font-semibold mt-6 mb-3">
            {children}
          </h2>
        ),
        h3: ({ children }) => (
          <h3 className="font-heading text-lg font-semibold mt-5 mb-2">
            {children}
          </h3>
        ),
        p: ({ children }) => (
          <p className="leading-7 text-muted-foreground mb-4">{children}</p>
        ),
        ul: ({ children }) => (
          <ul className="list-disc pl-6 mb-4 space-y-1 text-muted-foreground">
            {children}
          </ul>
        ),
        ol: ({ children }) => (
          <ol className="list-decimal pl-6 mb-4 space-y-1 text-muted-foreground">
            {children}
          </ol>
        ),
        li: ({ children }) => <li className="leading-7">{children}</li>,
        a: ({ href, children }) => (
          <a
            href={href}
            className="text-primary underline underline-offset-4 hover:text-primary/80"
            target="_blank"
            rel="noopener noreferrer"
          >
            {children}
          </a>
        ),
        blockquote: ({ children }) => (
          <blockquote className="border-l-2 border-muted pl-4 italic text-muted-foreground mb-4">
            {children}
          </blockquote>
        ),
        code: ({ children }) => (
          <code className="bg-muted rounded px-1.5 py-0.5 text-sm font-mono">
            {children}
          </code>
        ),
        pre: ({ children }) => (
          <pre className="bg-muted rounded-lg p-4 overflow-x-auto mb-4 text-sm">
            {children}
          </pre>
        ),
        hr: () => <hr className="my-8 border-muted" />,
        strong: ({ children }) => (
          <strong className="font-semibold text-foreground">{children}</strong>
        ),
      }}
    >
      {content}
    </ReactMarkdown>
  );
}
