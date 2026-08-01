import { redirect } from "@axi-js/core/client";

export default function DocsPage() {
  // Redirect to the introduction page
  redirect("/docs/introduction");

  return null;
}
