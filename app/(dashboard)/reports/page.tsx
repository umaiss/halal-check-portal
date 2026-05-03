"use client";

import React, { useState, useEffect } from "react";
import { 
  FileBarChart2, 
  Download, 
  Calendar, 
  User, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  Loader2,
  ChevronRight
} from "lucide-react";
import { format } from "date-fns";
import { RoleGuard } from "@/components/shared/role-guard";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/shared/status-badge";
import { API_ENDPOINTS, AUTH_TOKEN_KEY } from "@/lib/constants";
import { useRouter } from "next/navigation";
import { ProductStatus } from "@/types/product";

interface ReviewLog {
  id: number;
  ingredient_text: string;
  overall_status: ProductStatus;
  status: ProductStatus;
  reasoning: string;
  front_image: string;
  created_at: string;
  reviewer_email: string;
}

interface AllReviewsData {
  total_reviewed: number;
  halal_count: number;
  haram_count: number;
  mushbooh_count: number;
  all_reviews: ReviewLog[];
}

export default function ReportsPage() {
  const router = useRouter();
  const [data, setData] = useState<AllReviewsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchAllReviews() {
      try {
        const token = localStorage.getItem(AUTH_TOKEN_KEY);
        const headers: Record<string, string> = {};
        if (token) headers.Authorization = `Bearer ${token}`;

        const res = await fetch(API_ENDPOINTS.ALL_REVIEWS, { headers });
        if (res.ok) {
          setData(await res.json());
        }
      } catch (e) {
        console.error("Failed to fetch all reviews:", e);
      } finally {
        setIsLoading(false);
      }
    }
    fetchAllReviews();
  }, []);

  const handleViewProduct = (product: ReviewLog) => {
    sessionStorage.setItem("selectedProduct", JSON.stringify(product));
    router.push(`/products/${product.id}`);
  };

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center pb-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const stats = [
    { label: "Total Reviews", value: data?.total_reviewed || 0, icon: CheckCircle, color: "text-blue-600", bg: "bg-blue-50" },
    { label: "Halal", value: data?.halal_count || 0, icon: CheckCircle, color: "text-green-600", bg: "bg-green-50" },
    { label: "Haram", value: data?.haram_count || 0, icon: XCircle, color: "text-red-600", bg: "bg-red-50" },
    { label: "Mushbooh", value: data?.mushbooh_count || 0, icon: AlertTriangle, color: "text-yellow-600", bg: "bg-yellow-50" },
  ];

  return (
    <RoleGuard allowedRoles={["admin"]}>
      <div className="space-y-10 animate-in fade-in duration-500">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-extrabold tracking-tight">Review Reports</h1>
            <p className="text-muted-foreground mt-2 text-lg">
              Detailed log of all assignee review activities.
            </p>
          </div>
          <Button variant="outline" className="gap-2 font-bold shadow-sm">
            <Download className="h-4 w-4" /> Export CSV
          </Button>
        </div>

        {/* Aggregate Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((s) => {
            const Icon = s.icon;
            return (
              <Card key={s.label} className="border-none shadow-lg">
                <CardContent className={`p-6 ${s.bg} rounded-2xl`}>
                  <div className="flex items-center gap-3 mb-2">
                    <Icon className={`h-5 w-5 ${s.color}`} />
                    <span className="text-xs font-black uppercase tracking-widest text-muted-foreground">{s.label}</span>
                  </div>
                  <p className={`text-4xl font-black ${s.color}`}>{s.value}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Review Log Table */}
        <Card className="shadow-2xl border-none overflow-hidden rounded-3xl">
          <CardHeader className="bg-muted/30 border-b p-8">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-primary/10 rounded-lg">
                <FileBarChart2 className="h-5 w-5 text-primary" />
              </div>
              <CardTitle className="text-2xl font-bold">Comprehensive Review Log</CardTitle>
            </div>
            <CardDescription className="text-base font-medium">
              A complete history of all classifications made by assignees.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-muted/50 border-b">
                    <th className="text-left px-8 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Product</th>
                    <th className="text-left px-8 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Assignee</th>
                    <th className="text-left px-8 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Verdict</th>
                    <th className="text-left px-8 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Date</th>
                    <th className="text-right px-8 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {!data || data.all_reviews.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-20 text-center text-muted-foreground font-bold">
                        No reviews have been completed yet.
                      </td>
                    </tr>
                  ) : (
                    data.all_reviews.map((review) => (
                      <tr key={review.id} className="hover:bg-muted/30 transition-colors group">
                        <td className="px-8 py-5">
                          <div className="flex items-center gap-4">
                            <div className="h-12 w-12 rounded-xl overflow-hidden bg-muted border border-muted-foreground/10 shrink-0">
                              {review.front_image ? (
                                <img src={review.front_image} alt="" className="h-full w-full object-cover" />
                              ) : (
                                <div className="h-full w-full flex items-center justify-center text-[10px] font-bold">N/A</div>
                              )}
                            </div>
                            <div className="flex flex-col">
                              <span className="font-bold text-foreground">#{review.id}</span>
                              <span className="text-[11px] text-muted-foreground truncate max-w-[180px] font-medium">
                                {review.ingredient_text}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="px-8 py-5">
                          <div className="flex items-center gap-2">
                            <div className="h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center">
                              <User className="h-3.5 w-3.5 text-primary" />
                            </div>
                            <span className="font-semibold text-xs text-muted-foreground">
                              {review.reviewer_email}
                            </span>
                          </div>
                        </td>
                        <td className="px-8 py-5">
                          <StatusBadge status={review.status} className="px-3 py-1 text-[10px] font-black uppercase tracking-tighter" />
                        </td>
                        <td className="px-8 py-5">
                          <div className="flex items-center gap-2 text-xs text-muted-foreground font-medium">
                            <Calendar className="h-3.5 w-3.5" />
                            {format(new Date(review.created_at), "MMM d, yyyy")}
                          </div>
                        </td>
                        <td className="px-8 py-5 text-right">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => handleViewProduct(review)}
                            className="font-bold text-xs gap-1 group-hover:text-primary transition-colors"
                          >
                            Details <ChevronRight className="h-3.5 w-3.5" />
                          </Button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </RoleGuard>
  );
}
