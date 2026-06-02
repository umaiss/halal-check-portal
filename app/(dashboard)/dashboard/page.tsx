"use client";

import React, { useState, useEffect } from "react";
import {
  Search,
  AlertCircle,
  CheckCircle2,
  Clock,
  ArrowRight,
  Loader2,
  CheckCircle
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { StatsCard } from "@/components/shared/stats-card";
import { StatusBadge } from "@/components/shared/status-badge";
import { DUMMY_STATS } from "@/lib/dummy-data";
import { ScannedProduct, AssigneeStats } from "@/types/product";
import { API_ENDPOINTS } from "@/lib/constants";
import { apiFetch } from "@/lib/api";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { format } from "date-fns";
import { useRole } from "@/hooks/use-role";

export default function DashboardPage() {
  const router = useRouter();
  const role = useRole();
  const isAssignee = role === "assignee";

  const [recentProducts, setRecentProducts] = useState<ScannedProduct[]>([]);
  const [assigneeStats, setAssigneeStats] = useState<AssigneeStats | null>(null);
  const [adminStats, setAdminStats] = useState<{
    total: number;
    halal: number;
    haram: number;
    mushbooh: number;
    pending: number;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const handleViewProduct = (product: ScannedProduct | { id: number }) => {
    if ('ingredient_text' in product) {
      sessionStorage.setItem('selectedProduct', JSON.stringify(product));
    } else {
      sessionStorage.removeItem('selectedProduct');
    }
    router.push(`/products/${product.id}`);
  };

  useEffect(() => {
    async function fetchData() {
      try {
        if (isAssignee) {
          // Fetch assignee stats
          const statsRes = await apiFetch(API_ENDPOINTS.MY_STATS);
          if (statsRes.ok) {
            setAssigneeStats(await statsRes.json());
          }
        } else {
          // Fetch recent products for admin
          const response = await apiFetch(API_ENDPOINTS.SCANNED_PRODUCTS);
          if (response.ok) {
            const data = await response.json();
            setRecentProducts(data.slice(0, 5));
          }
          // Fetch admin stats
          const statsRes = await apiFetch(API_ENDPOINTS.ADMIN_STATS);
          if (statsRes.ok) {
            setAdminStats(await statsRes.json());
          }
        }
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
      } finally {
        setIsLoading(false);
      }
    }
    if (role) fetchData();
  }, [role, isAssignee]);

  if (!role) return <div className="flex h-screen items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>;

  // ─── Assignee View ─────────────────────────────────────────────────────────
  if (isAssignee) {
    return (
      <div className="space-y-10 animate-in fade-in duration-500">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight">Welcome Back</h1>
          <p className="text-muted-foreground mt-2 text-lg">
            Here's an overview of your review activity and performance.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <StatsCard
            title="Total Reviewed"
            value={assigneeStats?.total_reviewed.toLocaleString() || "0"}
            icon={CheckCircle}
            description="Tasks completed so far"
            className="bg-white border-l-4 border-l-blue-500"
            iconClassName="bg-blue-50"
          />
          <StatsCard
            title="Halal"
            value={assigneeStats?.halal_count.toLocaleString() || "0"}
            icon={CheckCircle2}
            description="Products marked as Halal"
            className="bg-white border-l-4 border-l-green-500"
            iconClassName="bg-green-50"
          />
          <StatsCard
            title="Haram"
            value={assigneeStats?.haram_count.toLocaleString() || "0"}
            icon={AlertCircle}
            description="Products marked as Haram"
            className="bg-white border-l-4 border-l-red-500"
            iconClassName="bg-red-50"
          />
          <StatsCard
            title="Mushbooh"
            value={assigneeStats?.mushbooh_count.toLocaleString() || "0"}
            icon={Clock}
            description="Back to Mushbooh status"
            className="bg-white border-l-4 border-l-yellow-500"
            iconClassName="bg-yellow-50"
          />
        </div>

        {/* Recent Activity */}
        <Card className="shadow-xl border-none overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between pb-4">
            <div>
              <CardTitle className="text-2xl font-bold">Recent Reviews</CardTitle>
              <CardDescription className="text-base">
                Your most recently completed product reviews.
              </CardDescription>
            </div>
            <Link href="/products">
              <Button variant="outline" size="sm" className="gap-2 font-semibold">
                View History <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow>
                  <TableHead className="pl-6 py-4 font-bold uppercase tracking-wider text-[10px] text-muted-foreground">Product</TableHead>
                  <TableHead className="py-4 font-bold uppercase tracking-wider text-[10px] text-muted-foreground">Verdict</TableHead>
                  <TableHead className="py-4 font-bold uppercase tracking-wider text-[10px] text-muted-foreground hidden sm:table-cell">Reviewed At</TableHead>
                  <TableHead className="py-4 font-bold uppercase tracking-wider text-[10px] text-muted-foreground text-right pr-6">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow><TableCell colSpan={4} className="h-32 text-center"><Loader2 className="h-6 w-6 animate-spin mx-auto" /></TableCell></TableRow>
                ) : !assigneeStats || assigneeStats.reviewed_products.length === 0 ? (
                  <TableRow><TableCell colSpan={4} className="h-32 text-center text-muted-foreground">No recent reviews found.</TableCell></TableRow>
                ) : (
                  assigneeStats.reviewed_products.slice(0, 5).map((product) => (
                    <TableRow key={product.id} className="hover:bg-muted/30 transition-colors">
                      <TableCell className="pl-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="h-12 w-12 rounded-lg overflow-hidden bg-muted border">
                            {product.front_image || product.back_image || product.ingredients_image ? <img src={product.front_image || product.back_image || product.ingredients_image} className="h-full w-full object-cover" /> : <div className="h-full w-full flex items-center justify-center text-[10px]">N/A</div>}
                          </div>
                          <span className="font-medium text-sm truncate max-w-[200px]">{product.ingredient_text}</span>
                        </div>
                      </TableCell>
                      <TableCell className="py-4">
                        <StatusBadge status={product.status} />
                      </TableCell>
                      <TableCell className="py-4 hidden sm:table-cell text-sm text-muted-foreground">
                        {product.created_at ? format(new Date(product.created_at), "MMM d, HH:mm") : "N/A"}
                      </TableCell>
                      <TableCell className="py-4 text-right pr-6">
                        <Button variant="ghost" size="sm" onClick={() => handleViewProduct(product)} className="font-semibold">View</Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    );
  }

  // ─── Admin View ────────────────────────────────────────────────────────────
  return (
    <div className="space-y-10 animate-in fade-in duration-500">
      <div>
        <h1 className="text-4xl font-extrabold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground mt-2 text-lg">
          Overview of recent product scans and activity.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total Products"
          value={adminStats?.total.toLocaleString() || "0"}
          icon={Search}
          trend={{ value: 12, isUp: true }}
          description="vs last month"
          className="bg-white border-l-4 border-l-blue-500"
          iconClassName="bg-blue-50"
        />
        <StatsCard
          title="Halal Products"
          value={adminStats?.halal.toLocaleString() || "0"}
          icon={CheckCircle2}
          trend={{ value: 8, isUp: true }}
          description="growing steadily"
          className="bg-white border-l-4 border-l-green-500"
          iconClassName="bg-green-50"
        />
        <StatsCard
          title="Haram Products"
          value={adminStats?.haram.toLocaleString() || "0"}
          icon={AlertCircle}
          trend={{ value: 2, isUp: false }}
          description="flagged recently"
          className="bg-white border-l-4 border-l-red-500"
          iconClassName="bg-red-50"
        />
        <StatsCard
          title="Mushbooh"
          value={adminStats?.mushbooh.toLocaleString() || "0"}
          icon={Clock}
          trend={{ value: 5, isUp: true }}
          description="pending review"
          className="bg-white border-l-4 border-l-yellow-500"
          iconClassName="bg-yellow-50"
        />
      </div>

      <div className="grid gap-8 lg:grid-cols-7">
        <Card className="lg:col-span-7 shadow-xl border-none overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between pb-4">
            <div>
              <CardTitle className="text-2xl font-bold">Recent Scans</CardTitle>
              <CardDescription className="text-base">
                The latest products scanned by users.
              </CardDescription>
            </div>
            <Link href="/products">
              <Button variant="outline" size="sm" className="gap-2 font-semibold">
                View All <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow>
                  <TableHead className="pl-6 py-4 font-bold uppercase tracking-wider text-[10px] text-muted-foreground w-[220px]">Product</TableHead>
                  <TableHead className="py-4 font-bold uppercase tracking-wider text-[10px] text-muted-foreground">Status</TableHead>
                  <TableHead className="py-4 font-bold uppercase tracking-wider text-[10px] text-muted-foreground hidden sm:table-cell">Scanned At</TableHead>
                  <TableHead className="py-4 font-bold uppercase tracking-wider text-[10px] text-muted-foreground text-right pr-6">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow><TableCell colSpan={4} className="h-64 text-center"><Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" /></TableCell></TableRow>
                ) : recentProducts.length === 0 ? (
                  <TableRow><TableCell colSpan={4} className="h-32 text-center text-muted-foreground">No recent scans found.</TableCell></TableRow>
                ) : (
                  recentProducts.map((product) => (
                    <TableRow key={product.id} className="hover:bg-muted/30 transition-colors">
                      <TableCell className="pl-6 py-4">
                        <div className="h-24 w-24 overflow-hidden rounded-xl bg-muted border border-muted-foreground/10 shadow-sm">
                          {product.front_image || product.back_image || product.ingredients_image ? (
                            <img src={product.front_image || product.back_image || product.ingredients_image} className="h-full w-full object-cover" />
                          ) : (
                            <div className="h-full w-full flex items-center justify-center text-muted-foreground text-xs font-bold">No Image</div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="py-4">
                        <StatusBadge status={product.overall_status} />
                      </TableCell>
                      <TableCell className="py-4 hidden sm:table-cell text-sm text-muted-foreground">
                        {product.created_at ? format(new Date(product.created_at), "MMM d, HH:mm") : "N/A"}
                      </TableCell>
                      <TableCell className="py-4 text-right pr-6">
                        <Button variant="ghost" size="sm" onClick={() => handleViewProduct(product)} className="font-semibold">Review</Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
