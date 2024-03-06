import { LucideIcon } from 'lucide-react'
import { ThemeToggle } from '@/components/ui/theme-button'
import { cn } from '@/lib/utils'
import { buttonVariants } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { Link } from '@tanstack/react-router'

interface SidebarNavItem {
  title: string
  label?: string
  icon: LucideIcon
  variant?: 'default' | 'ghost'
  href: string
}

export interface SidebarNavProps {
  collapsed: boolean
  groups?: {
    title: string
    items: SidebarNavItem[]
  }[]
}

export function SidebarNav(props: SidebarNavProps): JSX.Element {
  const { collapsed, groups } = props
  return (
    <div
      data-collapsed={collapsed}
      className="group flex flex-col h-full justify-between gap-4 py-2 data-[collapsed=true]:py-2 pt-4"
    >
      <nav className="grid gap-1 px-2 group-[[data-collapsed=true]]:justify-center group-[[data-collapsed=true]]:px-2">
        {groups?.map((group) => {
          return (
            <div key={group.title} className="flex flex-col gap-2 mb-4">
              <h2
                className="text-lg font-semibold tracking-tight mb-1 uppercase"
                hidden={collapsed}
              >
                {group.title}
              </h2>
              {group.items.map((item) => {
                return collapsed ? (
                  <Tooltip key={item.href} delayDuration={0}>
                    <TooltipTrigger asChild>
                      <Link
                        to={item.href}
                        activeProps={{
                          className: buttonVariants({ variant: 'default' })
                        }}
                        className={cn(
                          buttonVariants({ variant: 'ghost', size: 'sm' }),
                          'dark:bg-muted dark:text-white dark:hover:bg-muted dark:hover:text-white'
                        )}
                      >
                        <item.icon className="h-4 w-4" />
                        <span className="sr-only">{item.title}</span>
                      </Link>
                    </TooltipTrigger>
                    <TooltipContent side="right" className="flex items-center gap-4 font-semibold">
                      {item.title}
                      {item.label && (
                        <span className="ml-auto text-muted-foreground">{item.label}</span>
                      )}
                    </TooltipContent>
                  </Tooltip>
                ) : (
                  <Link
                    key={item.href}
                    to={item.href}
                    activeProps={{
                      className: cn(
                        buttonVariants({
                          variant: 'default',
                          size: 'sm'
                        }),
                        'dark:bg-muted dark:text-white dark:hover:bg-muted dark:hover:text-white',
                        'justify-start'
                      )
                    }}
                    className={cn(
                      buttonVariants({
                        variant: 'ghost',
                        size: 'sm'
                      }),
                      'justify-start'
                    )}
                  >
                    <item.icon className="mr-2 h-4 w-4" />
                    {item.title}
                    {item.label && (
                      <span
                        className={cn(
                          'ml-auto',
                          item.variant === 'default' && 'text-background dark:text-white'
                        )}
                      >
                        {item.label}
                      </span>
                    )}
                  </Link>
                )
              })}
            </div>
          )
        })}
      </nav>
      <nav className="flex flex-col gap-4 px-2">
        <Tooltip delayDuration={0}>
          <TooltipTrigger asChild>
            <ThemeToggle />
          </TooltipTrigger>
          <TooltipContent>
            <span>Toggle theme</span>
          </TooltipContent>
        </Tooltip>
      </nav>
    </div>
  )
}
