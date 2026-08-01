/**
 * About page - Client-side rendered by default
 */

import { useRouter } from "@axi/core/client";

export default function About() {
  const { navigate } = useRouter();

  return (
    <div className="card">
      <h1>About Axi</h1>
      <p style={{ marginTop: "1rem" }}>
        A full-stack framework for Bun. Everything you need—REST APIs, web apps,
        and real-time WebSockets—powered by just Bun and React.
      </p>

      <h2 style={{ marginTop: "2rem", marginBottom: "1rem" }}>How It Works</h2>
      <p style={{ marginBottom: "1rem", color: "#666" }}>
        Create files in your <code>app/</code> directory. Axi automatically
        turns them into routes:
      </p>
      <ul style={{ marginLeft: "1.5rem", color: "#666" }}>
        <li>
          <code>app/page.tsx</code> → <code>/</code> route
        </li>
        <li>
          <code>app/about/page.tsx</code> → <code>/about</code> route
        </li>
        <li>
          <code>app/api/users/route.ts</code> → <code>/api/users</code> endpoint
        </li>
        <li>
          <code>app/ws/chat/route.ts</code> → <code>/ws/chat</code> WebSocket
        </li>
      </ul>

      <h2 style={{ marginTop: "2rem", marginBottom: "1rem" }}>
        What It Provides
      </h2>
      <ul style={{ marginLeft: "1.5rem" }}>
        <li>
          <strong>REST API:</strong> Define typed handlers with{" "}
          <code>route.get().handle()</code> and get an auto-generated typed
          client
        </li>
        <li>
          <strong>Web App:</strong> React pages with SSR and server-side data
          loading via <code>loader</code>
        </li>
        <li>
          <strong>WebSockets:</strong> Real-time routes in <code>app/ws/</code>{" "}
          with <code>onOpen</code>, <code>onMessage</code>, and{" "}
          <code>onClose</code> handlers
        </li>
        <li>
          <strong>Streaming:</strong> <code>stream()</code> and{" "}
          <code>sse()</code> responses consumed with <code>useStream</code>
        </li>
      </ul>

      <div style={{ marginTop: "2rem" }}>
        <button
          style={{
            padding: "0.5rem 1rem",
            background: "#000",
            color: "#fff",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer",
            fontSize: "0.875rem",
          }}
          onClick={() => navigate("/")}
        >
          Back to Home
        </button>
      </div>
    </div>
  );
}
