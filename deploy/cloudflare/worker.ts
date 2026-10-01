export interface Env {
  ASSETS: Fetcher;
  API_ORIGIN: string;
}

const BOT_USER_AGENTS = /bot|crawl|spider|whatsapp|telegram|facebookexternalhit|facebot|twitterbot|linkedin|slack|discord|pinterest|skype|applebot|curl|wget|meta-externalagent/i;

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

      return fetch(upstreamUrl, {
        method: request.method,
        headers,
        body: request.method === "GET" || request.method === "HEAD" ? undefined : request.body,
        redirect: "manual",
      });
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

    return fetch(upstreamUrl, {
      method: request.method,
      headers,
      body: request.method === "GET" || request.method === "HEAD" ? undefined : request.body,
      redirect: "manual",
    });
  },
} satisfies ExportedHandler<Env>;