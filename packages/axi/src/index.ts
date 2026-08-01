/**
 * Axi - A minimal full-stack framework built on Bun
 *
 * Features:
 * - File-based routing (Next.js style)
 * - React SSR and client-side rendering
 * - API routes
 * - WebSocket support
 * - Zero configuration
 */

export { buildServerConfig } from "./core/server";
export type {
    AxiServerConfig, RouteHandler, ServerWebSocket,
    WebSocketContext, WsRouteModule
} from "./core/server";

export { resolveConfig } from "./core/config";
export type {
    AxiConfig, CorsConfig, ResolvedAxiConfig
} from "./core/config";

export {
    buildForProduction, getBuildMetadata, hasBuildArtifacts
} from "./core/build";
export type { BuildMetadata } from "./core/build";

export type {
    AxiRequest, LayoutModule, LayoutProps, LoaderContext, MiddlewareContext, MiddlewareModule, MiddlewareResult, OpenGraphImage, OpenGraphMetadata, PageMetadata, PageModule, PageProps, Route,
    RouteMatch, SSEResponse, StreamingResponse, TwitterMetadata
} from "./core/types";

export { defineMiddleware, error, json, route, sse, stream } from "./core/route";
export type { AfterHook, BeforeHook, HttpMethod, RouteMeta } from "./core/route";

export {
    ApiError, errors,
    problemResponse, ValidationError
} from "./core/errors";
export type {
    FieldError, ProblemDetails,
    ValidationProblemDetails
} from "./core/errors";

// Middleware utilities
export {
    createSetCookie, deleteCookie, getCookie, parseCookies, redirect, setCookie
} from "./core/middleware";
export type { CookieOptions } from "./core/middleware";

