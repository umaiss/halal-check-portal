"use client";

import React, { useState, useEffect } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { Eye, Edit, Trash2, ArrowUpDown, Plus, Loader2 } from "lucide-react";

import { ScannedProduct } from "@/types/product";
import { DataTable } from "@/components/tables/data-table";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { API_ENDPOINTS, AUTH_TOKEN_KEY } from "@/lib/constants";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useRole } from "@/hooks/use-role";

export default function ProductsPage() {
  const router = useRouter();
  const role = useRole();
  const isAssignee = role === "assignee";
  const [statusFilter, setStatusFilter] = useState("all");
  const [products, setProducts] = useState<ScannedProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Force assignee to Mushbooh only
  useEffect(() => {
    if (isAssignee) {
      setStatusFilter("mushbooh");
    }
  }, [isAssignee]);

  const handleViewProduct = (product: ScannedProduct) => {
    sessionStorage.setItem('selectedProduct', JSON.stringify(product));
    router.push(`/products/${product.id}`);
  };

  useEffect(() => {
    async function fetchProducts() {
      try {
        const token = localStorage.getItem(AUTH_TOKEN_KEY);
        const response = await fetch(API_ENDPOINTS.SCANNED_PRODUCTS, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        if (!response.ok) throw new Error("Failed to fetch");
        const data = await response.json();
        setProducts(data);
      } catch (error) {
        console.error("Failed to fetch products:", error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchProducts();
  }, []);

  const filteredProducts = statusFilter === "all"
    ? products
    : products.filter(p => {
        if (!p.overall_status) return false;
        const normalizedStatus = p.overall_status.toLowerCase() === "musbooh" 
          ? "mushbooh" 
          : p.overall_status.toLowerCase();
        return normalizedStatus === statusFilter.toLowerCase();
      });

  const columns: ColumnDef<ScannedProduct>[] = [
    {
      accessorKey: "front_image",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="hover:bg-transparent -ml-4 font-bold uppercase tracking-wider text-[10px]"
          >
            Product
            <ArrowUpDown className="ml-2 h-3 w-3" />
          </Button>
        );
      },
      cell: ({ row }) => {
        const product = row.original;
        return (
          <div className="py-2">
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
        <div className="max-w-[400px] truncate text-xs text-muted-foreground font-medium">
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
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => handleViewProduct(product)}
              className="h-8 w-8 hover:bg-blue-50 hover:text-blue-600 transition-colors"
            >
              <Eye className="h-4 w-4" />
              <span className="sr-only">View</span>
            </Button>
            {!isAssignee && (
              <>
                <Link href={`/products/${product.id}/edit`}>
                  <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-amber-50 hover:text-amber-600 transition-colors">
                    <Edit className="h-4 w-4" />
                    <span className="sr-only">Edit</span>
                  </Button>
                </Link>
                <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-red-50 hover:text-red-600 transition-colors">
                  <Trash2 className="h-4 w-4" />
                  <span className="sr-only">Delete</span>
                </Button>
              </>
            )}
          </div>
        );
      },
    },
  ];

  if (role === null) {
    return (
      <div className="flex h-screen items-center justify-center pb-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight">
            Products
          </h1>
          <p className="text-muted-foreground mt-2 text-lg">
            {isAssignee 
              ? "Review and resolve mushbooh item scans." 
              : "Manage and review all scanned products."}
          </p>
        </div>
        {!isAssignee && (
          <Button className="font-bold shadow-lg hover:shadow-xl transition-all gap-2 h-11 px-6 rounded-xl">
            <Plus className="h-5 w-5" />
            Add Product
          </Button>
        )}
      </div>

      {isAssignee ? (
        <Tabs value="mushbooh" className="w-full">
          <TabsList className="bg-muted/50 p-1 mb-2">
            <TabsTrigger value="mushbooh" className="rounded-md px-6 font-bold">Mushbooh</TabsTrigger>
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
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <DataTable columns={columns} data={filteredProducts} searchKey="ingredient_text" />
      )}
    </div>
  );
}

