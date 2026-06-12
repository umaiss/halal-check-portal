"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Loader2, CheckCircle2, Trash2, Upload, X, Image as ImageIcon } from "lucide-react";
import { toast } from "sonner";

import { releaseProduct } from "@/lib/mock-claims";
import { API_ENDPOINTS } from "@/lib/constants";
import { apiFetch } from "@/lib/api";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const reviewSchema = z.object({
  status: z.enum(["halal", "haram", "mushbooh"], { 
    message: "Please select a final status.",
  }),
  reasoning: z.string().min(5, "Please provide reasoning/evidence (at least 5 characters)."),
});

type ReviewValues = z.infer<typeof reviewSchema>;

export function AssigneeReviewForm({ 
  productId, 
  initialStatus, 
  initialReasoning,
  existingAttachments,
  initialIngredientsAnalysis,
}: { 
  productId: string | number;
  initialStatus?: string;
  initialReasoning?: string;
  existingAttachments?: string[];
  initialIngredientsAnalysis?: any[];
}) {
  const router = useRouter();
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [attachmentsList, setAttachmentsList] = useState<string[]>([]);
  const [ingredients, setIngredients] = useState<any[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Sync existing attachments from props
  useEffect(() => {
    if (existingAttachments) {
      setAttachmentsList(existingAttachments);
    }
  }, [existingAttachments]);

  // Sync ingredients analysis from props
  useEffect(() => {
    if (initialIngredientsAnalysis) {
      setIngredients(initialIngredientsAnalysis);
    }
  }, [initialIngredientsAnalysis]);

  const handleUpdateIngredientStatus = (idx: number, status: string) => {
    setIngredients((prev) => {
      const updated = [...prev];
      updated[idx] = { ...updated[idx], status };
      return updated;
    });
  };

  const handleUpdateIngredientNote = (idx: number, note: string) => {
    setIngredients((prev) => {
      const updated = [...prev];
      updated[idx] = { ...updated[idx], note };
      return updated;
    });
  };

  // Update previews when files change
  useEffect(() => {
    const urls = selectedFiles.map((file) => URL.createObjectURL(file));
    setPreviewUrls(urls);
    // Revoke object URLs on cleanup
    return () => {
      urls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [selectedFiles]);

  const form = useForm<ReviewValues>({
    resolver: zodResolver(reviewSchema),
    defaultValues: {
      status: (initialStatus as any) || undefined,
      reasoning: initialReasoning || "",
    },
  });

  // Keep form in sync if props change after initial mount (e.g. after API fetch)
  useEffect(() => {
    form.reset({
      status: (initialStatus as any) || undefined,
      reasoning: initialReasoning || "",
    });
  }, [initialStatus, initialReasoning, form]);

  const handleRemoveExistingAttachment = (urlToRemove: string) => {
    setAttachmentsList(prev => prev.filter(url => url !== urlToRemove));
  };

  const handleRemoveNewAttachment = (idxToRemove: number) => {
    setSelectedFiles(prev => prev.filter((_, idx) => idx !== idxToRemove));
  };

  async function onSubmit(data: ReviewValues) {
    setIsSubmitting(true);
    try {
      let newlyUploadedUrls: string[] = [];
      if (selectedFiles.length > 0) {
        const uploadUrl = `${API_ENDPOINTS.SCANNED_PRODUCTS}/${productId}/upload`;
        const formData = new FormData();
        selectedFiles.forEach((file) => formData.append('files', file));
        const uploadRes = await apiFetch(uploadUrl, {
          method: 'POST',
          body: formData,
        });
        if (!uploadRes.ok) {
          const err = await uploadRes.json().catch(() => ({}));
          throw new Error(err?.message || `Upload error: ${uploadRes.status}`);
        }
        const result = await uploadRes.json();
        newlyUploadedUrls = result.attachments || [];
      }

      // Final list of attachments includes remaining existing ones + new ones
      const finalAttachments = [...attachmentsList, ...newlyUploadedUrls];

      const reviewUrl = `${API_ENDPOINTS.SCANNED_PRODUCTS}/${productId}/review`;
      const response = await apiFetch(reviewUrl, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: data.status,
          reasoning: data.reasoning,
          attachments: finalAttachments,
          ingredients_analysis: ingredients,
        }),
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err?.message || `Server error: ${response.status}`);
      }

      releaseProduct(productId);

      toast.success('Review Submitted Successfully!', {
        description: `Product #${productId} has been classified as ${data.status.toUpperCase()}.`,
      });

      router.push('/products');
    } catch (e: any) {
      toast.error(e?.message || 'Failed to submit review');
      setIsSubmitting(false);
    }
  }

  return (
    <Card className="border-none shadow-xl bg-blue-50/50 dark:bg-blue-950/20 mb-8 border-t-4 border-t-blue-500">
      <CardHeader className="pb-4">
        <CardTitle className="text-xl font-bold text-blue-800 dark:text-blue-300 flex items-center gap-2">
          <CheckCircle2 className="h-5 w-5" />
          Assignee Review Task
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-bold">Final Verdict</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger className="bg-white dark:bg-card font-bold h-11">
                        <SelectValue placeholder="Select outcome..." />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="halal" className="text-green-600 font-bold">Halal</SelectItem>
                      <SelectItem value="haram" className="text-red-600 font-bold">Haram</SelectItem>
                      <SelectItem value="mushbooh" className="text-yellow-600 font-bold">Needs More Info (Return to Mushbooh)</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
               control={form.control}
               name="reasoning"
               render={({ field }) => (
                 <FormItem>
                   <FormLabel className="font-bold">Reasoning / Evidence Source</FormLabel>
                   <FormControl>
                     <Textarea 
                       placeholder="Detail the source of proof..." 
                       className="min-h-[100px] bg-white dark:bg-card"
                       {...field}
                     />
                   </FormControl>
                   <FormMessage />
                 </FormItem>
               )}
            />
            
            {/* Detailed Ingredient Review Section */}
            <div className="space-y-4">
              <h3 className="text-sm font-black uppercase text-blue-800 dark:text-blue-300 tracking-widest">
                Ingredient-Level Review
              </h3>
              <p className="text-xs text-muted-foreground">
                Verify and update the status of each individual ingredient. You must specify reasoning if an ingredient is marked as Mushbooh.
              </p>
              
              <div className="space-y-3 bg-white dark:bg-card border p-4 rounded-xl">
                {ingredients.length > 0 ? (
                  ingredients.map((item, idx) => {
                    const status = item.status?.toLowerCase();
                    const isMushbooh = status === "mushbooh" || status === "musbooh";
                    
                    return (
                      <div 
                        key={idx} 
                        className="p-4 rounded-xl border border-muted-foreground/10 bg-muted/20 space-y-3 transition-all"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <div className="space-y-1">
                            <span className="font-extrabold text-sm text-foreground">{item.component_name}</span>
                            <span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground bg-muted px-2 py-0.5 rounded ml-2">
                              {item.component_type || "Component"}
                            </span>
                          </div>
                          
                          <div className="flex gap-2">
                            <Button
                              type="button"
                              variant={status === "halal" ? "default" : "outline"}
                              className={`h-8 font-bold text-xs px-3 rounded-lg ${
                                status === "halal" 
                                  ? "bg-green-600 hover:bg-green-700 text-white border-green-600" 
                                  : "text-green-600 hover:text-green-700 hover:bg-green-50 border-green-200"
                              }`}
                              onClick={() => handleUpdateIngredientStatus(idx, "halal")}
                            >
                              Halal
                            </Button>
                            <Button
                              type="button"
                              variant={isMushbooh ? "default" : "outline"}
                              className={`h-8 font-bold text-xs px-3 rounded-lg ${
                                isMushbooh 
                                  ? "bg-yellow-500 hover:bg-yellow-600 text-white border-yellow-500" 
                                  : "text-yellow-600 hover:text-yellow-700 hover:bg-yellow-50 border-yellow-200"
                              }`}
                              onClick={() => handleUpdateIngredientStatus(idx, "mushbooh")}
                            >
                              Mushbooh
                            </Button>
                            <Button
                              type="button"
                              variant={status === "haram" ? "default" : "outline"}
                              className={`h-8 font-bold text-xs px-3 rounded-lg ${
                                status === "haram" 
                                  ? "bg-red-600 hover:bg-red-700 text-white border-red-600" 
                                  : "text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                              }`}
                              onClick={() => handleUpdateIngredientStatus(idx, "haram")}
                            >
                              Haram
                            </Button>
                          </div>
                        </div>
                        
                        {isMushbooh && (
                          <div className="space-y-1.5 animate-in slide-in-from-top-2 duration-300">
                            <label className="text-xs font-bold text-yellow-800 dark:text-yellow-400">
                              Reasoning for Mushbooh Status
                            </label>
                            <Textarea
                              placeholder="Describe why this ingredient needs more information or is questionable..."
                              value={item.note || ""}
                              onChange={(e) => handleUpdateIngredientNote(idx, e.target.value)}
                              className="min-h-[60px] bg-white dark:bg-card border-yellow-200 focus-visible:ring-yellow-500 text-xs"
                            />
                          </div>
                        )}
                      </div>
                    );
                  })
                ) : (
                  <p className="text-xs text-muted-foreground italic text-center py-4">
                    No ingredients list loaded for this product.
                  </p>
                )}
              </div>
            </div>
            
            {/* Custom Premium File Upload UI */}
            <div className="space-y-4">
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-200">
                Attachments & Proof
              </label>
              
              {/* Show existing attachments */}
              {attachmentsList.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">
                    Currently Attached Evidence
                  </p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    {attachmentsList.map((url, idx) => (
                      <div 
                        key={`existing-${idx}`} 
                        className="group relative aspect-square rounded-xl overflow-hidden border border-blue-100 bg-white dark:bg-card shadow-sm transition-all hover:shadow-md"
                      >
                        <img 
                          src={url} 
                          alt={`Attachment ${idx + 1}`} 
                          className="w-full h-full object-cover transition-transform group-hover:scale-105" 
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                          <a 
                            href={url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="px-2 py-1 bg-white text-gray-900 rounded-md hover:bg-gray-100 transition-colors text-xs font-bold"
                          >
                            View
                          </a>
                          <button
                            type="button"
                            onClick={() => handleRemoveExistingAttachment(url)}
                            className="p-1.5 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                            title="Delete attachment"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Show new uploads to be added */}
              {previewUrls.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">
                    New Uploads (Pending Save)
                  </p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    {previewUrls.map((url, idx) => (
                      <div 
                        key={`new-${idx}`} 
                        className="group relative aspect-square rounded-xl overflow-hidden border-2 border-dashed border-blue-200 bg-blue-50/10 shadow-sm"
                      >
                        <img 
                          src={url} 
                          alt={`preview-${idx}`} 
                          className="w-full h-full object-cover" 
                        />
                        <div className="absolute top-2 right-2">
                          <button
                            type="button"
                            onClick={() => handleRemoveNewAttachment(idx)}
                            className="p-1 bg-red-600 hover:bg-red-700 text-white rounded-full transition-all shadow-md"
                            title="Cancel upload"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                        <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white px-2 py-1 text-[10px] truncate">
                          {selectedFiles[idx]?.name}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Upload Dropzone Clickable Card */}
              <div
                onClick={() => document.getElementById("file-upload-input")?.click()}
                className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-xl p-6 text-center hover:border-blue-500 hover:bg-blue-50/5 dark:hover:bg-blue-950/5 transition-all cursor-pointer group flex flex-col items-center justify-center gap-2"
              >
                <input
                  id="file-upload-input"
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={(e) => {
                    const files = Array.from(e.target.files || []);
                    setSelectedFiles(prev => [...prev, ...files]);
                  }}
                  className="hidden"
                />
                <div className="p-3 bg-white dark:bg-card border border-border group-hover:border-blue-200 group-hover:bg-blue-50/50 rounded-full transition-all shadow-sm">
                  <Upload className="h-6 w-6 text-muted-foreground group-hover:text-blue-600 transition-colors" />
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-700 dark:text-gray-200">
                    Upload new evidence images
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Click to browse your files (supports PNG, JPG, JPEG)
                  </p>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <Button 
                type="button" 
                variant="outline"
                onClick={() => {
                  releaseProduct(productId);
                  router.push("/products");
                }}
              >
                Cancel Claim
              </Button>
              <Button type="submit" className="font-bold px-8 shadow-md" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Submitting...
                  </>
                ) : "Complete Review"}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
