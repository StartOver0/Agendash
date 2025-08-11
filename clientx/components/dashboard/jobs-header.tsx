import type React from "react"
interface JobsHeaderProps {
  heading: string
  description?: string
  children?: React.ReactNode
}

export function JobsHeader({ heading, description, children }: JobsHeaderProps) {
  return (
    <div className="flex items-center justify-between px-2">
      <div className="grid gap-1">
        <h1 className="text-2xl font-bold tracking-tight">{heading}</h1>
        {description && <p className="text-muted-foreground">{description}</p>}
      </div>
      {children}
    </div>
  )
}
