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
  return fetch(buildApiUrl(path), {
    ...options,
    credentials: "include",
    headers: {
      Accept: "application/json",
      ...options.headers,
    },
  });
}
