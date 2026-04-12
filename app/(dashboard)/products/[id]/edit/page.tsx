"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { 
  ArrowLeft, 
  Save, 
  RotateCcw,
  ShieldCheck,
  AlertCircle,
  Sparkles,
  Info
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

import { DUMMY_PRODUCTS } from "@/lib/dummy-data";
import { PRODUCT_STATUS } from "@/lib/constants";
import { 
  productUpdateSchema, 
  ProductUpdateValues 
} from "@/lib/validators/product";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

interface ProductEditPageProps {
  params: {
    id: string;
  };
}

export default function ProductEditPage({ params }: ProductEditPageProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const product = DUMMY_PRODUCTS.find((p) => p.id === params.id);

  const form = useForm<ProductUpdateValues>({
    resolver: zodResolver(productUpdateSchema),
    defaultValues: {
      status: (product?.status?.toLowerCase() as any) || "halal",
      ingredients: product?.ingredients || "",
      analysis: product?.analysis || "",
      overrideAI: false,
    },
  });

  if (!product) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
        <h1 className="text-2xl font-bold">Product not found</h1>
        <Link href="/products">
          <Button>Back to Products</Button>
        </Link>
      </div>
    );
  }

  async function onSubmit(values: ProductUpdateValues) {
    setIsSubmitting(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));
    
    console.log("Updated values:", values);
    toast.success("Product updated successfully!", {
      description: `Changes to ${product?.name} have been saved.`,
    });
    
    setIsSubmitting(false);
    router.push(`/products/${product?.id}`);
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 max-w-4xl mx-auto pb-12">
      <div className="flex items-center justify-between">
        <Link href={`/products/${product.id}`}>
          <Button variant="ghost" className="gap-2 -ml-2 text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4" />
            Back to Detail
          </Button>
        </Link>
        <div className="flex gap-3">
          <Button 
            variant="outline" 
            type="button"
            onClick={() => form.reset()}
            disabled={isSubmitting}
            className="gap-2 font-bold"
          >
            <RotateCcw className="h-4 w-4" />
            Reset
          </Button>
          <Button 
            type="button"
            onClick={form.handleSubmit(onSubmit)}
            disabled={isSubmitting}
            className="gap-2 font-black uppercase tracking-widest shadow-lg shadow-primary/20 h-10 px-8"
          >
            <Save className="h-4 w-4" />
            {isSubmitting ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Card className="border-none shadow-2xl bg-white overflow-hidden">
            <CardHeader className="bg-muted/30 border-b pb-6">
              <div className="flex items-center gap-2 text-primary mb-1">
                <Sparkles className="h-5 w-5" />
                <span className="text-xs font-black uppercase tracking-[0.2em]">Editor Mode</span>
              </div>
              <CardTitle className="text-3xl font-black uppercase tracking-tight">Edit Product</CardTitle>
              <CardDescription className="text-base font-medium">Update the classification and ingredients for <span className="text-foreground font-bold">{product.name}</span></CardDescription>
            </CardHeader>
            <CardContent className="pt-8">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                  <div className="grid gap-8 md:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="status"
                      render={({ field }: { field: any }) => (
                        <FormItem>
                          <FormLabel className="font-bold uppercase tracking-widest text-[10px] text-muted-foreground">Classification Status</FormLabel>
                          <Select 
                            onValueChange={field.onChange} 
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger className="h-11 border-2 focus:ring-primary/20 border-muted rounded-xl transition-all font-bold">
                                <SelectValue placeholder="Select status" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent className="rounded-xl border-2">
                              <SelectItem value="halal" className="font-bold text-green-600 focus:bg-green-50 focus:text-green-700">Halal</SelectItem>
                              <SelectItem value="haram" className="font-bold text-red-600 focus:bg-red-50 focus:text-red-700">Haram</SelectItem>
                              <SelectItem value="mushbooh" className="font-bold text-yellow-600 focus:bg-yellow-50 focus:text-yellow-700">Mushbooh</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="overrideAI"
                      render={({ field }: { field: any }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-xl border-2 border-dashed border-primary/20 bg-primary/5 p-4 space-y-0 h-11 self-end">
                          <div className="space-y-0.5">
                            <FormLabel className="text-xs font-black uppercase tracking-tight flex items-center gap-1.5">
                              <ShieldCheck className="h-3 w-3" />
                              Manual Override
                            </FormLabel>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="ingredients"
                    render={({ field }: { field: any }) => (
                      <FormItem>
                        <FormLabel className="font-bold uppercase tracking-widest text-[10px] text-muted-foreground">Ingredients Text (Source of Truth)</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Enter product ingredients..." 
                            className="min-h-[120px] rounded-xl border-2 border-muted focus:border-primary transition-all font-medium leading-relaxed" 
                            {...field} 
                          />
                        </FormControl>
                        <FormDescription className="text-[10px] font-bold uppercase tracking-tight">This text is used by the AI engine to re-evaluate the product.</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="analysis"
                    render={({ field }: { field: any }) => (
                      <FormItem>
                        <FormLabel className="font-bold uppercase tracking-widest text-[10px] text-muted-foreground">AI Assessment / Rationale</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Detailed rationale for the status..." 
                            className="min-h-[150px] rounded-xl border-2 border-muted focus:border-primary transition-all font-medium leading-relaxed bg-muted/20" 
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-8">
          <Card className="border-none shadow-xl bg-blue-600 text-white overflow-hidden">
             <CardHeader className="pb-4">
              <CardTitle className="text-lg font-bold flex items-center gap-2">
                <Info className="h-5 w-5" />
                Guidelines
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm font-medium opacity-90 leading-relaxed">
              <p>When overriding AI results, ensure you have verified the source of debatable ingredients like Gelatin or E-numbers from qualified sources.</p>
              <Separator className="bg-white/20" />
              <div className="space-y-2">
                <p className="font-black uppercase tracking-widest text-[10px]">E-Number Check</p>
                <p className="opacity-80">Check E120, E441, E471 especially for animal origin.</p>
              </div>
            </CardContent>
          </Card>

           <Card className="border-none shadow-xl bg-white overflow-hidden">
             <CardHeader className="bg-red-50 text-red-900 pb-4">
              <CardTitle className="text-lg font-bold flex items-center gap-2">
                <AlertCircle className="h-5 w-5" />
                Danger Zone
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <p className="text-xs text-muted-foreground mb-4 font-medium">Deletions are permanent and cannot be undone. All scan history for this product will be lost.</p>
              <Button variant="destructive" className="w-full font-black uppercase tracking-widest text-xs h-10">
                Delete Product
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
