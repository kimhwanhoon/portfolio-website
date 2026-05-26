import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import { generateHTML } from "@tiptap/html";
import StarterKit from "@tiptap/starter-kit";
import { common, createLowlight } from "lowlight";
import type { TiptapJSON } from "@/lib/db/schema";

const lowlight = createLowlight(common);

const extensions = [
  StarterKit.configure({
    codeBlock: false,
    heading: { levels: [2, 3] },
    link: false,
  }),
  Link.configure({
    openOnClick: false,
    HTMLAttributes: {
      rel: "noopener noreferrer nofollow",
      target: "_blank",
    },
  }),
  Image.configure({
    HTMLAttributes: { loading: "lazy", class: "rounded-lg" },
  }),
  CodeBlockLowlight.configure({
    lowlight,
    defaultLanguage: null,
    HTMLAttributes: { class: "hljs" },
  }),
];

export function renderPostHtml(contentJson: TiptapJSON): string {
  return generateHTML(contentJson, extensions);
}
