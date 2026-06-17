import type { Options } from "rehype-sanitize";

const ALLOWED_TAGS = [
  "p",
  "h1",
  "h2",
  "h3",
  "h4",
  "ul",
  "ol",
  "li",
  "blockquote",
  "pre",
  "code",
  "a",
  "img",
  "strong",
  "em",
  "hr",
  "br",
  "span",
];

export const postHtmlSanitizeSchema: Options = {
  tagNames: ALLOWED_TAGS,
  attributes: {
    a: [
      "href",
      "title",
      "rel",
      ["target", "_blank", "_self", "_parent", "_top"],
    ],
    code: [["className", /^language-/]],
    img: ["src", "alt", "title", ["loading", "lazy", "eager"]],
    "*": ["title"],
  },
  protocols: {
    href: ["http", "https", "mailto", "tel"],
    src: ["http", "https"],
  },
};
