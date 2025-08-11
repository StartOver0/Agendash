"use client"

import { useState } from "react"
import { format } from "date-fns"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Calendar, Clock, Tag, AlertCircle, CheckCircle, XCircle, PauseCircle } from "lucide-react"

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

interface JobDetailsProps {
  job: Job
}

export function JobDetails({ job }: JobDetailsProps) {
  const [activeTab, setActiveTab] = useState("overview")

  const formatDate = (date: string | null) => {
    if (!date) return "Not set"
    return format(new Date(date), "PPpp")
  }

  const getStatusIcon = () => {
    if (job.disabled) return <PauseCircle className="h-5 w-5 text-muted-foreground" />
    if (job.failedAt) return <XCircle className="h-5 w-5 text-destructive" />
    if (job.nextRunAt) return <Clock className="h-5 w-5 text-blue-500" />
    return <CheckCircle className="h-5 w-5 text-green-500" />
  }

  const getStatusText = () => {
    if (job.disabled) return "Disabled"
    if (job.failedAt) return "Failed"
    if (job.nextRunAt) return "Scheduled"
    return "Completed"
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {getStatusIcon()}
          <h2 className="text-xl font-bold">{job.name}</h2>
        </div>
        <Badge
          variant={job.disabled ? "outline" : job.failedAt ? "destructive" : job.nextRunAt ? "secondary" : "default"}
        >
          {getStatusText()}
        </Badge>
      </div>

      <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="data">Data</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>
        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Job ID</h3>
                <p className="font-mono text-sm">{job.id}</p>
              </div>

              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Priority</h3>
                <p>{job.priority}</p>
              </div>

              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Schedule Type</h3>
                <p>{job.repeating?.interval ? "Repeating" : "One-time"}</p>
              </div>

              {job.repeating?.interval && (
                <>
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Repeat Interval</h3>
                    <p>{job.repeating.interval}</p>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Timezone</h3>
                    <p>{job.repeating.timezone || "UTC"}</p>
                  </div>
                </>
              )}
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <h3 className="text-sm font-medium text-muted-foreground">Next Run</h3>
              </div>
              <p>{formatDate(job.nextRunAt)}</p>

              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <h3 className="text-sm font-medium text-muted-foreground">Last Run</h3>
              </div>
              <p>{formatDate(job.lastRunAt)}</p>

              {job.failedAt && (
                <>
                  <div className="flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 text-destructive" />
                    <h3 className="text-sm font-medium text-muted-foreground">Failed At</h3>
                  </div>
                  <p>{formatDate(job.failedAt)}</p>
                </>
              )}

              <div className="flex items-center gap-2">
                <Tag className="h-4 w-4 text-muted-foreground" />
                <h3 className="text-sm font-medium text-muted-foreground">Tags</h3>
              </div>
              <div className="flex flex-wrap gap-1">
                {job.tags?.map((tag) => (
                  <Badge key={tag} variant="outline">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="data">
          <ScrollArea className="h-[300px] rounded-md border p-4">
            <pre className="font-mono text-sm">{JSON.stringify(job.data, null, 2)}</pre>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="history">
          <div className="rounded-md border p-4">
            <div className="text-center text-sm text-muted-foreground">
              Job execution history will be displayed here.
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
