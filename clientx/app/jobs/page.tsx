import { Suspense } from "react"
import { JobsHeader } from "@/components/dashboard/jobs-header"
import { JobsFiltersWrapper } from "@/components/dashboard/jobs-filters"
import { DashboardSkeleton } from "@/components/dashboard/dashboard-skeleton"

export default function JobsPage() {
  return (
    <>
      <JobsHeader heading="Jobs Management" description="View and manage all scheduled jobs" />
      <Suspense fallback={<DashboardSkeleton />}>
        <JobsFiltersWrapper />
      </Suspense>
    </>
  )
}
