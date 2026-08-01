import { slugify } from "./utils";

/**
 * A single entry in the per-page table of contents.
 */
export interface TocItem {
  id: string;
  text: string;
  level: number;
}

/**
 * Strip markdown inline formatting from heading text so the ToC text matches
 * the rendered heading text.
 */
function stripMarkdown(text: string): string {
  return text
    .replace(/`([^`]*)`/g, "$1")
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/\*\*([^*]*)\*\*/g, "$1")
    .replace(/\*([^*]*)\*/g, "$1")
    .replace(/__([^_]*)__/g, "$1")
    .replace(/_([^_]*)_/g, "$1")
    .trim();
}

/**
 * Extract h2/h3 headings from markdown content into ToC entries.
 * Uses the same slugify() as the rendered headings so anchor ids match.
 *
 * This module is browser-safe (no Node dependencies) and is imported by the
 * client-bundled page component.
 */
export function extractHeadings(markdown: string): TocItem[] {
  const items: TocItem[] = [];
  const regex = /^(#{2,3})\s+(.+?)\s*#*\s*$/gm;
  let match: RegExpExecArray | null;
  while ((match = regex.exec(markdown)) !== null) {
    const rawLevel = match[1];
    const rawText = match[2];
    if (rawLevel === undefined || rawText === undefined) continue;
    const level = rawLevel.length;
    const text = stripMarkdown(rawText);
    if (!text) continue;
    items.push({ id: slugify(text), text, level });
  }
  return items;
}
