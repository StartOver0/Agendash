"use client"

import type React from "react"

import { useEffect, useState } from "react"
import axios from "axios"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { CalendarClock, CheckCircle, Clock, XCircle, AlertCircle, BarChart } from "lucide-react"

type Stats = {
  total: number
  scheduled: number
  completed: number
  failed: number
  queued: number
  successRate: string
}

export function DashboardStats() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchStats() {
      try {
        const response = await axios.get("http://localhost:3000/api/stats")
        setStats(response.data)
      } catch (error) {
        console.error("Failed to fetch stats:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

  if (loading) {
    return <StatsCardsSkeleton />
  }

  if (!stats) {
    return (
      <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-destructive">
        Failed to load statistics. Please try again.
      </div>
    )
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      <StatsCard
        title="Total Jobs"
        value={stats.total.toString()}
        icon={<BarChart className="h-4 w-4 text-muted-foreground" />}
      />
      <StatsCard
        title="Scheduled"
        value={stats.scheduled.toString()}
        icon={<CalendarClock className="h-4 w-4 text-blue-500" />}
      />
      <StatsCard
        title="Completed"
        value={stats.completed.toString()}
        icon={<CheckCircle className="h-4 w-4 text-green-500" />}
      />
      <StatsCard title="Failed" value={stats.failed.toString()} icon={<XCircle className="h-4 w-4 text-red-500" />} />
      <StatsCard title="Queued" value={stats.queued.toString()} icon={<Clock className="h-4 w-4 text-yellow-500" />} />
      <StatsCard
        title="Success Rate"
        value={`${stats.successRate}%`}
        icon={<AlertCircle className="h-4 w-4 text-purple-500" />}
      />
    </div>
  )
}

interface StatsCardProps {
  title: string
  value: string
  icon: React.ReactNode
}

function StatsCard({ title, value, icon }: StatsCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
      </CardContent>
    </Card>
  )
}

function StatsCardsSkeleton() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {Array(6)
        .fill(0)
        .map((_, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <Skeleton className="h-4 w-[100px]" />
              <Skeleton className="h-4 w-4" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-[60px]" />
            </CardContent>
          </Card>
        ))}
    </div>
  )
}
