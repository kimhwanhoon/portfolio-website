/**
 * Pure helpers for working with translation payloads.
 *
 * IMPORTANT: This module must remain free of server-only imports (no `db`,
 * no Node-only APIs) so that client components can use it safely.
 */

function isTiptapDocEmpty(doc: unknown): boolean {
  if (!doc || typeof doc !== "object") return true;
  const d = doc as { type?: string; content?: unknown[] };
  if (d.type !== "doc") return false;
  if (!Array.isArray(d.content) || d.content.length === 0) return true;

  function nodeHasContent(node: unknown): boolean {
    if (!node || typeof node !== "object") return false;
    const n = node as {
      type?: string;
      text?: string;
      content?: unknown[];
      attrs?: { src?: string };
    };
    if (n.type === "text" && n.text?.trim()) return true;
    if (n.type === "image" && n.attrs?.src) return true;
    if (Array.isArray(n.content)) return n.content.some(nodeHasContent);
    return false;
  }

  return !d.content.some(nodeHasContent);
}

/** True when all translatable fields are empty (strings + optional Tiptap doc). */
export function isTranslationEmpty(
  values: Record<string, unknown> | undefined,
): boolean {
  if (!values) return true;

  let hasContent = false;
  for (const [key, value] of Object.entries(values)) {
    if (key === "contentJson") {
      if (!isTiptapDocEmpty(value)) hasContent = true;
    } else if (typeof value === "string" && value.trim() !== "") {
      hasContent = true;
    }
  }
  return !hasContent;
}

/** Drop optional locales that were not provided (undefined). */
export function translationEntries<T extends Record<string, unknown>>(
  translations: Record<string, T | undefined>,
): [string, T][] {
  return Object.entries(translations).filter(
    (entry): entry is [string, T] => entry[1] !== undefined,
  );
}
