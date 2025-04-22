import { Suspense } from "react"
import { DashboardHeader } from "@/components/dashboard-header"
import { DashboardShell } from "@/components/dashboard-shell"
import { RequestsTable } from "@/components/requests-table"
import { RequestsTableSkeleton } from "@/components/requests-table-skeleton"

export default function RequestsPage() {
  return (
    <DashboardShell>
      <DashboardHeader
        heading="Assistance Requests"
        description="View and manage incoming assistance requests from disaster victims."
      />
      <Suspense fallback={<RequestsTableSkeleton />}>
        <RequestsTable />
      </Suspense>
    </DashboardShell>
  )
}
