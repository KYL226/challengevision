"use client"

import { createContext, PropsWithChildren, useContext, useMemo, useState } from "react"

type Toast = { id: number; message: string; type: "success" | "error" | "info" }

type ToastApi = {
  push: (message: string, type?: Toast["type"]) => void
}

const ToastContext = createContext<ToastApi | null>(null)

export function ToastProvider({ children }: PropsWithChildren) {
  const [items, setItems] = useState<Toast[]>([])

  const api = useMemo<ToastApi>(
    () => ({
      push(message, type = "info") {
        const id = Date.now() + Math.floor(Math.random() * 999)
        setItems((prev) => [...prev, { id, message, type }])
        setTimeout(() => {
          setItems((prev) => prev.filter((t) => t.id !== id))
        }, 2600)
      },
    }),
    [],
  )

  return (
    <ToastContext.Provider value={api}>
      {children}
      <div className="fixed bottom-4 right-4 z-[100] grid gap-2">
        {items.map((t) => (
          <div
            key={t.id}
            className={[
              "rounded-xl border px-4 py-3 text-sm shadow-lg backdrop-blur",
              t.type === "success"
                ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
                : t.type === "error"
                  ? "bg-red-500/10 text-red-700 dark:text-red-300"
                  : "bg-[var(--card)] text-[var(--card-foreground)]",
            ].join(" ")}
          >
            {t.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error("useToast must be used within ToastProvider")
  return ctx
}

