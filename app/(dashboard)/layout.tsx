import { NavSidebar } from "@/components/shared/nav-sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex">
      <NavSidebar />
      <main className="flex-1 pl-64 min-h-screen bg-muted/30">
        <div className="container py-8 px-8 max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
