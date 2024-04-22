import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from './components/ui/resizable'
import { cn } from './lib/utils'
import './globals.css'
import { useState } from 'react'
import { SidebarNav } from '@/components/ui/sidebar-nav'
import { TooltipProvider } from '@/components/ui/tooltip'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Toaster } from '@/components/ui/toaster'
import { ThemeProvider } from '@/components/provider/theme-provider'
import { menu } from '@/lib/menu'
import { Outlet } from '@tanstack/react-router'

export default function RootLayout() {
  const [collapsed, setCollapsed] = useState(false)
  return (
    <html lang="en">
      <body>
        <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
          <TooltipProvider>
            <ResizablePanelGroup direction="horizontal" className="items-stretch">
              <ResizablePanel
                defaultSize={10}
                collapsedSize={4}
                collapsible={true}
                minSize={5}
                maxSize={15}
                onCollapse={() => {
                  setCollapsed(true)
                }}
                onExpand={() => {
                  setCollapsed(false)
                }}
                className={cn(
                  collapsed
                    ? 'min-w-[50px] transition-all duration-300 ease-in-out'
                    : 'w-[250px] transition-all duration-300 ease-in-out'
                )}
              >
                <SidebarNav groups={menu} collapsed={collapsed} />
              </ResizablePanel>
              <ResizableHandle withHandle />
              <ResizablePanel defaultSize={90}>
                <ScrollArea className="h-screen p-4">
                  <Outlet />
                </ScrollArea>
              </ResizablePanel>
            </ResizablePanelGroup>
          </TooltipProvider>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  )
}
