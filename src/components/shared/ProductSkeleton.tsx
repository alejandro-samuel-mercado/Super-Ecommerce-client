import { Skeleton } from "@/components/ui/skeleton";

export function ProductSkeleton() {
  return (
    <div className="space-y-3">
      <Skeleton className="h-[250px] w-full rounded-xl" />
      <div className="space-y-2">
        <Skeleton className="h-4 w-[250px]" />
        <Skeleton className="h-4 w-[200px]" />
      </div>
      <div className="flex justify-between items-center pt-2">
        <Skeleton className="h-4 w-[60px]" />
        <Skeleton className="h-8 w-[100px]" />
      </div>
    </div>
  );
}
