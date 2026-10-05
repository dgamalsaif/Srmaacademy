// Pages crawlers do not run React. Give them the currently saved image version.
// Opportunity-specific previews remain handled by the existing Worker/share API.
declare const HTMLRewriter: {
  new(): { on(selector: string, handler: { element(element: { setAttribute(key: string, value: string): void }): void }): any; transform(response: Response): Response };
};

export async function onRequest(context: { request: Request; next(): Promise<Response> }): Promise<Response> {
  const request = context.request;
  const url = new URL(request.url);
  const bot = /bot|crawl|spider|whatsapp|telegram|facebookexternalhit|facebot|meta-externalagent|meta-externalfetcher|linkedin|slack|discord|pinterest|curl/i.test(request.headers.get("user-agent") || "");
  const response = await context.next();
  if (!bot || !response.headers.get("content-type")?.includes("text/html") ||
      /^\/(?:api|research|share)(?:\/|$)/.test(url.pathname) || url.pathname === "/survey") return response;
  try {
    const metadataResponse = await fetch(new URL("/api/site-share-metadata", url.origin), {
      headers: { Accept: "application/json" }, signal: AbortSignal.timeout(8000), cache: "no-store",
    });
    if (!metadataResponse.ok) return response;
    const metadata = await metadataResponse.json() as { imagePath?: string };
    if (!metadata.imagePath?.match(/^\/api\/site-share-image\?v=[a-f0-9]{16}$/)) return response;
    const imageUrl = new URL(metadata.imagePath, url.origin).href;
    const handler = { element(element: { setAttribute(key: string, value: string): void }) { element.setAttribute("content", imageUrl); } };
    const rewritten = new HTMLRewriter()
      .on('meta[property="og:image"]', handler)
      .on('meta[property="og:image:secure_url"]', handler)
      .on('meta[name="twitter:image"]', handler)
      .transform(response);
    const headers = new Headers(rewritten.headers);
    headers.set("Cache-Control", "no-store");
    headers.delete("etag");
    return new Response(rewritten.body, { status: rewritten.status, headers });
  } catch {
    // The static HTML still points to the live image endpoint if metadata is down.
    return response;
  }
}