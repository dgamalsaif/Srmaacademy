export interface Env {
  ASSETS: Fetcher;
  API_ORIGIN: string;
}

const BOT_USER_AGENTS = /bot|crawl|spider|whatsapp|telegram|facebookexternalhit|facebot|twitterbot|linkedin|slack|discord|pinterest|skype|applebot|curl|wget|meta-externalagent/i;
const RETRYABLE_API_STATUSES = new Set([500, 502, 503, 504]);

async function fetchApiWithRetry(request: Request, upstreamUrl: URL, headers: Headers): Promise<Response> {
  const maxAttempts = request.method === "GET" || request.method === "HEAD" ? 3 : 1;

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const response = await fetch(upstreamUrl, {
      method: request.method,
      headers,
      body: request.method === "GET" || request.method === "HEAD" ? undefined : request.body,
      redirect: "manual",
    });

    if (attempt === maxAttempts - 1 || !RETRYABLE_API_STATUSES.has(response.status)) {
      return response;
    }

    if (response.body) {
      await response.body.cancel().catch(() => undefined);
    }
    await new Promise((resolve) => setTimeout(resolve, attempt === 0 ? 500 : 1500));
  }

  throw new Error("API retry loop ended unexpectedly.");
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const incomingUrl = new URL(request.url);
    const userAgent = request.headers.get("user-agent") || "";
    const isBot = BOT_USER_AGENTS.test(userAgent) || incomingUrl.searchParams.get("crawler") === "1" || incomingUrl.searchParams.get("preview") === "1";
    const researchMatch = incomingUrl.pathname.match(/^\/research\/(\d+)\/?$/);
    const shareMatch = incomingUrl.pathname.match(/^\/share\/research\/(\d+)\/?$/);

    // If it's a social media bot requesting an opportunity or an explicit share path, proxy to API share endpoint
    if ((researchMatch && isBot) || shareMatch) {
      const oppId = (researchMatch || shareMatch)![1];
      const apiOrigin = env.API_ORIGIN.replace(/\/+$/, "");
      const upstreamUrl = new URL(`/api/programs/${oppId}/share${incomingUrl.search}`, apiOrigin);
      const headers = new Headers(request.headers);
      headers.set("x-forwarded-host", incomingUrl.host);
      headers.set("x-forwarded-proto", incomingUrl.protocol.replace(":", ""));
      headers.delete("host");

      return fetchApiWithRetry(request, upstreamUrl, headers);
    }

    if (!incomingUrl.pathname.startsWith("/api/")) {
      return env.ASSETS.fetch(request);
    }

    const apiOrigin = env.API_ORIGIN.replace(/\/+$/, "");
    const upstreamUrl = new URL(`${incomingUrl.pathname}${incomingUrl.search}`, apiOrigin);
    const headers = new Headers(request.headers);
    headers.set("x-forwarded-host", incomingUrl.host);
    headers.set("x-forwarded-proto", incomingUrl.protocol.replace(":", ""));
    headers.delete("host");

    return fetchApiWithRetry(request, upstreamUrl, headers);
  },
} satisfies ExportedHandler<Env>;