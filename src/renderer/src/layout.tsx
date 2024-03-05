import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup
} from '@renderer/components/ui/resizable'
import { cn } from '@renderer/lib/utils'
import './globals.css'
import { useState } from 'react'
import { SidebarNav } from '@renderer/components/ui/sidebar-nav'
import { TooltipProvider } from '@renderer/components/ui/tooltip'
import { ScrollArea } from '@renderer/components/ui/scroll-area'
import { Toaster } from '@renderer/components/ui/toaster'
import { ThemeProvider } from '@renderer/components/provider/theme-provider'
import { menu } from './lib/menu'

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode
}>): JSX.Element {
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
                <ScrollArea className="h-screen p-4">{children}</ScrollArea>
              </ResizablePanel>
            </ResizablePanelGroup>
          </TooltipProvider>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  )
}
