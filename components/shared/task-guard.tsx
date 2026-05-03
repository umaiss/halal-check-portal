"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { isProductClaimedByOthers } from "@/lib/mock-claims";

interface TaskGuardProps {
  productId: string | number;
  children: React.ReactNode;
}

/**
 * Prevents access to a product detail view if the product 
 * is actively claimed by a DIFFERENT assignee.
 */
export function TaskGuard({ productId, children }: TaskGuardProps) {
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    // In a real app, this would be an API check: `GET /api/products/:id/status`
    // We are simulating it natively with our mock-claims helper.
    const isClaimedBySomeoneElse = isProductClaimedByOthers(productId);

    if (isClaimedBySomeoneElse) {
      toast.error("Task Already Claimed", {
        description: "Another assignee is currently reviewing this product.",
      });
      router.replace("/products");
    } else {
      setIsChecking(false);
    }
  }, [productId, router]);

  if (isChecking) {
    return (
      <div className="flex h-[60vh] w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return <>{children}</>;
}
