/**
 * Client-side router for Axi
 * Handles client-side navigation, route matching, and loader data fetching
 */

import React, {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useState,
} from "react";
import { getApplicableLayoutPaths } from "../core/shared";
import type { LayoutProps, PageProps } from "../core/types";

/**
 * Router context for sharing navigation state
 */
interface RouterContextValue {
  pathname: string;
  navigate: (path: string) => Promise<void>;
  params: Record<string, string | string[]>;
  isNavigating: boolean;
}

const RouterContext = createContext<RouterContextValue | null>(null);

export interface RouteConfig {
  path: string;
  component: React.ComponentType<PageProps>;
  pattern: RegExp;
  paramNames: string[];
  catchallNames?: string[];
}

export interface RouterProps {
  routes: RouteConfig[];
  layouts?: Map<string, React.ComponentType<LayoutProps>>;
  notFound?: React.ComponentType;
  initialLoaderData?: unknown;
  initialLayoutData?: unknown[];
}

/**
 * Match a URL path against a route pattern
 */
function matchRoute(
  pathname: string,
  route: RouteConfig
): { params: Record<string, string | string[]> } | null {
  const match = pathname.match(route.pattern);
  if (!match) return null;

  const params: Record<string, string | string[]> = {};
  route.paramNames.forEach((name, i) => {
    const value = match[i + 1] || "";
    params[name] = route.catchallNames?.includes(name)
      ? value
        ? value.split("/")
        : []
      : value;
  });

  return { params };
}

/**
 * Convert route pattern to RegExp
 * /blog/[slug] -> /blog/([^/]+)
 * /blog/[...slug] -> /blog/(.+)
 * /blog/[[...slug]] -> /blog/(.*)
 */
export function createRoutePattern(path: string): {
  pattern: RegExp;
  paramNames: string[];
  catchallNames: string[];
} {
  const paramNames: string[] = [];
  const catchallNames: string[] = [];

  const segments = path.split("/").filter(Boolean);
  if (segments.length === 0) {
    return { pattern: /^\/$/, paramNames, catchallNames };
  }

  const regexPath = segments
    .map((segment) => {
      const optionalCatchall = segment.match(/^\[\[\.\.\.([^\]]+)\]\]$/);
      if (optionalCatchall) {
        paramNames.push(optionalCatchall[1]!);
        catchallNames.push(optionalCatchall[1]!);
        return "(?:/(.*))?";
      }

      const catchall = segment.match(/^\[\.\.\.([^\]]+)\]$/);
      if (catchall) {
        paramNames.push(catchall[1]!);
        catchallNames.push(catchall[1]!);
        return "/(.+)";
      }

      const dynamic = segment.match(/^\[([^\]]+)\]$/);
      if (dynamic) {
        paramNames.push(dynamic[1]!);
        return "/([^/]+)";
      }

      return "/" + segment;
    })
    .join("");

  return {
    pattern: new RegExp("^" + regexPath + "$"),
    paramNames,
    catchallNames,
  };
}

/**
 * Get applicable layouts for a path
 */
function getLayoutsForPath(
  pathname: string,
  layouts?: Map<string, React.ComponentType<LayoutProps>>
): React.ComponentType<LayoutProps>[] {
  if (!layouts) return [];

  const applicableLayouts: React.ComponentType<LayoutProps>[] = [];

  // Get layout paths using shared utility
  const layoutPaths = getApplicableLayoutPaths(pathname);

  // Collect layouts in order
  for (const path of layoutPaths) {
    const layout = layouts.get(path);
    if (layout) applicableLayouts.push(layout);
  }

  return applicableLayouts;
}

/**
 * Wrap content with layouts from innermost to outermost
 */
function wrapWithLayouts(
  content: React.ReactElement,
  layouts: React.ComponentType<LayoutProps>[],
  layoutData?: unknown[]
): React.ReactElement {
  let wrapped = content;
  for (let i = layouts.length - 1; i >= 0; i--) {
    const Layout = layouts[i];
    if (Layout) {
      wrapped = <Layout data={layoutData?.[i]}>{wrapped}</Layout>;
    }
  }
  return wrapped;
}

/**
 * Fetch loader data from the server
 */
async function fetchLoaderData(
  pathname: string,
  params: Record<string, string | string[]>,
  query: Record<string, string>
): Promise<{ data: unknown; layoutData?: unknown[] }> {
  try {
    const res = await fetch("/__axi/loader", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pathname, params, query }),
    });
    const json = await res.json();

    // Handle middleware redirect
    if (json.redirect) {
      window.location.href = json.redirect;
      return { data: undefined };
    }

    return { data: json.data, layoutData: json.layoutData };
  } catch {
    return { data: undefined };
  }
}

/**
 * Client-side router component
 */
