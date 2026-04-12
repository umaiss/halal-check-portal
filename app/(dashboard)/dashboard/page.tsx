"use client";

import React, { useState, useEffect } from "react";
import { 
  Plus, 
  Search, 
  AlertCircle, 
  CheckCircle2, 
  Clock,
  ArrowRight,
  Loader2
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
import { ScannedProduct } from "@/types/product";
import { API_ENDPOINTS, AUTH_TOKEN_KEY } from "@/lib/constants";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { format } from "date-fns";
import { RoleGuard } from "@/components/shared/role-guard";

export default function DashboardPage() {
  const router = useRouter();
  const [recentProducts, setRecentProducts] = useState<ScannedProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const handleViewProduct = (product: ScannedProduct) => {
    sessionStorage.setItem('selectedProduct', JSON.stringify(product));
    router.push(`/products/${product.id}`);
  };

  useEffect(() => {
    async function fetchRecent() {
      try {
        const token = localStorage.getItem(AUTH_TOKEN_KEY);
        const response = await fetch(API_ENDPOINTS.SCANNED_PRODUCTS, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        if (response.ok) {
          const data = await response.json();
          setRecentProducts(data.slice(0, 5));
        }
      } catch (error) {
        console.error("Failed to fetch recent products:", error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchRecent();
  }, []);

  return (
    <RoleGuard allowedRoles={["admin"]}>
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
          value={DUMMY_STATS.total.toLocaleString()}
          icon={Search}
          trend={{ value: 12, isUp: true }}
          description="vs last month"
          className="bg-white border-l-4 border-l-blue-500"
          iconClassName="bg-blue-50"
        />
        <StatsCard
          title="Halal Products"
          value={DUMMY_STATS.halal.toLocaleString()}
          icon={CheckCircle2}
          trend={{ value: 8, isUp: true }}
          description="growing steadily"
          className="bg-white border-l-4 border-l-green-500"
          iconClassName="bg-green-50"
        />
        <StatsCard
          title="Haram Products"
          value={DUMMY_STATS.haram.toLocaleString()}
          icon={AlertCircle}
          trend={{ value: 2, isUp: false }}
          description="flagged recently"
          className="bg-white border-l-4 border-l-red-500"
          iconClassName="bg-red-50"
        />
        <StatsCard
          title="Mushbooh"
          value={DUMMY_STATS.mushbooh.toLocaleString()}
          icon={Clock}
          trend={{ value: 5, isUp: true }}
          description="pending review"
          className="bg-white border-l-4 border-l-yellow-500"
          iconClassName="bg-yellow-50"
        />
      </div>

      <div className="grid gap-8 lg:grid-cols-7">
        {/* Recent Scans Table */}
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
                  <TableRow>
                    <TableCell colSpan={4} className="h-64 text-center">
                      <div className="flex flex-col items-center justify-center gap-2 text-muted-foreground">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        <p className="text-sm font-medium">Loading recent scans...</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : recentProducts.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="h-32 text-center text-muted-foreground">
                      No recent scans found.
                    </TableCell>
                  </TableRow>
                ) : (
                  recentProducts.map((product) => (
                    <TableRow key={product.id} className="hover:bg-muted/30 transition-colors">
                      <TableCell className="pl-6 py-4">
                        <div className="h-24 w-24 overflow-hidden rounded-xl bg-muted border border-muted-foreground/10 shadow-sm">
                          {product.front_image ? (
                            <img
                              src={product.front_image}
                              alt={product.ingredient_text}
                              className="h-full w-full object-cover transition-transform hover:scale-105 duration-300"
                            />
                          ) : (
                            <div className="h-full w-full flex items-center justify-center text-muted-foreground text-xs font-bold">
                              No Image
                            </div>
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
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => handleViewProduct(product)}
                          className="hover:bg-primary/10 hover:text-primary transition-all font-semibold"
                        >
                          Review
                        </Button>
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
    </RoleGuard>
  );
}
