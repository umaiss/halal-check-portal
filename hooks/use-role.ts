"use client";

import { useEffect, useState } from "react";
import { getUserRole, UserRole } from "@/lib/auth";

/**
 * Returns the current user's role, hydrated from localStorage.
 * Returns `null` while the component is still mounting (SSR-safe).
 */
export function useRole(): UserRole | null {
  const [role, setRole] = useState<UserRole | null>(null);

  useEffect(() => {
    setRole(getUserRole());
  }, []);

  return role;
}
