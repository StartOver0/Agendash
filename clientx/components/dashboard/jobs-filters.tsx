"use client"

import { useState } from "react"
import { format } from "date-fns"
import { CalendarIcon, Filter, X, ChevronDown, ChevronUp, Tag, Database } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Slider } from "@/components/ui/slider"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Collapsible, CollapsibleContent } from "@/components/ui/collapsible"
import { cn } from "@/lib/utils"
import { EnhancedJobsTable } from "@/components/dashboard/enhanced-jobs-table"

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

export function JobsFiltersWrapper() {
  const [filters, setFilters] = useState<FilterState>({
    search: "",
    status: {
      scheduled: true,
      completed: true,
      failed: true,
      disabled: true,
    },
    priority: [0, 20],
    dateRange: {
      from: undefined,
      to: undefined,
    },
    tags: [],
    dataAttributes: [],
  })

  const [availableTags, setAvailableTags] = useState<string[]>([
    "email",
    "notification",
    "report",
    "backup",
    "sync",
    "cleanup",
    "import",
    "export",
  ])

  const [isFiltersOpen, setIsFiltersOpen] = useState(true)

  const handleFilterChange = (newFilters: Partial<FilterState>) => {
    setFilters((prev) => ({
      ...prev,
      ...newFilters,
    }))
  }

  const handleStatusChange = (key: keyof FilterState["status"], checked: boolean) => {
    setFilters((prev) => ({
      ...prev,
      status: {
        ...prev.status,
        [key]: checked,
      },
    }))
  }

  const handleTagToggle = (tag: string) => {
    setFilters((prev) => {
      const newTags = prev.tags.includes(tag) ? prev.tags.filter((t) => t !== tag) : [...prev.tags, tag]
      return {
        ...prev,
        tags: newTags,
      }
    })
  }

  const handleAddDataAttribute = () => {
    setFilters((prev) => ({
      ...prev,
      dataAttributes: [
        ...prev.dataAttributes,
        {
          key: "",
          value: "",
          operator: "equals",
        },
      ],
    }))
  }

  const handleUpdateDataAttribute = (index: number, field: keyof FilterState["dataAttributes"][0], value: string) => {
    setFilters((prev) => {
      const newDataAttributes = [...prev.dataAttributes]
      newDataAttributes[index] = {
        ...newDataAttributes[index],
        [field]: value,
      }
      return {
        ...prev,
        dataAttributes: newDataAttributes,
      }
    })
  }

  const handleRemoveDataAttribute = (index: number) => {
    setFilters((prev) => {
      const newDataAttributes = [...prev.dataAttributes]
      newDataAttributes.splice(index, 1)
      return {
        ...prev,
        dataAttributes: newDataAttributes,
      }
    })
  }

  const resetFilters = () => {
    setFilters({
      search: "",
      status: {
        scheduled: true,
        completed: true,
        failed: true,
        disabled: true,
      },
      priority: [0, 20],
      dateRange: {
        from: undefined,
        to: undefined,
      },
      tags: [],
      dataAttributes: [],
    })
  }

  const activeFilterCount =
    (filters.search ? 1 : 0) +
    (Object.values(filters.status).filter((v) => !v).length > 0 ? 1 : 0) +
    (filters.priority[0] > 0 || filters.priority[1] < 20 ? 1 : 0) +
    (filters.dateRange.from || filters.dateRange.to ? 1 : 0) +
    filters.tags.length +
    filters.dataAttributes.length

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <Button variant="outline" size="sm" className="h-8 gap-1" onClick={() => setIsFiltersOpen(!isFiltersOpen)}>
            <Filter className="h-3.5 w-3.5" />
            <span>Filters</span>
            {activeFilterCount > 0 && (
              <Badge variant="secondary" className="ml-1 rounded-full px-1">
                {activeFilterCount}
              </Badge>
            )}
            {isFiltersOpen ? <ChevronUp className="ml-1 h-3.5 w-3.5" /> : <ChevronDown className="ml-1 h-3.5 w-3.5" />}
          </Button>

          {activeFilterCount > 0 && (
            <Button variant="ghost" size="sm" onClick={resetFilters} className="h-8">
              Reset filters
            </Button>
          )}
        </div>

        <Collapsible open={isFiltersOpen} onOpenChange={setIsFiltersOpen}>
          <CollapsibleContent>
            <div className="grid gap-4 rounded-lg border p-4">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {/* Search Filter */}
                <div className="space-y-2">
                  <Label htmlFor="search">Search</Label>
                  <Input
                    id="search"
                    placeholder="Search job name..."
                    value={filters.search}
                    onChange={(e) => handleFilterChange({ search: e.target.value })}
                  />
                </div>

                {/* Status Filter */}
                <div className="space-y-2">
                  <Label>Status</Label>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="scheduled"
                        checked={filters.status.scheduled}
                        onCheckedChange={(checked) => handleStatusChange("scheduled", !!checked)}
                      />
                      <label
                        htmlFor="scheduled"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        Scheduled
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="completed"
                        checked={filters.status.completed}
                        onCheckedChange={(checked) => handleStatusChange("completed", !!checked)}
                      />
                      <label
                        htmlFor="completed"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        Completed
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="failed"
                        checked={filters.status.failed}
                        onCheckedChange={(checked) => handleStatusChange("failed", !!checked)}
                      />
                      <label
                        htmlFor="failed"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        Failed
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="disabled"
                        checked={filters.status.disabled}
                        onCheckedChange={(checked) => handleStatusChange("disabled", !!checked)}
                      />
                      <label
                        htmlFor="disabled"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        Disabled
                      </label>
                    </div>
                  </div>
                </div>

                {/* Priority Filter */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Priority</Label>
                    <span className="text-xs text-muted-foreground">
                      {filters.priority[0]} - {filters.priority[1]}
                    </span>
                  </div>
                  <Slider
                    defaultValue={[0, 20]}
                    min={0}
                    max={20}
                    step={1}
                    value={filters.priority}
                    onValueChange={(value) => handleFilterChange({ priority: value as [number, number] })}
                  />
                </div>

                {/* Date Range Filter */}
                <div className="space-y-2">
                  <Label>Date Range</Label>
                  <div className="grid grid-cols-2 gap-2">
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "justify-start text-left font-normal",
                            !filters.dateRange.from && "text-muted-foreground",
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {filters.dateRange.from ? format(filters.dateRange.from, "PPP") : "From"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={filters.dateRange.from}
                          onSelect={(date) =>
                            handleFilterChange({
                              dateRange: {
                                ...filters.dateRange,
                                from: date,
                              },
                            })
                          }
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "justify-start text-left font-normal",
                            !filters.dateRange.to && "text-muted-foreground",
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {filters.dateRange.to ? format(filters.dateRange.to, "PPP") : "To"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={filters.dateRange.to}
                          onSelect={(date) =>
                            handleFilterChange({
                              dateRange: {
                                ...filters.dateRange,
                                to: date,
                              },
                            })
                          }
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Tags Filter */}
              <div className="space-y-2">
                <div className="flex items-center">
                  <Tag className="mr-2 h-4 w-4" />
                  <Label>Tags</Label>
                </div>
                <div className="flex flex-wrap gap-2">
                  {availableTags.map((tag) => (
                    <Badge
                      key={tag}
                      variant={filters.tags.includes(tag) ? "default" : "outline"}
                      className="cursor-pointer"
                      onClick={() => handleTagToggle(tag)}
                    >
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>

              <Separator />

              {/* Data Attributes Filter */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Database className="mr-2 h-4 w-4" />
                    <Label>Data Attributes</Label>
                  </div>
                  <Button variant="outline" size="sm" onClick={handleAddDataAttribute}>
                    Add Filter
                  </Button>
                </div>

                {filters.dataAttributes.length === 0 ? (
                  <div className="text-sm text-muted-foreground">
                    Add filters to search for specific values in job data
                  </div>
                ) : (
                  <div className="space-y-3">
                    {filters.dataAttributes.map((attr, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <Input
                          placeholder="Key"
                          value={attr.key}
                          onChange={(e) => handleUpdateDataAttribute(index, "key", e.target.value)}
                          className="w-1/3"
                        />
                        <select
                          value={attr.operator}
                          onChange={(e) =>
                            handleUpdateDataAttribute(
                              index,
                              "operator",
                              e.target.value as "equals" | "contains" | "startsWith" | "endsWith",
                            )
                          }
                          className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                        >
                          <option value="equals">equals</option>
                          <option value="contains">contains</option>
                          <option value="startsWith">starts with</option>
                          <option value="endsWith">ends with</option>
                        </select>
                        <Input
                          placeholder="Value"
                          value={attr.value}
                          onChange={(e) => handleUpdateDataAttribute(index, "value", e.target.value)}
                          className="w-1/3"
                        />
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRemoveDataAttribute(index)}
                          className="h-8 w-8"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </CollapsibleContent>
        </Collapsible>
      </div>

      <EnhancedJobsTable filters={filters} />
    </div>
  )
}
