import { Skeleton } from "@/components/ui/skeleton"

export function AnalyticsDashboardSkeleton() {
  return (
    <div className="grid gap-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2">
        <Skeleton className="h-[350px]" />
        <Skeleton className="h-[350px]" />
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2">
        <Skeleton className="h-[350px]" />
        <Skeleton className="h-[350px]" />
      </div>
      <Skeleton className="h-[250px]" />
    </div>
  )
}
