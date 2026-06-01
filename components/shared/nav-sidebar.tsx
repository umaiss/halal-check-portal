"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  Settings,
  LogOut,
  ShieldCheck,
  ChevronRight,
  Users,
  FileBarChart2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { clearAuth } from "@/lib/auth";
import { useRole } from "@/hooks/use-role";

const adminNavItems = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "User Management",
    href: "/users",
    icon: Users,
  },
  {
    title: "Reports",
    href: "/reports",
    icon: FileBarChart2,
  },
  {
    title: "Products",
    href: "/products",
    icon: Package,
  },
  // {
  //   title: "Settings",
  //   href: "/settings",
  //   icon: Settings,
  // },
];

const assigneeNavItems = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Products",
    href: "/products",
    icon: Package,
  },
];

export function NavSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const role = useRole();

  const navItems = role === "assignee" ? assigneeNavItems : adminNavItems;

  function handleLogout() {
    clearAuth();
    router.push("/login");
  }

  return (
    <div className="flex flex-col h-screen border-r bg-card w-64 fixed left-0 top-0 overflow-y-auto">
      <div className="p-6 flex items-center gap-3">
        <Image src="/logo.png" alt="Scan Bazar Logo" width={32} height={32} className="rounded-lg object-contain" />
        <span className="font-bold text-xl tracking-tight">Scan Bazar</span>
      </div>

      <div className="flex-1 px-4 space-y-2 mt-4">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <Link key={item.href} href={item.href}>
              <span className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-md transition-all duration-200 group text-sm font-medium",
                isActive
                  ? "bg-primary text-primary-foreground shadow-md"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              )}>
                <item.icon className={cn(
                  "h-4 w-4 shrink-0",
                  isActive ? "text-primary-foreground" : "text-muted-foreground group-hover:text-foreground"
                )} />
                <span className="flex-1">{item.title}</span>
                {isActive && <ChevronRight className="h-3 w-3 opacity-50" />}
              </span>
            </Link>
          );
        })}
      </div>

      <div className="p-4 mt-auto border-t">
        <div className="bg-accent/50 rounded-lg p-3 mb-4">
          <p className="text-xs font-semibold text-muted-foreground uppercase mb-1">Logged in as</p>
          <p className="text-sm font-bold truncate capitalize">{role ?? "—"}</p>
          <p className="text-[10px] text-muted-foreground truncate">
            {role === "assignee" ? "Assignee Account" : "Admin Account"}
          </p>
        </div>
        <Button
          variant="ghost"
          className="w-full justify-start gap-3 text-red-500 hover:text-red-600 hover:bg-red-50/50 dark:hover:bg-red-950/20"
          onClick={handleLogout}
        >
          <LogOut className="h-4 w-4" />
          <span>Logout</span>
        </Button>
      </div>
    </div>
  );
}
