import { cn } from "@/lib/utils";
import { useState } from "react";

type RouteKind = "page" | "api" | "ws";

type ParsedRoute = {
  segments: string[];
  file: string;
  kind: RouteKind | "invalid";
  url: string;
  params: string[];
  apiDir?: string;
};

function parseRoute(raw: string): ParsedRoute {
  const segments = raw.trim().split("/").filter(Boolean);
  const file = segments[segments.length - 1] ?? "";

  if (segments.length === 0) {
    return { segments, file, kind: "invalid", url: "", params: [] };
  }

  let kind: RouteKind | "invalid";
  if (file === "route.ts") {
    if (segments[0] === "api") kind = "api";
    else if (segments[0] === "ws") kind = "ws";
    else kind = "invalid";
  } else if (file === "page.tsx") {
    kind = "page";
  } else {
    kind = "invalid";
  }

  const urlSegments = kind === "page" ? segments.slice(0, -1) : segments;
  const url =
    "/" +
    urlSegments
      .map((s) =>
        s.startsWith("[") && s.endsWith("]") ? `:${s.slice(1, -1)}` : s
      )
      .join("/");

  const params = segments
    .filter((s) => s.startsWith("[") && s.endsWith("]"))
    .map((s) => s.slice(1, -1));

  const apiDir =
    kind === "api" ? `api.${segments.slice(1, -1).join(".")}` : undefined;

  return { segments, file, kind, url, params, apiDir };
}

function singularize(word: string) {
  if (word.endsWith("ies")) return word.slice(0, -3) + "y";
  if (word.endsWith("ses")) return word.slice(0, -2);
  if (word.endsWith("s") && !word.endsWith("ss")) return word.slice(0, -1);
  return word;
}

const presets = [
  "page.tsx",
  "blog/[slug]/page.tsx",
  "api/users/route.ts",
  "ws/chat/route.ts",
];

type ClientMethod = {
  method: string;
  dir: string;
  url: string;
  type: string;
};

// The generated client surface of the demo app (same app as the code showcase).
const clientMethods: ClientMethod[] = [
  {
    method: "listUsers",
    dir: "api.users",
    url: "GET /api/users",
    type: "{ users: User[]; total: number }",
  },
  {
    method: "createUser",
    dir: "api.users",
    url: "POST /api/users",
    type: "{ user: User }",
  },
  {
    method: "check",
    dir: "api.health",
    url: "GET /api/health",
    type: '{ status: "ok" }',
  },
  {
    method: "streamText",
    dir: "api.stream",
    url: "GET /api/stream",
    type: "StreamingResponse<string>",
  },
];

function RouteTree({ route }: { route: ParsedRoute }) {
  if (route.kind === "invalid" || route.segments.length === 0) return null;

  const file = route.file;
  const dirs = route.segments.slice(0, -1);

  const FileLine = () => (
    <div className="ml-1.5 border-l border-zinc-800 pl-3">
      <div className="text-sm">
        <span className="text-zinc-600">└─ </span>
        <span
          className={cn(
            file === "route.ts" ? "text-emerald-400" : "text-sky-300"
          )}
        >
          {file}
        </span>
      </div>
    </div>
  );

  const DirLines = ({ names }: { names: string[] }) => {
    if (names.length === 0) return <FileLine />;
    const head = names[0]!;
    const rest = names.slice(1);
    const isLast = rest.length === 0;
    return (
      <div className="ml-1.5 border-l border-zinc-800 pl-3">
        <div className="text-sm">
          <span className="text-zinc-600">{isLast ? "└─ " : "├─ "}</span>
          <span
            className={
              head.startsWith("[") ? "text-purple-400" : "text-zinc-400"
            }
          >
            {head}/
          </span>
        </div>
        <DirLines names={rest} />
      </div>
    );
  };

  return (
    <div className="font-mono">
      <div className="text-sm text-zinc-500">app/</div>
      <DirLines names={dirs} />
    </div>
  );
}

function UrlBadge({ route }: { route: ParsedRoute }) {
  if (route.kind === "invalid") return null;
  return (
    <div className="flex items-center gap-2 rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 font-mono text-xs">
      <span className="text-zinc-600">→</span>
      <span className="text-blue-400">{route.url}</span>
    </div>
  );
}

