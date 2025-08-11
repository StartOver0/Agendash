"use client"

import { useState, useEffect } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DialogFooter } from "@/components/ui/dialog"

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

const formSchema = z.object({
  name: z.string().min(1, "Job name is required"),
  data: z.string().optional(),
  priority: z.coerce.number().int().min(0).max(20),
  disabled: z.boolean(), // <-- required, no default
  schedule: z.enum(["once", "repeat"]),
  nextRunAt: z.string().optional(),
  repeatInterval: z.string().optional(),
  timezone: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>

interface JobFormProps {
  job: Job | null
  onSubmit: (data: any) => void
  onCancel: () => void
}

export function JobForm({ job, onSubmit, onCancel }: JobFormProps) {
  const [scheduleType, setScheduleType] = useState<"once" | "repeat">("once")

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      data: "{}",
      priority: 0,
      disabled: false,
      schedule: "once",
      nextRunAt: "",
      repeatInterval: "",
      timezone: "UTC",
    },
  })

  useEffect(() => {
    if (job) {
      const hasRepeating = job.repeating && job.repeating.interval
      const scheduleType = hasRepeating ? "repeat" : "once"
      setScheduleType(scheduleType)

      form.reset({
        name: job.name,
        data: JSON.stringify(job.data, null, 2),
        priority: job.priority,
        disabled: job.disabled,
        schedule: scheduleType,
        nextRunAt: job.nextRunAt ? new Date(job.nextRunAt).toISOString().slice(0, 16) : "",
        repeatInterval: job.repeating?.interval || "",
        timezone: job.repeating?.timezone || "UTC",
      })
    } else {
      form.reset({
        name: "",
        data: "{}",
        priority: 0,
        disabled: false,
        schedule: "once",
        nextRunAt: new Date(Date.now() + 60000).toISOString().slice(0, 16),
        repeatInterval: "",
        timezone: "UTC",
      })
      setScheduleType("once")
    }
  }, [job, form])

  const handleSubmit = (values: FormValues) => {
    try {
      const jobData: any = {
        name: values.name,
        data: values.data ? JSON.parse(values.data) : {},
        priority: values.priority,
        disabled: values.disabled,
      }

      if (values.schedule === "once") {
        jobData.nextRunAt = values.nextRunAt ? new Date(values.nextRunAt).toISOString() : null
        jobData.repeating = null
      } else {
        jobData.repeating = {
          interval: values.repeatInterval,
          timezone: values.timezone,
        }
      }

      onSubmit(jobData)
    } catch (error) {
      console.error("Error parsing job data:", error)
      form.setError("data", {
        type: "manual",
        message: "Invalid JSON format",
      })
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Job Name</FormLabel>
              <FormControl>
                <Input placeholder="email.send" {...field} />
              </FormControl>
              <FormDescription>A unique name for this job</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="data"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Job Data (JSON)</FormLabel>
              <FormControl>
                <Textarea
                  placeholder='{ "userId": "123", "action": "sendEmail" }'
                  className="font-mono h-32"
                  {...field}
                />
              </FormControl>
              <FormDescription>Data to be passed to the job processor</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="priority"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Priority</FormLabel>
                <FormControl>
                  <Input type="number" min={0} max={20} {...field} />
                </FormControl>
                <FormDescription>0 (highest) to 20 (lowest)</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="disabled"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={val => field.onChange(!!val)}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>Disabled</FormLabel>
                  <FormDescription>Job will not run when disabled</FormDescription>
                </div>
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="schedule"
          render={({ field }) => (
            <FormItem className="space-y-3">
              <FormLabel>Schedule Type</FormLabel>
              <FormControl>
                <RadioGroup
                  onValueChange={(value: string) => {
                    field.onChange(value as "once" | "repeat")
                    setScheduleType(value as "once" | "repeat")
                  }}
                  value={field.value}
                  className="flex flex-col space-y-1"
                >
                  <FormItem className="flex items-center space-x-3 space-y-0">
                    <FormControl>
                      <RadioGroupItem value="once" />
                    </FormControl>
                    <FormLabel className="font-normal">Run Once</FormLabel>
                  </FormItem>
                  <FormItem className="flex items-center space-x-3 space-y-0">
                    <FormControl>
                      <RadioGroupItem value="repeat" />
                    </FormControl>
                    <FormLabel className="font-normal">Repeat</FormLabel>
                  </FormItem>
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {scheduleType === "once" && (
          <FormField
            control={form.control}
            name="nextRunAt"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Next Run At</FormLabel>
                <FormControl>
                  <Input type="datetime-local" {...field} />
                </FormControl>
                <FormDescription>When this job should run</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        {scheduleType === "repeat" && (
          <>
            <FormField
              control={form.control}
              name="repeatInterval"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Repeat Interval</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select interval" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="1 minute">Every minute</SelectItem>
                      <SelectItem value="5 minutes">Every 5 minutes</SelectItem>
                      <SelectItem value="10 minutes">Every 10 minutes</SelectItem>
                      <SelectItem value="30 minutes">Every 30 minutes</SelectItem>
                      <SelectItem value="1 hour">Hourly</SelectItem>
                      <SelectItem value="3 hours">Every 3 hours</SelectItem>
                      <SelectItem value="6 hours">Every 6 hours</SelectItem>
                      <SelectItem value="12 hours">Every 12 hours</SelectItem>
                      <SelectItem value="1 day">Daily</SelectItem>
                      <SelectItem value="1 week">Weekly</SelectItem>
                      <SelectItem value="1 month">Monthly</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>How often this job should repeat</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="timezone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Timezone</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select timezone" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="UTC">UTC</SelectItem>
                      <SelectItem value="America/New_York">Eastern Time</SelectItem>
                      <SelectItem value="America/Chicago">Central Time</SelectItem>
                      <SelectItem value="America/Denver">Mountain Time</SelectItem>
                      <SelectItem value="America/Los_Angeles">Pacific Time</SelectItem>
                      <SelectItem value="Europe/London">London</SelectItem>
                      <SelectItem value="Europe/Paris">Paris</SelectItem>
                      <SelectItem value="Asia/Tokyo">Tokyo</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>Timezone for scheduling</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </>
        )}

        <DialogFooter>
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit">{job ? "Update Job" : "Create Job"}</Button>
        </DialogFooter>
      </form>
    </Form>
  )
}