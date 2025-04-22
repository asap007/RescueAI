import { Skeleton } from "@/components/ui/skeleton"

export function RequestsTableSkeleton() {
  return (
    <div className="grid gap-6">
      <div className="flex items-center justify-between">
        <Skeleton className="h-10 w-[250px]" />
        <Skeleton className="h-10 w-[200px]" />
      </div>
      <div className="rounded-md border">
        <Skeleton className="h-[450px] w-full" />
      </div>
      <div className="flex items-center justify-end gap-2">
        <Skeleton className="h-10 w-[100px]" />
        <Skeleton className="h-10 w-[70px]" />
      </div>
    </div>
  )
}