function PagePreview({ route }: { route: ParsedRoute }) {
  const param = route.params[0];
  const paramIndex = route.segments.findIndex(
    (s) => s.startsWith("[") && s.endsWith("]")
  );
  const resource =
    paramIndex > 0
      ? singularize(route.segments[paramIndex - 1] ?? "data")
      : "data";
  const getter = `db.get${resource.charAt(0).toUpperCase()}${resource.slice(1)}`;

  return (
    <div className="font-mono text-[13px] leading-6">
      <div className="text-zinc-300">
        <span className="text-zinc-500">export async function</span>{" "}
        <span className="text-pink-400">loader</span>
        {param ? (
          <>
            {"({ params }: LoaderContext) {"}
            <div className="pl-4 text-zinc-400">
              return <span className="text-zinc-200">{`${getter}(params.${param})`}</span>;
            </div>
            <span className="text-zinc-300">{"}"}</span>
          </>
        ) : (
          <>
            {"() {"}
            <div className="pl-4 text-zinc-400">
              return <span className="text-zinc-200">await api.users.listUsers()</span>;
            </div>
            <span className="text-zinc-300">{"}"}</span>
          </>
        )}
      </div>
      <div className="mt-2 text-zinc-500">
        <span className="text-zinc-600">// server-rendered — data ships with the HTML</span>
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        <span className="rounded-full bg-pink-500/10 px-2 py-0.5 text-[11px] text-pink-400">
          SSR
        </span>
        <span className="rounded-full bg-sky-500/10 px-2 py-0.5 text-[11px] text-sky-400">
          typed data
        </span>
      </div>
    </div>
  );
}

