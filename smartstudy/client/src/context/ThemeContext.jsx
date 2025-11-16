import { createContext, useContext, useEffect, useState } from 'react'

const ThemeCtx = createContext(undefined)

export function ThemeProvider({ children }) {
  const [isDark, setIsDark] = useState(false)
  const [isReady, setIsReady] = useState(false)

  useEffect(() => {
    // Get initial theme from localStorage or system preference
    const saved = localStorage.getItem('theme')
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    const shouldBeDark = saved ? saved === 'dark' : prefersDark

    setIsDark(shouldBeDark)
    applyTheme(shouldBeDark)
    setIsReady(true)
  }, [])

  const applyTheme = (dark) => {
    const html = document.documentElement
    if (dark) {
      html.classList.add('dark')
    } else {
      html.classList.remove('dark')
    }
    localStorage.setItem('theme', dark ? 'dark' : 'light')
  }

  const toggleTheme = () => {
    const newTheme = !isDark
    setIsDark(newTheme)
    applyTheme(newTheme)
  }

  const value = { isDark, toggleTheme, isReady }

  return (
    <ThemeCtx.Provider value={value}>
      {children}
    </ThemeCtx.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeCtx)
  if (context === undefined) {
    throw new Error('useTheme must be used within ThemeProvider')
  }
  return context
}
