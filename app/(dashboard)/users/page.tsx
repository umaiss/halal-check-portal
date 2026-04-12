"use client";

import { RoleGuard } from "@/components/shared/role-guard";

export default function UsersPage() {
  return (
    <RoleGuard allowedRoles={["admin"]}>
      <div className="space-y-8 animate-in fade-in duration-500">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight">User Management</h1>
          <p className="text-muted-foreground mt-2 text-lg">
            Manage admin and assignee accounts.
          </p>
        </div>
        
        <div className="flex h-64 items-center justify-center border rounded-xl border-dashed">
          <p className="text-muted-foreground font-medium">User management functionality coming soon.</p>
        </div>
      </div>
    </RoleGuard>
  );
}
