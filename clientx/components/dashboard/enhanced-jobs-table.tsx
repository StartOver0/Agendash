"use client"

import { useState, useEffect } from "react"
import axios from "axios"
import { format, formatDistanceToNow } from "date-fns"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Skeleton } from "@/components/ui/skeleton"
import { MoreHorizontal, Play, Trash, Edit, Plus, PauseCircle, PlayCircle, RefreshCw, Eye } from "lucide-react"
import { JobForm } from "@/components/dashboard/job-form"
import { JobDetails } from "@/components/dashboard/job-details"

type Job = {
  id: string
  name: string
  data: any
  nextRunAt: string | null
  lastRunAt: string | null
  failedAt: string | null
  priority: number
  disabled: boolean
  repeating?: {
    interval?: string
    timezone?: string
  }
  tags?: string[]
}

type FilterState = {
  search: string
  status: {
    scheduled: boolean
    completed: boolean
    failed: boolean
    disabled: boolean
  }
  priority: [number, number]
  dateRange: {
    from: Date | undefined
    to: Date | undefined
  }
  tags: string[]
  dataAttributes: {
    key: string
    value: string
    operator: "equals" | "contains" | "startsWith" | "endsWith"
  }[]
}

interface EnhancedJobsTableProps {
  filters: FilterState
}

