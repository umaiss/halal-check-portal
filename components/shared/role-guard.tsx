"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { useRole } from "@/hooks/use-role";
import { UserRole } from "@/lib/auth";

interface RoleGuardProps {
  allowedRoles: UserRole[];
  redirectTo?: string;
  children: React.ReactNode;
}

/**
 * Wraps page content and redirects users whose role is not in `allowedRoles`.
 * Shows a centered spinner while the role is being determined (avoids flash).
 */
export function RoleGuard({
  allowedRoles,
  redirectTo = "/products",
  children,
}: RoleGuardProps) {
  const role = useRole();
  const router = useRouter();
  // null = still hydrating; undefined = not logged in
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    // Wait for hydration (role starts as null)
    if (role === null) return;

    if (!allowedRoles.includes(role)) {
      router.replace(redirectTo);
    } else {
      setIsChecking(false);
    }
  }, [role, allowedRoles, redirectTo, router]);

  // Show spinner until we confirm the role is allowed
  if (isChecking) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return <>{children}</>;
}
