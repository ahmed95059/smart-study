import { Moon, Sun } from 'lucide-react'
import { useContext } from 'react'
import { useTheme } from '../context/ThemeContext'

export default function ThemeToggle() {
  let isDark = false
  let toggleTheme = () => {}

  try {
    const theme = useTheme()
    isDark = theme.isDark
    toggleTheme = theme.toggleTheme
  } catch (e) {
    // If theme context is not available, use default
    isDark = localStorage.getItem('theme') === 'dark'
    toggleTheme = () => {
      const newTheme = !isDark
      localStorage.setItem('theme', newTheme ? 'dark' : 'light')
      document.documentElement.classList.toggle('dark')
      window.location.reload()
    }
  }

  return (
    <button
      onClick={toggleTheme}
      className="w-10 h-10 rounded-lg flex items-center justify-center transition-colors duration-300 bg-bg-soft border border-border hover:bg-white dark:bg-dark-card dark:border-dark-border dark:hover:bg-dark-border"
      aria-label="Toggle theme"
      title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      {isDark ? (
        <Sun size={20} className="text-accent transition-colors duration-300" />
      ) : (
        <Moon size={20} className="text-primary transition-colors duration-300" />
      )}
    </button>
  )
}
