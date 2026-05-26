import type { TiptapJSON } from "@/lib/db/schema";

function extractTextFromNode(node: unknown): string {
  if (!node || typeof node !== "object") return "";

  const n = node as { type?: string; text?: string; content?: unknown[] };

  if (n.type === "text" && typeof n.text === "string") {
    return n.text;
  }

  if (Array.isArray(n.content)) {
    return n.content.map(extractTextFromNode).join(" ");
  }

  return "";
}

export function calculateReadingMinutes(contentJson: TiptapJSON): number {
  const text = extractTextFromNode(contentJson).trim();
  const words = text.split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 200));
}
