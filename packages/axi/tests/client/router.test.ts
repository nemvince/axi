/**
 * Tests for client-side route pattern creation
 */

import { describe, test, expect } from "bun:test";
import { createRoutePattern } from "../../src/client/router";

describe("createRoutePattern", () => {
  test("creates pattern for static route", () => {
    const { pattern, paramNames, catchallNames } =
      createRoutePattern("/about");
    expect(pattern.test("/about")).toBe(true);
    expect(pattern.test("/other")).toBe(false);
    expect(paramNames).toEqual([]);
    expect(catchallNames).toEqual([]);
  });

  test("creates pattern for dynamic route", () => {
    const { pattern, paramNames, catchallNames } =
      createRoutePattern("/blog/[slug]");
    expect(pattern.test("/blog/hello")).toBe(true);
    expect(pattern.test("/blog/hello/world")).toBe(false);
    expect(paramNames).toEqual(["slug"]);
    expect(catchallNames).toEqual([]);
  });

  test("creates pattern for catch-all route", () => {
    const { pattern, paramNames, catchallNames } =
      createRoutePattern("/blog/[...slug]");
    expect(pattern.test("/blog/hello")).toBe(true);
    expect(pattern.test("/blog/hello/world")).toBe(true);
    expect(pattern.test("/blog")).toBe(false);
    expect(paramNames).toEqual(["slug"]);
    expect(catchallNames).toEqual(["slug"]);
  });

  test("creates pattern for optional catch-all route", () => {
    const { pattern, paramNames, catchallNames } =
      createRoutePattern("/blog/[[...slug]]");
    expect(pattern.test("/blog")).toBe(true);
    expect(pattern.test("/blog/hello/world")).toBe(true);
    expect(paramNames).toEqual(["slug"]);
    expect(catchallNames).toEqual(["slug"]);
  });

  test("creates pattern for root route", () => {
    const { pattern } = createRoutePattern("/");
    expect(pattern.test("/")).toBe(true);
    expect(pattern.test("/other")).toBe(false);
  });
});
