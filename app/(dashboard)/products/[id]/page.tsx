"use client";

import React, { useState, useEffect } from "react";
import { notFound, useRouter, useParams } from "next/navigation";
import { 
  ArrowLeft, 
  Edit, 
  Clock, 
  Calendar,
  Layers,
  FileText,
  Image as ImageIcon,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Loader2,
  Info
} from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";

import { ScannedProduct } from "@/types/product";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";

export default function ProductDetailPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const [product, setProduct] = useState<ScannedProduct | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  useEffect(() => {
    // Read from sessionStorage on the client side
    const storedData = sessionStorage.getItem('selectedProduct');
    if (storedData && params?.id) {
      try {
        const parsedProduct = JSON.parse(storedData) as ScannedProduct;
        // Verify it matches the ID just to be safe
        if (parsedProduct.id.toString() === params.id) {
          setProduct(parsedProduct);
        } else {
          // If mismatch, we don't have the right data, will render not-found
          console.warn("Product ID mismatch in sessionStorage:", parsedProduct.id, params.id);
        }
      } catch (e) {
        console.error("Failed to parse product from session storage", e);
      }
    }
    setIsLoading(false);
  }, [params?.id]);

  if (isLoading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="flex h-[60vh] flex-col items-center justify-center space-y-4">
        <AlertTriangle className="h-12 w-12 text-destructive" />
        <h2 className="text-2xl font-bold">Product Not Found</h2>
        <p className="text-muted-foreground">The scanned product you are looking for does not exist or the data was lost on refresh.</p>
        <Button 
          variant="outline" 
          onClick={() => router.push('/products')}
          className="mt-4 gap-2"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Products
        </Button>
      </div>
    );
  }

  // Define status styling logic
  const statusInfo: Record<string, any> = {
    halal: { icon: CheckCircle, color: "text-green-600", bg: "bg-green-50", border: "border-green-100 bg-green-50/50" },
    HALAL: { icon: CheckCircle, color: "text-green-600", bg: "bg-green-50", border: "border-green-100 bg-green-50/50" },
    haram: { icon: XCircle, color: "text-red-600", bg: "bg-red-50", border: "border-red-100 bg-red-50/50" },
    HARAM: { icon: XCircle, color: "text-red-600", bg: "bg-red-50", border: "border-red-100 bg-red-50/50" },
    mushbooh: { icon: AlertTriangle, color: "text-yellow-600", bg: "bg-yellow-50", border: "border-yellow-100 bg-yellow-50/50" },
    MUSBOOH: { icon: AlertTriangle, color: "text-yellow-600", bg: "bg-yellow-50", border: "border-yellow-100 bg-yellow-50/50" },
  };

  const currentStatusInfo = statusInfo[product.overall_status] || statusInfo.mushbooh;
  const StatusIcon = currentStatusInfo.icon;

  return (
    <div className="space-y-8 animate-in fade-in duration-700 max-w-5xl mx-auto pb-12">
      <div className="flex items-center justify-between">
        <Button 
          variant="ghost" 
          onClick={() => router.push('/products')}
          className="gap-2 -ml-2 text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Products
        </Button>
        <Link href={`/products/${product.id}/edit`}>
          <Button className="gap-2 font-bold shadow-lg h-10 px-6">
             <Edit className="h-4 w-4" />
             Edit Product
          </Button>
        </Link>
      </div>

      <div className="space-y-8 max-w-4xl mx-auto w-full">
        <header className="space-y-4">
          <div className="flex items-center gap-3">
            <StatusBadge status={product.overall_status} className="px-3 py-1 text-sm uppercase tracking-widest font-black" />
            <span className="text-muted-foreground text-sm flex items-center gap-1.5 font-medium">
              <Calendar className="h-3.5 w-3.5" />
              {product.created_at ? format(new Date(product.created_at), "MMMM d, yyyy") : "N/A"}
            </span>
          </div>
          <h1 className="text-5xl font-black tracking-tighter text-foreground uppercase">
            Scanned Product #{product.id}
          </h1>
        </header>

        <Card className="border-none shadow-2xl overflow-hidden bg-white">
          <CardHeader className="border-b bg-muted/30 pb-4">
            <CardTitle className="text-xl font-bold flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              Overall Analysis
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6 space-y-6">
            <div className="space-y-3">
              <h3 className="text-sm font-black uppercase text-muted-foreground tracking-widest">AI Analysis Result</h3>
              <div className={cn("p-5 rounded-xl border-2 flex gap-4", currentStatusInfo.border)}>
                <div className={cn("p-2 rounded-lg h-fit", currentStatusInfo.bg)}>
                  <StatusIcon className={cn("h-6 w-6", currentStatusInfo.color)} />
                </div>
                <div>
                  <h4 className="font-bold text-lg mb-1">
                    {product.overall_status ? product.overall_status.charAt(0).toUpperCase() + product.overall_status.slice(1).toLowerCase() : "Unknown"} Assessment
                  </h4>
                  <p className="text-sm leading-relaxed text-muted-foreground font-medium">
                    {product.reasoning || "No reasoning provided."}
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="text-sm font-black uppercase text-muted-foreground tracking-widest">Extracted Text</h3>
              <div className="p-4 bg-muted/40 rounded-xl text-sm leading-relaxed border font-medium">
                {product.ingredient_text || "No ingredient text available."}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* New Ingredients List Section */}
        <Card className="border-none shadow-2xl overflow-hidden bg-white">
          <CardHeader className="border-b bg-muted/30 pb-4">
            <CardTitle className="text-xl font-bold flex items-center gap-2">
              <Layers className="h-5 w-5 text-primary" />
              Detailed Ingredient Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0 px-0">
            {product.ingredients_analysis && product.ingredients_analysis.length > 0 ? (
              <div className="divide-y">
                {product.ingredients_analysis.map((item, idx) => (
                  <div key={idx} className="p-4 hover:bg-muted/30 transition-colors flex items-start gap-4">
                     <div className="pt-1">
                      <StatusBadge status={item.status} className="text-[10px] px-2 py-0.5" />
                     </div>
                     <div className="flex-1 space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-sm text-foreground">{item.component_name}</span>
                          <span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground bg-muted px-2 py-0.5 rounded">
                            {item.component_type}
                          </span>
                        </div>
                        {item.note && (
                          <p className="text-xs text-muted-foreground font-medium flex gap-1.5 items-start">
                            <Info className="h-3.5 w-3.5 shrink-0 mt-0.5 text-blue-500" />
                            {item.note}
                          </p>
                        )}
                     </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center text-muted-foreground">
                No detailed ingredient breakdown available.
              </div>
            )}
          </CardContent>
        </Card>

        <Tabs defaultValue="front" className="w-full">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-black uppercase text-muted-foreground tracking-widest">Product Images</h3>
            <TabsList className="bg-muted/50 p-1">
              <TabsTrigger value="front" className="data-[state=active]:bg-white data-[state=active]:shadow-sm font-bold px-4">Front</TabsTrigger>
              <TabsTrigger value="back" className="data-[state=active]:bg-white data-[state=active]:shadow-sm font-bold px-4">Back</TabsTrigger>
              <TabsTrigger value="ingredients" className="data-[state=active]:bg-white data-[state=active]:shadow-sm font-bold px-4">Ingredients</TabsTrigger>
            </TabsList>
          </div>
          
          <TabsContent value="front" className="mt-0">
             <div 
               className="relative aspect-[4/3] rounded-2xl overflow-hidden shadow-2xl border-4 border-white group bg-muted flex items-center justify-center cursor-pointer"
               onClick={() => product.front_image && setPreviewImage(product.front_image)}
             >
                {product.front_image ? (
                  <>
                    <img src={product.front_image} alt="Front View" className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-105" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-6">
                      <span className="text-white font-black uppercase tracking-widest">Front View</span>
                    </div>
                  </>
                ) : <ImageIcon className="h-12 w-12 text-muted-foreground/30" />}
             </div>
          </TabsContent>
          
          <TabsContent value="back" className="mt-0">
              <div 
                className="relative aspect-[4/3] rounded-2xl overflow-hidden shadow-2xl border-4 border-white group bg-muted flex items-center justify-center cursor-pointer"
                onClick={() => product.back_image && setPreviewImage(product.back_image)}
              >
                {product.back_image ? (
                  <>
                    <img src={product.back_image} alt="Back View" className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-105" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-6">
                      <span className="text-white font-black uppercase tracking-widest">Back View</span>
                    </div>
                  </>
                ) : <ImageIcon className="h-12 w-12 text-muted-foreground/30" />}
             </div>
          </TabsContent>
          
          <TabsContent value="ingredients" className="mt-0">
              <div 
                className="relative aspect-[4/3] rounded-2xl overflow-hidden shadow-2xl border-4 border-white group bg-muted flex items-center justify-center cursor-pointer"
                onClick={() => product.ingredients_image && setPreviewImage(product.ingredients_image)}
              >
                {product.ingredients_image ? (
                  <>
                    <img src={product.ingredients_image} alt="Ingredients View" className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-105" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-6">
                      <span className="text-white font-black uppercase tracking-widest">Ingredients View</span>
                    </div>
                  </>
                ) : <ImageIcon className="h-12 w-12 text-muted-foreground/30" />}
             </div>
          </TabsContent>
        </Tabs>

        <Dialog open={!!previewImage} onOpenChange={(open) => !open && setPreviewImage(null)}>
          <DialogContent className="max-w-4xl p-0 overflow-hidden bg-transparent border-none shadow-none flex items-center justify-center">
            {previewImage && (
              <img src={previewImage} alt="Preview" className="max-w-full max-h-[85vh] object-contain rounded-md" />
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}

const cn = (...classes: any[]) => classes.filter(Boolean).join(" ");
