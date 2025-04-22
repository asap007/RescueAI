import { Suspense } from "react"
import { DashboardHeader } from "@/components/dashboard-header"
import { DashboardShell } from "@/components/dashboard-shell"
import { ResourcesManager } from "@/components/resources-manager"
import { ResourcesManagerSkeleton } from "@/components/resources-manager-skeleton"

export default function ResourcesPage() {
  return (
    <DashboardShell>
      <DashboardHeader
        heading="Information Resources"
        description="Manage informational resources that power the phone agent's knowledge base."
      />
      <Suspense fallback={<ResourcesManagerSkeleton />}>
        <ResourcesManager />
      </Suspense>
    </DashboardShell>
  )
}