function ApiPreview({
  route,
  selected,
  onSelect,
  onReset,
}: {
  route: ParsedRoute;
  selected: ClientMethod | null;
  onSelect: (m: ClientMethod) => void;
  onReset: () => void;
}) {
  const [hovered, setHovered] = useState<ClientMethod | null>(null);
  const hot = route.apiDir
    ? clientMethods.filter((m) => m.dir === route.apiDir)
    : [];
  const detail = hovered ?? hot[0] ?? clientMethods[0]!;

  return (
    <div>
      <div className="font-mono text-[13px] leading-6">
        <span className="text-zinc-500">const data = await </span>
        <span className="text-emerald-400">api</span>
        <span className="text-zinc-600">.</span>
        {selected ? (
          <span className="text-sky-300">{selected.method}</span>
        ) : (
          <span className="inline-block h-4 w-2 animate-blink bg-white/70 align-middle" />
        )}
        {selected && <span className="text-zinc-500">();</span>}
      </div>

      {!selected && (
        <div className="mt-3 overflow-hidden rounded-lg border border-zinc-800 bg-zinc-950">
          {clientMethods.map((m) => {
            const isHot = hot.some((h) => h.method === m.method);
            const isHovered = hovered?.method === m.method;
            return (
              <button
                key={m.method}
                type="button"
                onMouseEnter={() => setHovered(m)}
                onMouseLeave={() => setHovered(null)}
                onClick={() => {
                  onSelect(m);
                  setHovered(null);
                }}
                className={cn(
                  "flex w-full items-center justify-between gap-3 px-3 py-2 text-left text-xs transition-colors cursor-pointer",
                  isHot && "bg-sky-500/10",
                  isHovered && "bg-zinc-800",
                  !isHot && !isHovered && "opacity-70"
                )}
              >
                <span className="font-mono text-sky-300">{m.method}</span>
                <span className="hidden font-mono text-zinc-600 sm:block">
                  {m.type}
                </span>
                {isHot && (
                  <span className="font-mono text-[10px] text-sky-400">
                    ↺ regenerated
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}

      <div className="mt-3 flex items-center justify-between gap-2 font-mono text-[11px]">
        <span className="text-zinc-500">{detail.url}</span>
        <span className="text-zinc-400">{detail.type}</span>
      </div>

      {selected ? (
        <button
          type="button"
          onClick={onReset}
          className="mt-2 font-mono text-[11px] text-zinc-500 transition-colors hover:text-sky-400 cursor-pointer"
        >
          ← pick another method
        </button>
      ) : hot.length > 0 ? (
        <div className="mt-2 font-mono text-[11px] text-emerald-400/80">
          ✓ client regenerated from app/api/users/route.ts
        </div>
      ) : (
        <div className="mt-2 font-mono text-[11px] text-zinc-600">
          type api/…/route.ts to regenerate the client
        </div>
      )}
    </div>
  );
}

function WsPreview({ route }: { route: ParsedRoute }) {
  return (
    <div className="font-mono text-[13px] leading-6">
      <div className="text-zinc-300">
        <span className="text-zinc-500">const</span> ws ={" "}
        <span className="text-zinc-200">
          new WebSocket("wss://yourapp.com{route.url}")
        </span>;
      </div>
      <div className="text-zinc-400">
        <span className="text-zinc-500">ws</span>.onmessage = (e) =&gt;{" "}
        <span className="text-zinc-300">renderMessage(e.data)</span>;
      </div>
      <div className="text-zinc-400">
        <span className="text-zinc-500">ws</span>.send({"{"} text {"}"});
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        <span className="rounded-full bg-blue-500/10 px-2 py-0.5 text-[11px] text-blue-400">
          realtime
        </span>
        <span className="rounded-full bg-blue-500/10 px-2 py-0.5 text-[11px] text-blue-400">
          pub/sub
        </span>
      </div>
    </div>
  );
}

export function RoutePlayground() {
  const [path, setPath] = useState("api/users/route.ts");
  const [selected, setSelected] = useState<ClientMethod | null>(null);

  const route = parseRoute(path);

  return (
    <section className="py-24 sm:py-32 border-t border-border/40">
      <div className="mx-auto max-w-7xl px-6 lg:px-8 mb-16">
        <h2 className="text-4xl font-bold tracking-tight text-foreground mb-4">
          Your file system <span className="text-muted-foreground">is your API.</span>
        </h2>
        <p className="text-lg text-muted-foreground max-w-2xl">
          Type a route, watch Axi wire it up. Add a{" "}
          <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-sm text-foreground">
            route.ts
          </code>{" "}
          under{" "}
          <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-sm text-foreground">
            app/api/
          </code>{" "}
          and the generated client picks it up — fully typed.
        </p>
      </div>

      <div className="mx-auto max-w-5xl px-6 lg:px-8">
        <div className="overflow-hidden rounded-2xl bg-zinc-900 shadow-2xl ring-1 ring-zinc-800">
          {/* Window chrome */}
          <div className="flex items-center gap-1.5 border-b border-zinc-800 px-4 py-3">
            <div className="h-3 w-3 rounded-full bg-red-500/80" />
            <div className="h-3 w-3 rounded-full bg-yellow-500/80" />
            <div className="h-3 w-3 rounded-full bg-green-500/80" />
            <span className="ml-3 font-mono text-xs text-zinc-500">
              app/ — file-based routing
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2">
            {/* Builder */}
            <div className="border-b lg:border-b-0 lg:border-r border-zinc-800 p-6 lg:p-8">
              <div className="flex items-center rounded-lg border border-zinc-800 bg-zinc-950 focus-within:border-sky-500/60">
                <span className="select-none pl-3 font-mono text-sm text-zinc-500">
                  app/
                </span>
                <input
                  value={path}
                  onChange={(e) => setPath(e.target.value)}
                  spellCheck={false}
                  className="w-full bg-transparent px-3 py-2.5 font-mono text-sm text-zinc-100 outline-none placeholder:text-zinc-600"
                  placeholder="blog/[slug]/page.tsx"
                />
              </div>

              <div className="mt-3 flex flex-wrap gap-2">
                {presets.map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setPath(preset)}
                    className={cn(
                      "rounded-md border px-2.5 py-1 font-mono text-xs transition-colors cursor-pointer",
                      path === preset
                        ? "border-sky-500/50 bg-sky-500/10 text-sky-300"
                        : "border-zinc-800 text-zinc-500 hover:border-zinc-700 hover:text-zinc-300"
                    )}
                  >
                    {preset}
                  </button>
                ))}
              </div>

              <div className="mt-8">
                <RouteTree route={route} />
              </div>

              <div className="mt-6">
                <UrlBadge route={route} />
              </div>
            </div>

            {/* What you get */}
            <div className="flex min-h-[320px] items-center justify-center bg-zinc-950 p-6 lg:p-8">
              <div className="w-full rounded-xl border border-zinc-800 bg-zinc-900/60 p-5">
                {route.kind === "invalid" ? (
                  <div className="font-mono text-[13px] leading-6 text-zinc-400">
                    <span className="text-orange-400">✕</span> not a route — Axi
                    routes are:
                    <div className="mt-2 space-y-1 text-zinc-500">
                      <div>app/page.tsx</div>
                      <div>app/api/*/route.ts</div>
                      <div>app/ws/*/route.ts</div>
                    </div>
                  </div>
                ) : route.kind === "page" ? (
                  <PagePreview route={route} />
                ) : route.kind === "api" ? (
                  <ApiPreview
                    route={route}
                    selected={selected}
                    onSelect={setSelected}
                    onReset={() => setSelected(null)}
                  />
                ) : (
                  <WsPreview route={route} />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
