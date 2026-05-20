import { AUTH_TOKEN_KEY } from "./constants";
import { clearAuth } from "./auth";

/**
 * A wrapper around standard `fetch` that automatically injects the auth token
 * and handles `401 Unauthorized` responses by clearing local session and
 * redirecting to the login page.
 */
export async function apiFetch(url: string, options: RequestInit = {}): Promise<Response> {
  const token = typeof window !== "undefined" ? localStorage.getItem(AUTH_TOKEN_KEY) : null;

  const headers = new Headers(options.headers || {});
  if (token && !headers.has("Authorization")) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const res = await fetch(url, {
    ...options,
    headers,
  });

  if (res.status === 401 && typeof window !== "undefined") {
    clearAuth();
    // Redirect to login page
    window.location.href = "/login";
  }

  return res;
}
