import { redirect } from "@axi/core/client";

export default function DocsPage() {
  // Redirect to the introduction page
  redirect("/docs/introduction");

  return null;
}
