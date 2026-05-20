"use client";

import React, { useState, useEffect } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import {
  Eye, Edit, Trash2, ArrowUpDown, Plus, Loader2,
  CheckCircle, XCircle, AlertTriangle, User,
} from "lucide-react";

import { ScannedProduct, AssigneeStats } from "@/types/product";
import { DataTable } from "@/components/tables/data-table";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { API_ENDPOINTS } from "@/lib/constants";
import { apiFetch } from "@/lib/api";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useRole } from "@/hooks/use-role";
import { getClaimedProducts, claimProduct } from "@/lib/mock-claims";
import { toast } from "sonner";

// ─── Assignee Stats Section ───────────────────────────────────────────────────
function AssigneeStatsSection({ onViewProduct }: { onViewProduct: (p: any) => void }) {
  const [stats, setStats] = useState<AssigneeStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await apiFetch(API_ENDPOINTS.MY_STATS);
        if (!res.ok) throw new Error("Failed to fetch stats");
        setStats(await res.json());
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    }
    fetchStats();
  }, []);

  if (isLoading) {
    return (
      <div className="flex h-40 items-center justify-center">
        <Loader2 className="h-7 w-7 animate-spin text-primary" />
      </div>
    );
  }

  if (!stats) return null;

  const statCards = [
    {
      label: "Total Reviewed",
      value: stats.total_reviewed,
      icon: CheckCircle,
      color: "text-blue-600",
      bg: "bg-blue-50 dark:bg-blue-950/30",
      border: "border-blue-200 dark:border-blue-800",
    },
    {
      label: "Halal",
      value: stats.halal_count,
      icon: CheckCircle,
      color: "text-green-600",
      bg: "bg-green-50 dark:bg-green-950/30",
      border: "border-green-200 dark:border-green-800",
    },
    {
      label: "Haram",
      value: stats.haram_count,
      icon: XCircle,
      color: "text-red-600",
      bg: "bg-red-50 dark:bg-red-950/30",
      border: "border-red-200 dark:border-red-800",
    },
    {
      label: "Mushbooh",
      value: stats.mushbooh_count,
      icon: AlertTriangle,
      color: "text-yellow-600",
      bg: "bg-yellow-50 dark:bg-yellow-950/30",
      border: "border-yellow-200 dark:border-yellow-800",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {statCards.map((s) => {
          const Icon = s.icon;
          return (
            <Card key={s.label} className={`border-2 ${s.border} shadow-sm`}>
              <CardContent className={`p-5 ${s.bg} rounded-xl`}>
                <div className="flex items-center gap-3 mb-2">
                  <Icon className={`h-5 w-5 ${s.color}`} />
                  <span className="text-xs font-black uppercase tracking-widest text-muted-foreground">
                    {s.label}
                  </span>
                </div>
                <p className={`text-4xl font-black ${s.color}`}>{s.value}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {stats.reviewed_products.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-muted-foreground space-y-3">
          <CheckCircle className="h-12 w-12 opacity-20" />
          <p className="font-bold text-lg">No completed reviews yet</p>
          <p className="text-sm">Claim a product and complete a review to see it here.</p>
        </div>
      ) : (
        <div className="rounded-2xl border shadow-md overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-muted/50 border-b">
                <th className="text-left px-5 py-3 text-xs font-black uppercase tracking-widest text-muted-foreground">Product</th>
                <th className="text-left px-5 py-3 text-xs font-black uppercase tracking-widest text-muted-foreground">Verdict</th>
                <th className="text-left px-5 py-3 text-xs font-black uppercase tracking-widest text-muted-foreground hidden md:table-cell">Reasoning</th>
                <th className="text-left px-5 py-3 text-xs font-black uppercase tracking-widest text-muted-foreground">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {stats.reviewed_products.map((p) => (
                <tr 
                  key={p.id} 
                  className="hover:bg-muted/30 transition-colors cursor-pointer"
                  onClick={() => onViewProduct(p)}
                >
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 rounded-lg overflow-hidden bg-muted shrink-0 border">
                        {p.front_image
                          ? <img src={p.front_image} alt="" className="h-full w-full object-cover" />
                          : <div className="h-full w-full flex items-center justify-center text-[9px] font-bold text-muted-foreground">N/A</div>
                        }
                      </div>
                      <span className="font-bold text-sm text-foreground truncate max-w-[200px]">
                        {p.product_name || `Product #${p.id}`}
                      </span>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <StatusBadge status={p.status} className="text-[11px] px-2.5 py-1 font-black uppercase" />
                  </td>
                  <td className="px-5 py-4 hidden md:table-cell">
                    <p className="text-xs text-muted-foreground truncate max-w-[260px] font-medium">
                      {p.reasoning || "—"}
                    </p>
                  </td>
                  <td className="px-5 py-4">
                    <span className="text-xs text-muted-foreground tabular-nums font-medium">
                      {p.created_at ? format(new Date(p.created_at), "MMM d, yyyy") : "N/A"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default function ProductsPage() {
  const router = useRouter();
  const role = useRole();
  const isAssignee = role === "assignee";

  const [statusFilter, setStatusFilter] = useState("all");
  const [assigneeTab, setAssigneeTab] = useState("available"); // available | my_tasks | completed
  const [products, setProducts] = useState<ScannedProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [claimCounter, setClaimCounter] = useState(0);

  useEffect(() => {
    if (isAssignee) setStatusFilter("mushbooh");
  }, [isAssignee]);

  const handleViewProduct = (product: ScannedProduct | { id: number }) => {
    if ('ingredients_analysis' in product) {
      sessionStorage.setItem("selectedProduct", JSON.stringify(product));
    } else {
      sessionStorage.removeItem("selectedProduct");
    }
    router.push(`/products/${product.id}`);
  };

  const handleClaimProduct = async (product: ScannedProduct) => {
    try {
      claimProduct(product.id);
      setClaimCounter((c) => c + 1);

      const res = await apiFetch(`${API_ENDPOINTS.SCANNED_PRODUCTS}/${product.id}/claim`, {
        method: "POST",
      });
      if (!res.ok) throw new Error("Failed to secure claim on the backend.");

      toast.success("Task Claimed Successfully", {
        description: `Product #${product.id} has been added to My Tasks.`,
      });
    } catch (e: any) {
      toast.error(e.message || "Failed to claim product");
    }
  };

  useEffect(() => {
    async function fetchProducts() {
      try {
        const res = await apiFetch(API_ENDPOINTS.SCANNED_PRODUCTS);
        if (!res.ok) throw new Error("Failed to fetch");
        setProducts(await res.json());
      } catch (error) {
        console.error("Failed to fetch products:", error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchProducts();
  }, []);

  const claimedMap = getClaimedProducts();

  const filteredProducts = isAssignee
    ? products.filter((p) => {
        const isMushbooh =
          p.overall_status?.toLowerCase() === "mushbooh" ||
          p.overall_status?.toLowerCase() === "musbooh";
        if (!isMushbooh) return false;

        const isClaimedByMe =
          p.assigned_to_id === "current_user" ||
          claimedMap[p.id.toString()] === "current_user";
        const isClaimedBySomeoneElse =
          (p.assigned_to_id && p.assigned_to_id !== "current_user") ||
          (claimedMap[p.id.toString()] &&
            claimedMap[p.id.toString()] !== "current_user");

        if (assigneeTab === "available") return !isClaimedByMe && !isClaimedBySomeoneElse;
        if (assigneeTab === "my_tasks") return isClaimedByMe;
        return false;
      })
    : statusFilter === "all"
    ? products
    : products.filter((p) => {
        if (!p.overall_status) return false;
        const norm =
          p.overall_status.toLowerCase() === "musbooh"
            ? "mushbooh"
            : p.overall_status.toLowerCase();
        return norm === statusFilter.toLowerCase();
      });

  const adminColumns: ColumnDef<ScannedProduct>[] = [
    {
      accessorKey: "front_image",
      header: "Product",
      cell: ({ row }) => {
        const product = row.original;
        return (
          <div className="py-2">
            <div className="h-24 w-24 overflow-hidden rounded-xl bg-muted border shadow-sm">
              {product.front_image ? (
                <img src={product.front_image} alt="" className="h-full w-full object-cover" />
              ) : (
                <div className="h-full w-full flex items-center justify-center text-muted-foreground text-xs font-bold">No Image</div>
              )}
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "product_name",
      header: "Product Name",
      cell: ({ row }) => {
        const name = row.original.product_name;
        return (
          <div className="font-bold text-sm">
            {name || <span className="text-muted-foreground/50 italic">Unnamed Product</span>}
          </div>
        );
      },
    },
    {
      accessorKey: "overall_status",
      header: "Status",
      cell: ({ row }) => <StatusBadge status={row.getValue("overall_status")} />,
    },
    {
      accessorKey: "ingredient_text",
      header: "Ingredients",
      cell: ({ row }) => (
        <div className="max-w-[300px] truncate text-xs text-muted-foreground font-medium">
          {row.getValue("ingredient_text")}
        </div>
      ),
    },
    {
      accessorKey: "reviewer_email",
      header: "Reviewed By",
      cell: ({ row }) => {
        const email = row.original.reviewer_email;
        const verdict = row.original.status;
        if (!email || verdict === "pending" || !verdict) {
          return <span className="text-xs text-muted-foreground/50 italic">—</span>;
        }
        const verdictColor =
          verdict === "halal"
            ? "bg-green-100 text-green-700"
            : verdict === "haram"
            ? "bg-red-100 text-red-700"
            : "bg-yellow-100 text-yellow-700";
        return (
          <div className="space-y-1">
            <div className="flex items-center gap-1.5">
              <User className="h-3 w-3 text-muted-foreground shrink-0" />
              <span className="text-xs font-semibold text-foreground truncate max-w-[140px]">{email}</span>
            </div>
            <span className={`inline-block text-[10px] font-black uppercase tracking-wider rounded px-1.5 py-0.5 ${verdictColor}`}>
              {verdict}
            </span>
          </div>
        );
      },
    },
    {
      accessorKey: "created_at",
      header: "Created At",
      cell: ({ row }) => {
        const date = row.getValue("created_at");
        return (
          <div className="text-sm text-muted-foreground tabular-nums">
            {date ? format(new Date(date as string), "MMM d, yyyy") : "N/A"}
          </div>
        );
      },
    },
    {
      id: "actions",
      header: () => <div className="text-right">Actions</div>,
      cell: ({ row }) => {
        const product = row.original;
        return (
          <div className="flex items-center justify-end gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleViewProduct(product)}
              className="h-8 w-8 hover:bg-blue-50 hover:text-blue-600"
            >
              <Eye className="h-4 w-4" />
            </Button>
            <Link href={`/products/${product.id}/edit`}>
              <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-amber-50 hover:text-amber-600">
                <Edit className="h-4 w-4" />
              </Button>
            </Link>
            <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-red-50 hover:text-red-600">
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        );
      },
    },
  ];

  const assigneeColumns: ColumnDef<ScannedProduct>[] = [
    {
      accessorKey: "front_image",
      header: "Product",
      cell: ({ row }) => {
        const product = row.original;
        return (
          <div className="py-2">
            <div className="h-20 w-20 overflow-hidden rounded-xl bg-muted border shadow-sm">
              {product.front_image ? (
                <img src={product.front_image} alt="" className="h-full w-full object-cover" />
              ) : (
                <div className="h-full w-full flex items-center justify-center text-muted-foreground text-xs font-bold">N/A</div>
              )}
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "product_name",
      header: "Product Name",
      cell: ({ row }) => {
        const name = row.original.product_name;
        return (
          <div className="font-bold text-sm">
            {name || <span className="text-muted-foreground/50 italic">Unnamed Product</span>}
          </div>
        );
      },
    },
    {
      accessorKey: "overall_status",
      header: "Status",
      cell: ({ row }) => <StatusBadge status={row.getValue("overall_status")} />,
    },
    {
      accessorKey: "ingredient_text",
      header: "Ingredients",
      cell: ({ row }) => (
        <div className="max-w-[380px] truncate text-xs text-muted-foreground font-medium">
          {row.getValue("ingredient_text")}
        </div>
      ),
    },
    {
      accessorKey: "created_at",
      header: "Created At",
      cell: ({ row }) => {
        const date = row.getValue("created_at");
        return (
          <div className="text-sm text-muted-foreground tabular-nums">
            {date ? format(new Date(date as string), "MMM d, yyyy") : "N/A"}
          </div>
        );
      },
    },
    {
      id: "actions",
      header: () => <div className="text-right">Actions</div>,
      cell: ({ row }) => {
        const product = row.original;
        return (
          <div className="flex items-center justify-end gap-2">
            <div className="flex justify-end w-[180px]">
              {assigneeTab === "available" ? (
                <Button
                  className="font-bold gap-2 text-xs h-8"
                  onClick={() => handleClaimProduct(product)}
                >
                  Claim &amp; Start Review
                </Button>
              ) : (
                <Button
                  variant="default"
                  className="font-bold gap-2 text-xs bg-blue-600 hover:bg-blue-700 h-8"
                  onClick={() => handleViewProduct(product)}
                >
                  Continue Review
                </Button>
              )}
            </div>
          </div>
        );
      },
    },
  ];

  if (role === null) return <div className="flex h-screen items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight">Products</h1>
          <p className="text-muted-foreground mt-2 text-lg">
            {isAssignee ? "Review and resolve mushbooh item scans." : "Manage and review all scanned products."}
          </p>
        </div>
        {!isAssignee && (
          <Button className="font-bold shadow-lg hover:shadow-xl transition-all gap-2 h-11 px-6 rounded-xl">
            <Plus className="h-5 w-5" /> Add Product
          </Button>
        )}
      </div>

      {isAssignee ? (
        <Tabs value={assigneeTab} className="w-full" onValueChange={setAssigneeTab}>
          <TabsList className="bg-muted/50 p-1 mb-2">
            <TabsTrigger value="available" className="rounded-md px-6 font-bold">Available</TabsTrigger>
            <TabsTrigger value="my_tasks" className="rounded-md px-6 font-bold">My Tasks</TabsTrigger>
            <TabsTrigger value="completed" className="rounded-md px-6 font-bold">Completed</TabsTrigger>
          </TabsList>
        </Tabs>
      ) : (
        <Tabs value={statusFilter} className="w-full" onValueChange={setStatusFilter}>
          <TabsList className="bg-muted/50 p-1 mb-2">
            <TabsTrigger value="all" className="rounded-md px-6 font-bold">All</TabsTrigger>
            <TabsTrigger value="halal" className="rounded-md px-6 font-bold">Halal</TabsTrigger>
            <TabsTrigger value="haram" className="rounded-md px-6 font-bold">Haram</TabsTrigger>
            <TabsTrigger value="mushbooh" className="rounded-md px-6 font-bold">Mushbooh</TabsTrigger>
          </TabsList>
        </Tabs>
      )}

      {isLoading ? (
        <div className="flex h-64 items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>
      ) : isAssignee && assigneeTab === "completed" ? (
        <AssigneeStatsSection onViewProduct={handleViewProduct} />
      ) : (
        <DataTable
          columns={isAssignee ? assigneeColumns : adminColumns}
          data={filteredProducts}
          searchKey="ingredient_text"
        />
      )}
    </div>
  );
}
