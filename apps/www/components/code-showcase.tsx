import { cn } from "@/lib/utils";
import { CheckIcon, CopyIcon } from "@phosphor-icons/react";
import { useState } from "react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";

type ShowcaseFile = {
  path: string;
  route: string;
  language: string;
  dot: string;
  code: string;
};

const pageSnippet = `import { api } from "@/.axi/api-client";
import type { LoaderContext, PageProps } from "@axi-js/core";

// Runs on the server — data is fetched, then SSR'd into the HTML
export async function loader({ query }: LoaderContext) {
  return await api.users.listUsers({ role: query.role });
}

export default function Page({ data }: PageProps) {
  const { users, total } = data as Awaited<ReturnType<typeof loader>>;

  return (
    <main className="team">
      <h1>Team</h1>
      <p>{total} members</p>
      {users.map((user) => (
        <Card key={user.id} user={user} />
      ))}
    </main>
  );
}`;

const apiSnippet = `import { route } from "@axi-js/core";
import { z } from "zod";

const users = [
  { id: "1", name: "Alice Johnson", email: "alice@axi.local", role: "admin" },
  { id: "2", name: "Bob Smith", email: "bob@axi.local", role: "user" },
  { id: "3", name: "Carol White", email: "carol@axi.local", role: "user" },
];

export const listUsers = route
  .get()
  .query(z.object({ role: z.enum(["admin", "user"]).optional() }))
  .handle(({ query }) => ({
    users: query.role ? users.filter((u) => u.role === query.role) : users,
    total: users.length,
  }));

export const createUser = route
  .post()
  .body(z.object({ name: z.string().min(2), email: z.string().email() }))
  .handle(({ body }) => ({
    user: { id: String(users.length + 1), ...body },
  }));`;

const wsSnippet = `import type { ServerWebSocket, WebSocketContext } from "@axi-js/core";

const online = new Set<string>();

export function upgrade(req: Request) {
  const userId = new URL(req.url).searchParams.get("userId");
  return userId ? { data: { userId } } : false;
}

export function onOpen(ws: ServerWebSocket, ctx: WebSocketContext) {
  online.add((ws.data as any).userId);
  ctx.broadcastJSON({ type: "presence", online: online.size });
}

export function onClose(ws: ServerWebSocket, ctx: WebSocketContext) {
  online.delete((ws.data as any).userId);
  ctx.broadcastJSON({ type: "presence", online: online.size });
}`;

const pageFile: ShowcaseFile = {
  path: "app/page.tsx",
  route: "/",
  language: "tsx",
  dot: "bg-purple-400",
  code: pageSnippet,
};

const apiFile: ShowcaseFile = {
  path: "app/api/users/route.ts",
  route: "/api/users",
  language: "typescript",
  dot: "bg-emerald-400",
  code: apiSnippet,
};

const wsFile: ShowcaseFile = {
  path: "app/ws/presence/route.ts",
  route: "/ws/presence",
  language: "typescript",
  dot: "bg-blue-400",
  code: wsSnippet,
};

const showcaseFiles: ShowcaseFile[] = [pageFile, apiFile, wsFile];

const sampleUsers = [
  {
    id: "1",
    name: "Alice Johnson",
    email: "alice@axi.local",
    role: "admin",
    initials: "AJ",
  },
  {
    id: "2",
    name: "Bob Smith",
    email: "bob@axi.local",
    role: "user",
    initials: "BS",
  },
  {
    id: "3",
    name: "Carol White",
    email: "carol@axi.local",
    role: "user",
    initials: "CW",
  },
];

function CopyButton({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      className="p-1.5 rounded-md text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800 transition-colors"
      aria-label={copied ? "Copied!" : "Copy code"}
    >
      {copied ? (
        <CheckIcon className="h-4 w-4 text-emerald-400" />
      ) : (
        <CopyIcon className="h-4 w-4" />
      )}
    </button>
  );
}

