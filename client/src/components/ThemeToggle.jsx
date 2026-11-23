import { Moon, Sun } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useTheme } from '@/hooks/useTheme'
import { cn } from '@/lib/utils'

export default function ThemeToggle({ className }) {
  const { theme, toggleTheme } = useTheme()
  const isDark = theme === 'dark'
  const label = isDark ? 'Switch to light theme' : 'Switch to dark theme'

  return (
    <Button variant="ghost" size="icon" onClick={toggleTheme} aria-label={label} title={label} className={cn(className)}>
      {isDark ? <Sun strokeWidth={1.25} /> : <Moon strokeWidth={1.25} />}
    </Button>
  )
}