export function Router({
  routes,
  layouts,
  notFound,
  initialLoaderData,
  initialLayoutData,
}: RouterProps) {
  const [currentPath, setCurrentPath] = useState(() =>
    typeof window !== "undefined" ? window.location.pathname : "/"
  );
  const [loaderData, setLoaderData] = useState<unknown>(initialLoaderData);
  const [layoutData, setLayoutData] = useState<unknown[] | undefined>(
    initialLayoutData
  );
  const [isNavigating, setIsNavigating] = useState(false);

  // Find matching route for current path
  const findMatchingRoute = useCallback(
    (pathname: string) => {
      for (const route of routes) {
        const match = matchRoute(pathname, route);
        if (match) {
          return { route, match };
        }
      }
      return null;
    },
    [routes]
  );

  // Navigate function for programmatic navigation
  const navigateTo = useCallback(
    async (path: string) => {
      if (typeof window === "undefined") return;
      if (path === currentPath) return;

      setIsNavigating(true);

      // Parse the new path
      const url = new URL(path, window.location.origin);
      const newPath = url.pathname;

      // Find matching route to extract params
      const matched = findMatchingRoute(newPath);
      const params = matched?.match.params || {};

      // Get query params
      const query: Record<string, string> = {};
      url.searchParams.forEach((value, key) => {
        query[key] = value;
      });

      // Fetch loader data
      const { data, layoutData } = await fetchLoaderData(newPath, params, query);

      // Update state
      setLoaderData(data);
      setLayoutData(layoutData);
      window.history.pushState({}, "", path);
      setCurrentPath(newPath);
      setIsNavigating(false);

      // Scroll to top
      window.scrollTo(0, 0);
    },
    [currentPath, findMatchingRoute]
  );

  useEffect(() => {
    if (typeof window === "undefined") return;

    // Handle popstate (back/forward buttons)
    const handlePopState = async () => {
      const newPath = window.location.pathname;
      setIsNavigating(true);

      // Find matching route to extract params
      const matched = findMatchingRoute(newPath);
      const params = matched?.match.params || {};

      // Get query params
      const query: Record<string, string> = {};
      new URL(window.location.href).searchParams.forEach((value, key) => {
        query[key] = value;
      });

      // Fetch loader data for back/forward navigation
      const { data, layoutData } = await fetchLoaderData(newPath, params, query);

      setLoaderData(data);
      setLayoutData(layoutData);
      setCurrentPath(newPath);
      setIsNavigating(false);
    };

    window.addEventListener("popstate", handlePopState);

    // Intercept link clicks for client-side navigation
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const link = target.closest?.("a");

      if (
        link &&
        link.href &&
        link.href.startsWith(window.location.origin) &&
        !link.target &&
        !link.download &&
        !e.metaKey &&
        !e.ctrlKey &&
        !e.shiftKey &&
        !e.altKey
      ) {
        const newPath = new URL(link.href).pathname;

        // Don't intercept API routes or socket routes - let browser make direct request
        if (newPath.startsWith("/api/") || newPath.startsWith("/sockets/")) {
          return; // Let browser handle the request directly
        }

        e.preventDefault();
        navigateTo(link.href);
      }
    };

    document.addEventListener("click", handleClick);

    return () => {
      window.removeEventListener("popstate", handlePopState);
      document.removeEventListener("click", handleClick);
    };
  }, [findMatchingRoute, navigateTo]);

  // Find matching route
  const matched = findMatchingRoute(currentPath);
  const matchedRoute = matched?.route || null;
  const routeMatch = matched?.match || null;

  // Get query parameters
  const query: Record<string, string> = {};
  if (typeof window !== "undefined") {
    const searchParams = new URL(window.location.href).searchParams;
    searchParams.forEach((value, key) => {
      query[key] = value;
    });
  }

  // Context value for child components
  const contextValue: RouterContextValue = {
    pathname: currentPath,
    navigate: navigateTo,
    params: routeMatch?.params || {},
    isNavigating,
  };

  // Render content
  let content: React.ReactElement;

  if (!matchedRoute) {
    // Render 404 if no match
    const NotFoundComponent = notFound || DefaultNotFound;
    const applicableLayouts = getLayoutsForPath(currentPath, layouts);
    content = wrapWithLayouts(
      <NotFoundComponent />,
      applicableLayouts,
      layoutData
    );
  } else {
    // Render matched route
    const PageComponent = matchedRoute.component;
    const pageProps: PageProps = {
      params: routeMatch?.params || {},
      query,
      data: loaderData,
    };

    const applicableLayouts = getLayoutsForPath(currentPath, layouts);
    content = wrapWithLayouts(
      <PageComponent {...pageProps} />,
      applicableLayouts,
      layoutData
    );
  }

  return (
    <RouterContext.Provider value={contextValue}>
      {content}
    </RouterContext.Provider>
  );
}

/**
 * Default 404 component
 */
function DefaultNotFound() {
  return (
    <div style={{ padding: "2rem", textAlign: "center" }}>
      <h1>404 - Page Not Found</h1>
      <p>The page you're looking for doesn't exist.</p>
      <a href="/">← Back to Home</a>
    </div>
  );
}

/**
 * Hook to access router state and navigation
 */
export function useRouter() {
  const context = useContext(RouterContext);

  // During SSR, return safe defaults since there's no Router provider
  if (!context) {
    if (typeof window === "undefined") {
      return {
        pathname: "/",
        navigate: async () => {},
        params: {},
        isNavigating: false,
      };
    }

    throw new Error("useRouter must be used within a Router component");
  }
  return context;
}

/**
 * Hook to access route parameters
 * @example
 * // In /blog/[blogId]/page.tsx
 * const { blogId } = useParams();
 */
export function useParams(): Record<string, string | string[]> {
  const context = useContext(RouterContext);
  if (!context) {
    // During SSR, return empty params since there's no Router provider
    if (typeof window === "undefined") {
      return {};
    }
    throw new Error("useParams must be used within a Router component");
  }
  return context.params;
}

/**
 * Navigate programmatically (for non-React contexts)
 */
export function navigate(path: string) {
  if (typeof window !== "undefined") {
    window.history.pushState({}, "", path);
    window.dispatchEvent(new PopStateEvent("popstate"));
  }
}

/**
 * Redirect to a path
 */
export function redirect(path: string) {
  if (typeof window !== "undefined") {
    window.location.replace(path);
  }
}
