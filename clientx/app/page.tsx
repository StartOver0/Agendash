import { Suspense } from "react"
import { DashboardStats } from "@/components/dashboard/stats-card"
import { JobsTable } from "@/components/dashboard/jobs-table"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
// import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { DashboardSkeleton } from "@/components/dashboard/dashboard-skeleton"

export default function DashboardPage() {
  return (
    // <DashboardShell>
      <div><DashboardHeader heading="Jobs Dashboard" description="Monitor and manage your scheduled jobs" />
      <Suspense fallback={<DashboardSkeleton />}>
        <DashboardStats />
        <JobsTable />
      </Suspense>
      </div>
    // </DashboardShell>
  )
}
