"use client"

import { useEffect, useState } from "react"

type Theme = "light" | "dark"

function applyTheme(theme: Theme) {
  const root = document.documentElement
  if (theme === "dark") root.classList.add("dark")
  else root.classList.remove("dark")
}

export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>("light")

  useEffect(() => {
    const saved = localStorage.getItem("theme") as Theme | null
    if (saved === "dark" || saved === "light") {
      setTheme(saved)
      applyTheme(saved)
      return
    }
    const preferred = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"
    setTheme(preferred)
    applyTheme(preferred)
  }, [])

  function toggle() {
    const next: Theme = theme === "dark" ? "light" : "dark"
    setTheme(next)
    localStorage.setItem("theme", next)
    applyTheme(next)
  }

  return (
    <button className="btn btn-ghost" onClick={toggle} type="button" aria-label="Toggle theme">
      {theme === "dark" ? "☀️ Clair" : "🌙 Sombre"}
    </button>
  )
}

