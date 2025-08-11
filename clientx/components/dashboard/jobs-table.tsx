"use client"

import { useState, useEffect } from "react"
import axios from "axios"
import { format, formatDistanceToNow } from "date-fns"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
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
import { MoreHorizontal, Play, Trash, Edit, Plus, Search, PauseCircle, PlayCircle, RefreshCw } from "lucide-react"
import { JobForm } from "@/components/dashboard/job-form"

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
}

export function JobsTable() {
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedJob, setSelectedJob] = useState<Job | null>(null)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)

  const fetchJobs = async () => {
    try {
      setLoading(true)
      const response = await axios.get("http://localhost:3000/api/jobs")
      setJobs(response.data.data || [])
    } catch (error) {
      console.error("Failed to fetch jobs:", error)
    } finally {
      setLoading(false)
      setIsRefreshing(false)
    }
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

  const filteredJobs = jobs.filter((job) => job.name.toLowerCase().includes(searchTerm.toLowerCase()))

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
    <div className="mt-6 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h2 className="text-xl font-bold">Jobs</h2>
          <Button variant="outline" size="icon" onClick={handleRefresh} disabled={isRefreshing}>
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
            <span className="sr-only">Refresh</span>
          </Button>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search jobs..."
              className="w-[200px] pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
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
                <TableHead className="w-[100px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredJobs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center">
                    No jobs found.
                  </TableCell>
                </TableRow>
              ) : (
                filteredJobs.map((job) => (
                  <TableRow key={job.id}>
                    <TableCell className="font-medium">{job.name}</TableCell>
                    <TableCell>{formatDate(job.nextRunAt)}</TableCell>
                    <TableCell>{formatDate(job.lastRunAt)}</TableCell>
                    <TableCell>{getStatusBadge(job)}</TableCell>
                    <TableCell>{job.priority}</TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Actions</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
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

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the job {`"${selectedJob?.name}"`}. This action cannot be undone.
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
                  <Skeleton className="h-8 w-8 rounded-full" />
                </TableCell>
              </TableRow>
            ))}
        </TableBody>
      </Table>
    </div>
  )
}