export function EnhancedJobsTable({ filters }: EnhancedJobsTableProps) {
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedJob, setSelectedJob] = useState<Job | null>(null)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isDetailsOpen, setIsDetailsOpen] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalJobs, setTotalJobs] = useState(0)
  const pageSize = 10

  const fetchJobs = async () => {
    try {
      setLoading(true)
      // In a real implementation, you would send the filters to the API
      const response = await axios.get("http://localhost:3000/api/jobs")

      // Add mock tags for demonstration
      const jobsWithTags = response.data.data.map((job: Job) => ({
        ...job,
        tags: generateMockTags(job),
      }))

      setJobs(jobsWithTags || [])
      setTotalJobs(jobsWithTags.length || 0)
      setTotalPages(Math.ceil((jobsWithTags.length || 0) / pageSize))
    } catch (error) {
      console.error("Failed to fetch jobs:", error)
    } finally {
      setLoading(false)
      setIsRefreshing(false)
    }
  }

  // Generate mock tags based on job name and data
  const generateMockTags = (job: Job) => {
    const tags: string[] = []

    // Add tag based on job name
    if (job.name.includes("email")) tags.push("email")
    if (job.name.includes("notification")) tags.push("notification")
    if (job.name.includes("report")) tags.push("report")
    if (job.name.includes("backup")) tags.push("backup")
    if (job.name.includes("sync")) tags.push("sync")
    if (job.name.includes("clean")) tags.push("cleanup")
    if (job.name.includes("import")) tags.push("import")
    if (job.name.includes("export")) tags.push("export")

    // Add a random tag if none were added
    if (tags.length === 0) {
      const randomTags = ["email", "notification", "report", "backup", "sync", "cleanup", "import", "export"]
      tags.push(randomTags[Math.floor(Math.random() * randomTags.length)])
    }

    return tags
  }

  useEffect(() => {
    fetchJobs()
  }, [])

  const handleRefresh = () => {
    setIsRefreshing(true)
    fetchJobs()
  }

  const handleRunJob = async (jobId: string) => {
    try {
      await axios.post(`http://localhost:3000/api/jobs/${jobId}/run`)
      fetchJobs()
    } catch (error) {
      console.error("Failed to run job:", error)
    }
  }

  const handleToggleJobStatus = async (jobId: string, disabled: boolean) => {
    try {
      await axios.put(`http://localhost:3000/api/jobs/${jobId}`, { disabled: !disabled })
      fetchJobs()
    } catch (error) {
      console.error("Failed to toggle job status:", error)
    }
  }

  const handleDeleteJob = async () => {
    if (!selectedJob) return

    try {
      await axios.delete(`http://localhost:3000/api/jobs/${selectedJob.id}`)
      setIsDeleteDialogOpen(false)
      fetchJobs()
    } catch (error) {
      console.error("Failed to delete job:", error)
    }
  }

  const handleEditJob = (job: Job) => {
    setSelectedJob(job)
    setIsFormOpen(true)
  }

  const handleViewDetails = (job: Job) => {
    setSelectedJob(job)
    setIsDetailsOpen(true)
  }

  const handleCreateJob = () => {
    setSelectedJob(null)
    setIsFormOpen(true)
  }

  const handleFormSubmit = async (jobData: any) => {
    try {
      if (selectedJob) {
        await axios.put(`http://localhost:3000/api/jobs/${selectedJob.id}`, jobData)
      } else {
        await axios.post("http://localhost:3000/api/jobs", jobData)
      }
      setIsFormOpen(false)
      fetchJobs()
    } catch (error) {
      console.error("Failed to save job:", error)
    }
  }

  // Apply filters to jobs
  const filteredJobs = jobs.filter((job) => {
    // Search filter
    if (filters.search && !job.name.toLowerCase().includes(filters.search.toLowerCase())) {
      return false
    }

    // Status filter
    if (
      (job.disabled && !filters.status.disabled) ||
      (job.failedAt && !filters.status.failed) ||
      (job.nextRunAt && !filters.status.scheduled) ||
      (!job.nextRunAt && !job.failedAt && !filters.status.completed)
    ) {
      return false
    }

    // Priority filter
    if (job.priority < filters.priority[0] || job.priority > filters.priority[1]) {
      return false
    }

    // Date range filter
    if (filters.dateRange.from || filters.dateRange.to) {
      const nextRunDate = job.nextRunAt ? new Date(job.nextRunAt) : null
      if (filters.dateRange.from && nextRunDate && nextRunDate < filters.dateRange.from) {
        return false
      }
      if (filters.dateRange.to && nextRunDate && nextRunDate > filters.dateRange.to) {
        return false
      }
    }

    // Tags filter
    if (filters.tags.length > 0 && !job.tags?.some((tag) => filters.tags.includes(tag))) {
      return false
    }

    // Data attributes filter
    if (filters.dataAttributes.length > 0) {
      return filters.dataAttributes.every((attr) => {
        if (!attr.key || !attr.value) return true

        const jobData = job.data
        if (!jobData) return false

        // Navigate nested paths (e.g., "user.email")
        const keys = attr.key.split(".")
        let value = jobData

        for (const key of keys) {
          if (value === undefined || value === null) return false
          value = value[key]
        }

        if (value === undefined || value === null) return false

        const stringValue = String(value).toLowerCase()
        const searchValue = attr.value.toLowerCase()

        switch (attr.operator) {
          case "equals":
            return stringValue === searchValue
          case "contains":
            return stringValue.includes(searchValue)
          case "startsWith":
            return stringValue.startsWith(searchValue)
          case "endsWith":
            return stringValue.endsWith(searchValue)
          default:
            return false
        }
      })
    }

    return true
  })

  // Pagination
  const paginatedJobs = filteredJobs.slice((page - 1) * pageSize, page * pageSize)

  const getStatusBadge = (job: Job) => {
    if (job.disabled) {
      return <Badge variant="outline">Disabled</Badge>
    } else if (job.failedAt) {
      return <Badge variant="destructive">Failed</Badge>
    } else if (job.nextRunAt) {
      return <Badge variant="secondary">Scheduled</Badge>
    } else {
      return <Badge>Completed</Badge>
    }
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "-"
    const date = new Date(dateString)
    return (
      <div className="flex flex-col">
        <span className="text-xs text-muted-foreground">{format(date, "MMM d, yyyy")}</span>
        <span>{format(date, "h:mm a")}</span>
        <span className="text-xs text-muted-foreground">{formatDistanceToNow(date, { addSuffix: true })}</span>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h2 className="text-xl font-bold">Jobs</h2>
          <Button variant="outline" size="icon" onClick={handleRefresh} disabled={isRefreshing}>
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
            <span className="sr-only">Refresh</span>
          </Button>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={handleCreateJob}>
            <Plus className="mr-2 h-4 w-4" />
            New Job
          </Button>
        </div>
      </div>

      {loading ? (
        <JobsTableSkeleton />
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Next Run</TableHead>
                <TableHead>Last Run</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Tags</TableHead>
                <TableHead className="w-[100px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedJobs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-24 text-center">
                    No jobs found.
                  </TableCell>
                </TableRow>
              ) : (
                paginatedJobs.map((job) => (
                  <TableRow key={job.id}>
                    <TableCell className="font-medium">{job.name}</TableCell>
                    <TableCell>{formatDate(job.nextRunAt)}</TableCell>
                    <TableCell>{formatDate(job.lastRunAt)}</TableCell>
                    <TableCell>{getStatusBadge(job)}</TableCell>
                    <TableCell>{job.priority}</TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {job.tags?.map((tag) => (
                          <Badge key={tag} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Actions</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleViewDetails(job)}>
                            <Eye className="mr-2 h-4 w-4" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleRunJob(job.id)}>
                            <Play className="mr-2 h-4 w-4" />
                            Run Now
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleToggleJobStatus(job.id, job.disabled)}>
                            {job.disabled ? (
                              <>
                                <PlayCircle className="mr-2 h-4 w-4" />
                                Enable
                              </>
                            ) : (
                              <>
                                <PauseCircle className="mr-2 h-4 w-4" />
                                Disable
                              </>
                            )}
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleEditJob(job)}>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-destructive focus:text-destructive"
                            onClick={() => {
                              setSelectedJob(job)
                              setIsDeleteDialogOpen(true)
                            }}
                          >
                            <Trash className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      )}

      {filteredJobs.length > 0 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Showing {(page - 1) * pageSize + 1} to {Math.min(page * pageSize, filteredJobs.length)} of{" "}
            {filteredJobs.length} jobs
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" onClick={() => setPage(page - 1)} disabled={page === 1}>
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(page + 1)}
              disabled={page === Math.ceil(filteredJobs.length / pageSize)}
            >
              Next
            </Button>
          </div>
        </div>
      )}

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{selectedJob ? "Edit Job" : "Create New Job"}</DialogTitle>
            <DialogDescription>
              {selectedJob ? "Update the job details below." : "Fill in the details to create a new scheduled job."}
            </DialogDescription>
          </DialogHeader>
          <JobForm job={selectedJob} onSubmit={handleFormSubmit} onCancel={() => setIsFormOpen(false)} />
        </DialogContent>
      </Dialog>

      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="sm:max-w-[700px]">
          <DialogHeader>
            <DialogTitle>Job Details</DialogTitle>
            <DialogDescription>Detailed information about the job</DialogDescription>
          </DialogHeader>
          {selectedJob && <JobDetails job={selectedJob} />}
        </DialogContent>
      </Dialog>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the job "{selectedJob?.name}". This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteJob}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

function JobsTableSkeleton() {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Next Run</TableHead>
            <TableHead>Last Run</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Priority</TableHead>
            <TableHead>Tags</TableHead>
            <TableHead className="w-[100px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {Array(5)
            .fill(0)
            .map((_, i) => (
              <TableRow key={i}>
                <TableCell>
                  <Skeleton className="h-5 w-[150px]" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-10 w-[120px]" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-10 w-[120px]" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-5 w-[80px]" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-5 w-[40px]" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-5 w-[100px]" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-8 w-8 rounded-full" />
                </TableCell>
              </TableRow>
            ))}
        </TableBody>
      </Table>
    </div>
  )
}
