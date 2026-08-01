import { CodeShowcase } from "@/components/code-showcase";
import { FeaturesGrid } from "@/components/features-grid";
import { FinalCta } from "@/components/final-cta";
import { RoutePlayground } from "@/components/route-playground";
import { Button } from "@/components/ui/button";
import { StarIcon } from "@phosphor-icons/react";

export default function HomePage() {
  return (
    <div className="relative min-h-screen">
      {/* Hero Section */}
      <div className="relative isolate sm:pt-14">
        <div className="mx-auto max-w-7xl px-6 py-10 lg:px-8">
          <div className="mx-auto max-w-4xl text-center">
            {/* Headline with mixed typography */}
            <h1 className="text-5xl font-semibold tracking-tight sm:text-7xl text-foreground leading-[1.1]">
              Full-stack's{" "}
              <span className="italic font-serif">flow state</span>
            </h1>

            <p className="mt-8 text-lg leading-8 text-muted-foreground max-w-2xl mx-auto">
              Create files in{" "}
              <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-sm text-foreground">
                app/
              </code>
              , get pages, APIs, and WebSockets — server-rendered, type-safe,
              and hot-reloaded on Bun. Zero config, nothing to pull you out of
              flow.
            </p>

            {/* CTA Buttons */}
            <div className="mt-10 flex items-center justify-center gap-x-4">
              <Button
                size="lg"
                className="h-12 px-8 text-base font-medium transition-all duration-200 hover:scale-[1.02] hover:shadow-lg"
                asChild
              >
                <a href="/docs/introduction">Quick start</a>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="h-12 px-6 text-base font-medium transition-all duration-200 hover:scale-[1.02]"
                asChild
              >
                <a
                  href="https://github.com/nemvince/axi"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2"
                >
                  <StarIcon className="h-4 w-4" />
                  Star on GitHub
                </a>
              </Button>
            </div>
          </div>

          {/* Code Showcase */}
          <div className="mt-16 mx-auto max-w-5xl">
            <CodeShowcase />
          </div>
        </div>
      </div>

      {/* Route Playground */}
      <RoutePlayground />

      {/* Features Grid */}
      <FeaturesGrid />

      {/* Closing CTA */}
      <FinalCta />
    </div>
  );
}
