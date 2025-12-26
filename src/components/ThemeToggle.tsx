"use client"

import React, { useEffect, useState } from "react"
import { Moon, Sun } from "lucide-react"

type Theme = "dark" | "light" | "system"

export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>("dark")
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    // eslint-disable-next-line
    setMounted(true)
    const localTheme = localStorage.getItem("theme") as Theme
    if (localTheme) {
      setTheme(localTheme)
      document.documentElement.setAttribute("data-theme", localTheme)
    }
  }, [])

  const toggleTheme = () => {
    const newTheme = theme === "dark" ? "light" : "dark"
    setTheme(newTheme)
    document.documentElement.setAttribute("data-theme", newTheme)
    localStorage.setItem("theme", newTheme)
  }

  if (!mounted) return null

  return (
    <button
      onClick={toggleTheme}
      className="w-10 h-10 rounded-full glass flex items-center justify-center hover:bg-white/10 transition-all active:scale-95 group relative overflow-hidden"
      aria-label="Toggle Theme"
    >
      <div className="relative z-10">
        {theme === "dark" ? (
          <Moon className="w-4 h-4 text-blue-300 group-hover:text-blue-200 transition-colors" />
        ) : (
          <Sun className="w-4 h-4 text-amber-500 group-hover:text-amber-400 transition-colors" />
        )}
      </div>
      <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/20 to-purple-500/20 opacity-0 group-hover:opacity-100 transition-opacity" />
    </button>
  )
}
