const configuredApiUrl = import.meta.env.VITE_API_URL?.trim();

export const API_BASE_URL = configuredApiUrl
  ? configuredApiUrl.replace(/\/+$/, "")
  : "";

export function buildApiUrl(path: string) {
  if (!path.startsWith("/")) {
    throw new Error(`API path must start with "/": ${path}`);
  }

  // When loaded directly on srmaacademy.com, Cloudflare Worker handles reverse proxy for /api.
  // Using relative path ensures same-origin request semantics, avoiding cross-domain CORS and cookie issues.
  if (typeof window !== "undefined" && window.location.hostname.endsWith("srmaacademy.com")) {
    return path;
  }

  return API_BASE_URL ? `${API_BASE_URL}${path}` : path;
}

export function apiFetch(path: string, options: RequestInit = {}) {
  const method = (options.method || "GET").toUpperCase();
  const maxAttempts = method === "GET" ? 3 : 1;
  const retryableStatuses = new Set([408, 429, 500, 502, 503, 504, 520, 521, 522, 523, 524]);

  const wait = (milliseconds: number) => new Promise((resolve) => setTimeout(resolve, milliseconds));
  const request = () => fetch(buildApiUrl(path), {
    ...options,
    credentials: "include",
    headers: {
      Accept: "application/json",
      ...options.headers,
    },
  });

  return (async () => {
    for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
      let response: Response;
      try {
        response = await request();
      } catch (error) {
        if (attempt === maxAttempts - 1 || options.signal?.aborted) throw error;
        await wait(300 * (attempt + 1));
        continue;
      }

      if (!retryableStatuses.has(response.status) || attempt === maxAttempts - 1) {
        return response;
      }
      await response.body?.cancel().catch(() => undefined);
      await wait(300 * (attempt + 1));
    }

    throw new Error("API read request failed after retrying.");
  })();
}
