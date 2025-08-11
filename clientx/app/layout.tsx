import type React from "react"
import "@/app/globals.css"
import { Inter } from "next/font/google"
// import { ThemeProvider } from "@/components/theme-provider"
import { DashboardNav } from "@/components/dashboard/dashboard-nav"
import {
  SidebarProvider,
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarFooter,
  SidebarInset,
} from "@/components/ui/sidebar"
// import { ModeToggle } from "@/components/mode-toggle"

const inter = Inter({ subsets: ["latin"] })

export const metadata = {
  title: "Agendash Dashboard",
  description: "Monitor and manage your scheduled jobs",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        {/* <ThemeProvider attribute="class" defaultTheme="system" enableSystem> */}
          <SidebarProvider>
            <div className="flex min-h-screen w-full">
              <Sidebar variant="inset">
                <SidebarHeader className="flex h-14 items-center border-b px-6">
                  <span className="font-semibold">Agendash</span>
                </SidebarHeader>
                <SidebarContent>
                  <DashboardNav />
                </SidebarContent>
                <SidebarFooter className="border-t p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">Powered by Agendash</span>
                    {/* <ModeToggle /> */}
                  </div>
                </SidebarFooter>
              </Sidebar>
              <SidebarInset>
                <main className="flex-1 overflow-auto p-6">{children}</main>
              </SidebarInset>
            </div>
          </SidebarProvider>
        {/* </ThemeProvider> */}
      </body>
    </html>
  )
}
