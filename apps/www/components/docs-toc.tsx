import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import type { TocItem } from "@/lib/toc";

interface DocsTocProps {
  headings: TocItem[];
}

/**
 * Sticky "On this page" table of contents for a doc page.
 * Highlights the heading currently in view using a scroll listener.
 *
 * Clicking an entry scrolls to the heading directly (and stops the global
 * link interceptor from treating it as client-side page navigation).
 */
export function DocsToc({ headings }: DocsTocProps) {
  const [activeId, setActiveId] = useState<string | null>(headings[0]?.id ?? null);

  useEffect(() => {
    if (headings.length === 0) return;

    const updateActive = () => {
      const first = headings[0];
      if (!first) return;
      let current = first.id;
      for (const heading of headings) {
        const el = document.getElementById(heading.id);
        if (!el) continue;
        if (el.getBoundingClientRect().top <= 130) current = heading.id;
        else break;
      }
      setActiveId(current);
    };

    updateActive();
    window.addEventListener("scroll", updateActive, { passive: true });
    window.addEventListener("resize", updateActive);
    return () => {
      window.removeEventListener("scroll", updateActive);
      window.removeEventListener("resize", updateActive);
    };
  }, [headings]);

  if (headings.length === 0) return null;

  const scrollToHeading = (id: string) => {
    const el = document.getElementById(id);
    if (!el) return;
    el.scrollIntoView({ behavior: "smooth", block: "start" });
    setActiveId(id);
    window.history.replaceState(null, "", `#${id}`);
  };

  return (
    <aside className="hidden xl:block w-56 shrink-0">
      <div className="sticky top-24 max-h-[calc(100vh-8rem)] overflow-y-auto">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
          On this page
        </p>
        <nav className="space-y-1 border-l border-border" aria-label="Table of contents">
          {headings.map((heading) => (
            <a
              key={heading.id}
              href={`#${heading.id}`}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                scrollToHeading(heading.id);
              }}
              className={cn(
                "block text-[13px] leading-5 py-1 -ml-px border-l-2 transition-colors",
                heading.level === 3 ? "pl-7" : "pl-4",
                activeId === heading.id
                  ? "border-primary text-primary font-medium"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              )}
            >
              {heading.text}
            </a>
          ))}
        </nav>
      </div>
    </aside>
  );
}
