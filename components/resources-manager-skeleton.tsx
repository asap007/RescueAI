import { Skeleton } from "@/components/ui/skeleton"

export function ResourcesManagerSkeleton() {
  return (
    <div className="grid gap-6">
      <Skeleton className="h-[200px] w-full" />
      <div className="grid gap-4">
        <Skeleton className="h-10 w-[200px]" />
        <div className="grid gap-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      </div>
    </div>
  )
}
