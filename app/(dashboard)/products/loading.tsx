import React from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";

export default function ProductsLoading() {
  return (
    <div className="space-y-8 animate-pulse">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-10 w-[250px]" />
          <Skeleton className="h-5 w-[350px]" />
        </div>
        <Skeleton className="h-11 w-[180px] rounded-xl" />
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between gap-4">
          <Skeleton className="h-10 w-[300px] rounded-xl" />
        </div>

        <div className="rounded-xl border border-muted bg-white shadow-xl overflow-hidden">
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow>
                <TableHead className="px-6 py-4"><Skeleton className="h-4 w-24" /></TableHead>
                <TableHead className="py-4"><Skeleton className="h-4 w-16" /></TableHead>
                <TableHead className="py-4"><Skeleton className="h-4 w-32" /></TableHead>
                <TableHead className="py-4"><Skeleton className="h-4 w-24" /></TableHead>
                <TableHead className="py-4 text-right pr-6"><Skeleton className="h-4 w-16 ml-auto" /></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {[...Array(6)].map((_, i) => (
                <TableRow key={i} className="border-b last:border-0">
                  <TableCell className="px-6 py-4"><Skeleton className="h-5 w-40" /><Skeleton className="h-3 w-60 mt-2" /></TableCell>
                  <TableCell className="py-4"><Skeleton className="h-6 w-16 rounded-full" /></TableCell>
                  <TableCell className="py-4"><Skeleton className="h-4 w-48" /></TableCell>
                  <TableCell className="py-4"><Skeleton className="h-4 w-24" /></TableCell>
                  <TableCell className="py-4 text-right pr-6"><Skeleton className="h-8 w-24 ml-auto" /></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
