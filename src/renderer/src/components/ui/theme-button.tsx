import { Moon, Sun } from 'lucide-react'
import { useTheme } from '../provider/theme-provider'
import { forwardRef } from 'react'
import { Button } from './button'

export const ThemeToggle = forwardRef<HTMLButtonElement>(() => {
  const { setTheme, theme } = useTheme()
  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
    >
      <Sun className="h-[1.5rem] w-[1.3rem] dark:hidden" />
      <Moon className="hidden h-5 w-5 dark:block" />
      <span className="sr-only">Toggle theme</span>
    </Button>
  )
})
ThemeToggle.displayName = 'ThemeToggle'