function PageResult() {
  return (
    <div className="w-full max-w-sm mx-auto bg-white p-8 border rounded-lg">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-zinc-900">Team</h3>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 border border-emerald-200 px-2.5 py-1 text-xs font-medium text-emerald-700">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
          3 online
        </span>
      </div>
      <div className="space-y-2">
        {sampleUsers.map((user) => (
          <div
            key={user.id}
            className="flex items-center justify-between rounded-lg border border-zinc-200 bg-white px-3 py-2.5 shadow-sm"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-100 text-xs font-semibold text-zinc-600">
                {user.initials}
              </div>
              <div>
                <div className="text-sm font-medium text-zinc-900">
                  {user.name}
                </div>
                <div className="text-xs text-zinc-500">{user.email}</div>
              </div>
            </div>
            <span
              className={cn(
                "rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide",
                user.role === "admin"
                  ? "bg-blue-50 text-blue-700"
                  : "bg-zinc-100 text-zinc-600"
              )}
            >
              {user.role}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function ApiResult() {
  const json = `{
  "users": [
    { "id": "1", "name": "Alice Johnson", "role": "admin" },
    { "id": "2", "name": "Bob Smith", "role": "user" },
    { "id": "3", "name": "Carol White", "role": "user" }
  ],
  "total": 3
}`;

  return (
    <div className="w-full font-mono text-[13px] leading-6 border rounded-lg">
      <div className="flex items-center justify-between rounded-t-lg border-b border-zinc-800 bg-zinc-900 px-4 py-2.5">
        <span className="text-zinc-400">GET /api/users</span>
        <span className="text-emerald-400">200 OK</span>
      </div>
      <pre className="m-0 whitespace-pre overflow-x-auto px-4 py-3 text-zinc-300">
        {json}
      </pre>
    </div>
  );
}

function WsResult() {
  return (
    <div className="w-full font-mono text-[13px] leading-6">
      <div className="flex items-center gap-2 px-4 py-2.5">
        <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
        <span className="text-zinc-300">3 connected</span>
        <span className="text-zinc-600">· /ws/presence</span>
      </div>
      <div className="space-y-1.5 px-4 py-3 text-zinc-400">
        <div>
          <span className="text-blue-400">broadcastJSON</span>
          <span className="text-zinc-600">{"{ type: \"presence\", online: 3 }"}</span>
        </div>
        <div className="text-zinc-600">
          {"// pushed to every open socket on this route"}
        </div>
      </div>
    </div>
  );
}

export function CodeShowcase() {
  const [activePath, setActivePath] = useState(pageFile.path);
  const active = showcaseFiles.find((f) => f.path === activePath) ?? pageFile;

  return (
    <div className="overflow-hidden rounded-2xl bg-zinc-900 shadow-2xl ring-1 ring-zinc-800">
      {/* Window chrome + tabs */}
      <div className="flex items-center border-b border-zinc-800">
        <div className="flex items-center gap-1.5 px-4 py-3">
          <div className="h-3 w-3 rounded-full bg-red-500/80" />
          <div className="h-3 w-3 rounded-full bg-yellow-500/80" />
          <div className="h-3 w-3 rounded-full bg-green-500/80" />
        </div>
        <div className="flex flex-1 items-center overflow-x-auto whitespace-nowrap">
          {showcaseFiles.map((file) => {
            const isActive = file.path === activePath;
            return (
              <button
                key={file.path}
                type="button"
                onClick={() => setActivePath(file.path)}
                className={cn(
                  "relative flex items-center gap-2 border-r border-zinc-800 px-4 py-3.5 font-mono text-xs transition-colors cursor-pointer",
                  isActive
                    ? "bg-zinc-800 text-zinc-100"
                    : "text-zinc-500 hover:text-zinc-300"
                )}
              >
                <span className={cn("h-1.5 w-1.5 rounded-full", file.dot)} />
                {file.path}
                {isActive && (
                  <span className="absolute inset-x-0 -bottom-px h-0.5 bg-blue-500" />
                )}
              </button>
            );
          })}
        </div>
        <div className="hidden sm:flex items-center px-4">
          <CopyButton code={active.code} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2">
        {/* Code panel */}
        <div className="min-h-[420px] lg:max-h-[540px] overflow-auto border-b lg:border-b-0 lg:border-r border-zinc-800">
          <SyntaxHighlighter
            language={active.language}
            style={vscDarkPlus}
            PreTag="div"
            customStyle={{
              margin: 0,
              background: "transparent",
              fontSize: "0.8125rem",
              lineHeight: 1.7,
              padding: "1.5rem",
            }}
          >
            {active.code}
          </SyntaxHighlighter>
        </div>

        {/* Result panel */}
        <div className="flex min-h-[420px] items-center justify-center bg-zinc-950 p-6 lg:p-10">
          {activePath === pageFile.path ? (
            <PageResult />
          ) : activePath === apiFile.path ? (
            <div className="w-full">
              <ApiResult />
            </div>
          ) : (
            <div className="w-full rounded-lg border border-zinc-800 bg-zinc-900/60">
              <WsResult />
            </div>
          )}
        </div>
      </div>

      {/* File → route strip */}
      <div className="flex items-center justify-between border-t border-zinc-800 bg-zinc-900 px-4 py-2.5 font-mono text-xs">
        <span className="text-zinc-400">{active.path}</span>
        <span className="text-blue-400">→ {active.route}</span>
      </div>
    </div>
  );
}
