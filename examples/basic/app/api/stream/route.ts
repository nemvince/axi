/**
 * Example SSE streaming route
 */

import { route, sse, type SSEResponse } from "@axi-js/core";

export const streamTokens = route.get().handle((): SSEResponse<{ token: string }> => {
  return sse(async function* () {
    const words = ["Hello", " ", "from", " ", "Axi", " ", "SSE", "!"];

    for (const word of words) {
      yield { token: word };
      await Bun.sleep(100); // Simulate delay
    }
  });
});
