"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, Clock, Settings, BarChart, AlertCircle, HelpCircle } from "lucide-react"

import { SidebarMenu, SidebarMenuItem, SidebarMenuButton } from "@/components/ui/sidebar"

export function DashboardNav() {
  const pathname = usePathname()

  const navItems = [
    {
      title: "Dashboard",
      href: "/",
      icon: LayoutDashboard,
    },
    {
      title: "Jobs",
      href: "/jobs",
      icon: Clock,
    },
    // {
    //   title: "Statistics",
    //   href: "/statistics",
    //   icon: BarChart,
    // },
    // {
    //   title: "Failed Jobs",
    //   href: "/failed",
    //   icon: AlertCircle,
    // },
    // {
    //   title: "Settings",
    //   href: "/settings",
    //   icon: Settings,
    // },
    {
      title: "Help",
      href: "/help",
      icon: HelpCircle,
    },
  ]

  return (
    <SidebarMenu>
      {navItems.map((item) => (
        <SidebarMenuItem key={item.href}>
          <SidebarMenuButton asChild isActive={pathname === item.href} tooltip={item.title}>
            <Link href={item.href}>
              <item.icon className="h-4 w-4" />
              <span>{item.title}</span>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
      ))}
    </SidebarMenu>
  )
}
