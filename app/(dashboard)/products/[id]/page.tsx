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
  Info,
  User,
} from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";

import { useRole } from "@/hooks/use-role";
import { TaskGuard } from "@/components/shared/task-guard";
import { AssigneeReviewForm } from "@/components/shared/assignee-review-form";
import { isProductClaimedByMe, claimProduct } from "@/lib/mock-claims";
import { toast } from "sonner";

import { API_ENDPOINTS } from "@/lib/constants";
import { apiFetch } from "@/lib/api";
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
  const role = useRole();
  const isAssignee = role === "assignee";
  const params = useParams<{ id: string }>();
  const [product, setProduct] = useState<ScannedProduct | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [isClaimed, setIsClaimed] = useState(false);
  const [isClaiming, setIsClaiming] = useState(false);

  const handleClaim = async () => {
    if (!product) return;
    setIsClaiming(true);
    try {
      claimProduct(product.id);
      
      const res = await apiFetch(`${API_ENDPOINTS.SCANNED_PRODUCTS}/${product.id}/claim`, {
        method: "POST",
      });
      if (!res.ok) throw new Error("Failed to secure claim on the backend.");

      toast.success("Task Claimed Successfully", {
        description: `Product #${product.id} has been added to My Tasks.`,
      });
      setIsClaimed(true);
    } catch (e: any) {
      toast.error(e.message || "Failed to claim product");
    } finally {
      setIsClaiming(false);
    }
  };

  useEffect(() => {
    async function fetchProduct() {
      if (!params?.id) return;
      
      try {
        const res = await apiFetch(`${API_ENDPOINTS.SCANNED_PRODUCTS}/${params.id}`);
        if (res.ok) {
          const data = await res.json();
          setProduct(data);
          // Sync sessionStorage in case they refresh later
          sessionStorage.setItem('selectedProduct', JSON.stringify(data));
          setIsClaimed(
            data.assigned_to_id === "current_user" ||
            isProductClaimedByMe(data.id)
          );
        } else {
          // If fetch fails, try falling back to sessionStorage
          const storedData = sessionStorage.getItem('selectedProduct');
          if (storedData) {
            const parsed = JSON.parse(storedData) as ScannedProduct;
            if (parsed.id.toString() === params.id) {
              setProduct(parsed);
              setIsClaimed(
                parsed.assigned_to_id === "current_user" ||
                isProductClaimedByMe(parsed.id)
              );
            }
          }
        }
      } catch (e) {
        console.error("Failed to fetch product:", e);
      } finally {
        setIsLoading(false);
      }
    }

    fetchProduct();
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

  const content = (
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
        {!isAssignee && (
          <Link href={`/products/${product.id}/edit`}>
            <Button className="gap-2 font-bold shadow-lg h-10 px-6">
               <Edit className="h-4 w-4" />
               Edit Product
            </Button>
          </Link>
        )}
      </div>

      <div className="space-y-8 max-w-4xl mx-auto w-full">
        {isAssignee && (
          isClaimed ? (
            <AssigneeReviewForm 
              productId={product.id} 
              initialStatus={product.status} 
              initialReasoning={product.reasoning}
              existingAttachments={product.review_attachments}
              initialIngredientsAnalysis={product.ingredients_analysis}
            />
          ) : (
            <Card className="border-none shadow-2xl overflow-hidden bg-gradient-to-r from-amber-500/10 via-yellow-500/5 to-transparent dark:from-amber-950/20 dark:via-yellow-950/10 mb-8 border-l-4 border-l-amber-500 animate-in slide-in-from-top duration-500">
              <CardContent className="p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 rounded-xl h-fit shadow-sm">
                    <Info className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-lg text-amber-900 dark:text-amber-300">Preview Mode</h3>
                    <p className="text-sm text-amber-800/80 dark:text-amber-400/80 font-medium mt-1 leading-relaxed max-w-xl">
                      You are previewing this product's scanned details and analysis. To submit a verdict, verify ingredients, or add review attachments, you must claim this task first.
                    </p>
                  </div>
                </div>
                <Button 
                  onClick={handleClaim} 
                  disabled={isClaiming}
                  className="font-bold text-white bg-amber-600 hover:bg-amber-700 dark:bg-amber-600 dark:hover:bg-amber-700 shadow-lg shadow-amber-600/20 h-11 px-8 rounded-xl shrink-0 gap-2 w-full sm:w-auto"
                >
                  {isClaiming ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" /> Claiming...
                    </>
                  ) : "Claim & Start Review"}
                </Button>
              </CardContent>
            </Card>
          )
        )}
        <header className="space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            <StatusBadge status={product.overall_status} className="px-3 py-1 text-sm uppercase tracking-widest font-black" />
            <span className="text-muted-foreground text-sm flex items-center gap-1.5 font-medium">
              <Calendar className="h-3.5 w-3.5" />
              {product.created_at ? format(new Date(product.created_at), "MMMM d, yyyy") : "N/A"}
            </span>
            {!isAssignee && product.reviewer_email && product.status && product.status !== 'pending' && (
              <span className="flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full bg-muted border text-muted-foreground">
                <User className="h-3.5 w-3.5" />
                Reviewed by <span className="text-foreground ml-1">{product.reviewer_email}</span>
              </span>
            )}
          </div>
          <h1 className="text-5xl font-black tracking-tighter text-foreground uppercase">
            {product.product_name || `Scanned Product #${product.id}`}
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

            <div className="space-y-4">
              <h3 className="text-sm font-black uppercase text-muted-foreground tracking-widest">Ingredient Analysis & Source</h3>
              
              <div className="grid gap-6 md:grid-cols-2">
                {/* Column 1: Ingredient Image */}
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Ingredients Scan Image</h4>
                  <div 
                    className="relative aspect-[4/3] rounded-xl overflow-hidden bg-muted border border-muted-foreground/10 shadow-sm cursor-pointer group flex items-center justify-center"
                    onClick={() => product.ingredients_image && setPreviewImage(product.ingredients_image)}
                  >
                    {product.ingredients_image ? (
                      <>
                        <img 
                          src={product.ingredients_image} 
                          alt="Ingredients Scan" 
                          className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-105" 
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                          <span className="text-white text-xs font-bold bg-black/60 px-3 py-1.5 rounded-full">Click to Zoom</span>
                        </div>
                      </>
                    ) : (
                      <div className="flex flex-col items-center gap-2 p-6 text-muted-foreground text-center">
                        <ImageIcon className="h-8 w-8 opacity-40" />
                        <span className="text-xs font-semibold">No Ingredient Image Available</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Column 2: Color Coded Ingredients */}
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Analyzed Ingredients</h4>
                  <div className="p-5 bg-muted/30 dark:bg-muted/10 rounded-xl border border-muted-foreground/10 min-h-[150px] flex flex-wrap gap-2 content-start">
                    {product.ingredients_analysis && product.ingredients_analysis.length > 0 ? (
                      product.ingredients_analysis.map((item, idx) => {
                        const status = item.status?.toLowerCase();
                        let badgeColor = "bg-gray-100 text-gray-800 border-gray-200";
                        if (status === "halal") {
                          badgeColor = "bg-green-100 text-green-800 border-green-200 dark:bg-green-950/40 dark:text-green-300 dark:border-green-800/50";
                        } else if (status === "mushbooh" || status === "musbooh") {
                          badgeColor = "bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-950/40 dark:text-yellow-300 dark:border-yellow-800/50";
                        } else if (status === "haram") {
                          badgeColor = "bg-red-100 text-red-800 border-red-200 dark:bg-red-950/40 dark:text-red-300 dark:border-red-800/50";
                        }
                        
                        return (
                          <div 
                            key={idx} 
                            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-bold ${badgeColor} transition-all hover:scale-105`}
                            title={`${item.component_name} (${item.component_type}) - ${item.note || 'No description'}`}
                          >
                            <span className={`h-2.5 w-2.5 rounded-full ${
                              status === "halal" ? "bg-green-500" :
                              status === "mushbooh" || status === "musbooh" ? "bg-yellow-500" :
                              "bg-red-500"
                            }`} />
                            {item.component_name}
                          </div>
                        );
                      })
                    ) : (
                      <div className="text-xs text-muted-foreground italic flex items-center justify-center w-full h-full min-h-[100px]">
                        No ingredient analysis tags available.
                      </div>
                    )}
                  </div>
                </div>
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
              {product.barcode_image && <TabsTrigger value="barcode" className="data-[state=active]:bg-white data-[state=active]:shadow-sm font-bold px-4">Barcode</TabsTrigger>}
              {product.manufacturer_image && <TabsTrigger value="manufacturer" className="data-[state=active]:bg-white data-[state=active]:shadow-sm font-bold px-4">Manufacturer</TabsTrigger>}
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

          {product.barcode_image && (
            <TabsContent value="barcode" className="mt-0">
              <div 
                className="relative aspect-[4/3] rounded-2xl overflow-hidden shadow-2xl border-4 border-white group bg-muted flex items-center justify-center cursor-pointer"
                onClick={() => product.barcode_image && setPreviewImage(product.barcode_image)}
              >
                <img src={product.barcode_image} alt="Barcode View" className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-6">
                  <span className="text-white font-black uppercase tracking-widest">Barcode View</span>
                </div>
              </div>
            </TabsContent>
          )}

          {product.manufacturer_image && (
            <TabsContent value="manufacturer" className="mt-0">
              <div 
                className="relative aspect-[4/3] rounded-2xl overflow-hidden shadow-2xl border-4 border-white group bg-muted flex items-center justify-center cursor-pointer"
                onClick={() => product.manufacturer_image && setPreviewImage(product.manufacturer_image)}
              >
                <img src={product.manufacturer_image} alt="Manufacturer View" className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-6">
                  <span className="text-white font-black uppercase tracking-widest">Manufacturer View</span>
                </div>
              </div>
            </TabsContent>
          )}
        </Tabs>

        {product.additional_images && product.additional_images.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-sm font-black uppercase text-muted-foreground tracking-widest">Additional Images</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {product.additional_images.map((img, i) => (
                <div 
                  key={i} 
                  className="relative aspect-square rounded-xl overflow-hidden border-2 border-white shadow-lg cursor-pointer group"
                  onClick={() => setPreviewImage(img)}
                >
                  <img src={img} alt={`Additional ${i+1}`} className="object-cover w-full h-full transition-transform group-hover:scale-110" />
                </div>
              ))}
            </div>
          </div>
        )}

        {product.review_attachments && product.review_attachments.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-sm font-black uppercase text-muted-foreground tracking-widest">Review Attachments</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {product.review_attachments.map((img, i) => (
                <div 
                  key={i} 
                  className="relative aspect-square rounded-xl overflow-hidden border-2 border-blue-200 shadow-lg cursor-pointer group"
                  onClick={() => setPreviewImage(img)}
                >
                  <img src={img} alt={`Review Attachment ${i+1}`} className="object-cover w-full h-full transition-transform group-hover:scale-110" />
                  <div className="absolute bottom-0 left-0 right-0 bg-blue-600/80 text-white text-[10px] font-bold uppercase tracking-wider px-2 py-1 text-center">
                    Review Evidence
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

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

  if (isAssignee) {
    return (
      <TaskGuard productId={product.id}>
        {content}
      </TaskGuard>
    );
  }

  return content;
}

const cn = (...classes: any[]) => classes.filter(Boolean).join(" ");
