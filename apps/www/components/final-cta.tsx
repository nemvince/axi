export function FinalCta() {
  return (
    <div className="py-24 sm:py-32 border-t border-border/40">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-3xl bg-zinc-900 dark:bg-zinc-800 px-6 py-20 sm:px-16 sm:py-24 text-center">
          <div
            className="pointer-events-none absolute inset-0 bg-grid-pattern opacity-10"
            aria-hidden="true"
          />
          <div className="relative">
            <p className="font-mono text-sm text-zinc-500 mb-6">
              <span className="text-green-400">$</span> axi create my-app
            </p>
            <h2 className="mx-auto max-w-3xl text-4xl sm:text-6xl font-bold tracking-tight text-white">
              Find your <span className="italic font-serif">flow state</span>.
            </h2>
            <p className="mx-auto mt-6 max-w-2xl text-base sm:text-lg text-zinc-400">
              A full-stack framework built on Bun — file-based routing, SSR, and
              a type-safe client, so you stay in flow from first commit to
              deploy.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              <a
                href="/docs/introduction"
                className="inline-flex h-12 items-center gap-2 rounded-md bg-white px-7 text-sm font-medium text-zinc-900 transition-transform hover:scale-[1.02]"
              >
                Get started
              </a>
              <a
                href="/docs/installation"
                className="inline-flex h-12 items-center gap-2 rounded-md bg-white/10 px-7 text-sm font-medium text-white transition-colors hover:bg-white/20"
              >
                Read the docs
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
