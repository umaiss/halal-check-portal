"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Loader2, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

import { releaseProduct } from "@/lib/mock-claims";
import { API_ENDPOINTS, AUTH_TOKEN_KEY } from "@/lib/constants";
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
  initialReasoning 
}: { 
  productId: string | number;
  initialStatus?: string;
  initialReasoning?: string;
}) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  async function onSubmit(data: ReviewValues) {
    setIsSubmitting(true);
    try {
      const token = localStorage.getItem(AUTH_TOKEN_KEY);
      const reviewUrl = `${API_ENDPOINTS.SCANNED_PRODUCTS}/${productId}/review`;

      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };
      if (token) headers.Authorization = `Bearer ${token}`;

      const response = await fetch(reviewUrl, {
        method: "PATCH",
        headers,
        body: JSON.stringify({
          status: data.status,
          reasoning: data.reasoning,
        }),
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err?.message || `Server error: ${response.status}`);
      }

      // Release the local optimistic lock now that the server confirmed the review
      releaseProduct(productId);

      toast.success("Review Submitted Successfully!", {
        description: `Product #${productId} has been classified as ${data.status.toUpperCase()}.`,
      });

      // Return to task list
      router.push("/products");

    } catch (e: any) {
      toast.error(e?.message || "Failed to submit review");
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
