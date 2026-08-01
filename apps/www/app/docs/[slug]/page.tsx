import { DocsToc } from "@/components/docs-toc";
import { MarkdownContent } from "@/components/markdown-content";
import { extractHeadings } from "@/lib/toc";
import type { LoaderContext, PageMetadata, PageProps } from "@axi-js/core";
import { useMemo } from "react";

// lib/docs reads the file system (path, gray-matter, Bun.file), so it must
// not be statically imported by this client-bundled page. Load it dynamically
// inside the server-only loader instead.
export async function loader({ params }: LoaderContext) {
  const { getDoc } = await import("@/lib/docs");
  const doc = await getDoc(params.slug as string);
  return { doc };
}

export const metadata: PageMetadata = {
  title: "Axi Documentation",
  description: "Axi documentation",
};

interface DocData {
  doc: {
    metadata: { title: string; description?: string };
    content: string;
  } | null;
}

export default function DocsPage({ data }: PageProps) {
  const { doc } = data as DocData;

  const headings = useMemo(
    () => (doc ? extractHeadings(doc.content) : []),
    [doc]
  );

  if (!doc) {
    return (
      <div className="py-10">
        <h1 className="text-4xl font-bold mb-4">Page Not Found</h1>
        <p className="text-muted-foreground">
          The documentation page you're looking for doesn't exist.
        </p>
      </div>
    );
  }

  return (
    <div className="flex gap-10">
      <article className="flex-1 min-w-0 py-6 max-w-3xl">
        <h1 className="text-3xl font-semibold tracking-tight mb-2">
          {doc.metadata.title}
        </h1>
        {doc.metadata.description && (
          <p className="text-base text-muted-foreground mb-6">
            {doc.metadata.description}
          </p>
        )}
        <MarkdownContent content={doc.content} />
      </article>
      <DocsToc headings={headings} />
    </div>
  );
}
