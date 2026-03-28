import { PropsWithChildren } from "react"

export function AuthCard({
  title,
  subtitle,
  children,
}: PropsWithChildren<{ title: string; subtitle?: string }>) {
  return (
    <div className="app-container py-10 sm:py-16">
      <div className="mx-auto max-w-md">
        <div className="card p-6 sm:p-8">
          <div className="space-y-2">
            <h1 className="text-xl font-semibold tracking-tight">{title}</h1>
            {subtitle ? <p className="text-sm text-[var(--muted-foreground)]">{subtitle}</p> : null}
          </div>
          <div className="mt-6">{children}</div>
        </div>
      </div>
    </div>
  )
}

