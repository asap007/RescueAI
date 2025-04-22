import { Suspense } from "react"
import { DashboardHeader } from "@/components/dashboard-header"
import { DashboardShell } from "@/components/dashboard-shell"
import { AnalyticsDashboard } from "@/components/analytics-dashboard"
import { AnalyticsDashboardSkeleton } from "@/components/analytics-dashboard-skeleton"

export default function AnalyticsPage() {
  return (
    <DashboardShell>
      <DashboardHeader
        heading="Analytics & Insights"
        description="Detailed analytics and insights to help coordinate rescue efforts effectively."
      />
      <Suspense fallback={<AnalyticsDashboardSkeleton />}>
        <AnalyticsDashboard />
      </Suspense>
    </DashboardShell>
  )
}
