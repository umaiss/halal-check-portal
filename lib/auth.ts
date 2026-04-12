import { AUTH_TOKEN_KEY, USER_ROLE_KEY } from "@/lib/constants";

export type UserRole = "admin" | "assignee";

/**
 * Decodes the `role` claim from a JWT without verifying the signature.
 * Works purely client-side — signature verification is the backend's job.
 */
export function decodeJwtRole(token: string): UserRole | null {
  try {
    const payloadBase64 = token.split(".")[1];
    if (!payloadBase64) return null;
    // base64url → base64, then decode
    const json = atob(payloadBase64.replace(/-/g, "+").replace(/_/g, "/"));
    const payload = JSON.parse(json);
    
    console.log("=== JWT DECODE DEBUG ===");
    console.log("Decoded Token Payload:", payload);
    
    const raw: string | undefined = 
      payload.role ?? 
      payload.user_type ?? 
      payload.userRole ?? 
      payload.user?.role ??
      payload.type ??
      payload.user_type;
      
    console.log("Raw Extracted Role:", raw);

    if (!raw) return null;
    const normalized = raw.toLowerCase();
    if (normalized === "admin") return "admin";
    if (normalized === "assignee") return "assignee";
    return null;
  } catch {
    return null;
  }
}

/** Returns the cached role from localStorage, or null if not set. */
export function getUserRole(): UserRole | null {
  if (typeof window === "undefined") return null;
  const role = localStorage.getItem(USER_ROLE_KEY);
  if (role === "admin" || role === "assignee") return role;
  return null;
}

/** Persists the role to localStorage. */
export function setUserRole(role: UserRole): void {
  localStorage.setItem(USER_ROLE_KEY, role);
}

/** Removes both the auth token and cached role from localStorage. */
export function clearAuth(): void {
  localStorage.removeItem(AUTH_TOKEN_KEY);
  localStorage.removeItem(USER_ROLE_KEY);
}
