export interface Env {
  ASSETS: Fetcher;
  API_ORIGIN: string;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const incomingUrl = new URL(request.url);
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