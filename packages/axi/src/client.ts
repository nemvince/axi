/**
 * Axi Client - Client-side utilities
 * Safe for browser usage (no Node.js APIs)
 */

export { navigate, redirect, useParams, useRouter } from "./client/router";
export { useClientEffect } from "./client/useClientEffect";
export { useIsClient } from "./client/useIsClient";
export { clearQueryCache, clearQueryCacheKey, createQueryHook } from "./client/useQuery";
export type { UseQueryOptions, UseQueryResult } from "./client/useQuery";
export { useStream } from "./client/useStream";
export type { UseStreamOptions, UseStreamResult } from "./client/useStream";

