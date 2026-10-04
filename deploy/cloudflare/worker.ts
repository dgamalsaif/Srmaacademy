export interface Env {
  ASSETS?: Fetcher;
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
    const surveyId = incomingUrl.pathname === "/survey"
      ? incomingUrl.searchParams.get("rid")?.match(/^(?:RES-2026-)?(\d+)$/)?.[1]
      : undefined;

    // If it's a social media bot requesting an opportunity or an explicit share path, proxy to API share endpoint
    if ((researchMatch && isBot) || (surveyId && isBot) || shareMatch) {
      const oppId = surveyId || (researchMatch || shareMatch)![1];
      const apiOrigin = env.API_ORIGIN.replace(/\/+$/, "");
      const upstreamUrl = new URL(`/api/programs/${oppId}/share${incomingUrl.search}`, apiOrigin);
      const headers = new Headers(request.headers);
      headers.set("x-forwarded-host", incomingUrl.host);
      headers.set("x-forwarded-proto", incomingUrl.protocol.replace(":", ""));
      headers.delete("host");

      return fetchApiWithRetry(request, upstreamUrl, headers);
    }

    if (!incomingUrl.pathname.startsWith("/api/")) {
      // An API-only routed Worker has no ASSETS binding: continue to the
      // existing Pages origin without changing the visitor's URL.
      return env.ASSETS ? env.ASSETS.fetch(request) : fetch(request);
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