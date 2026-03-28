import Link from "next/link"
import { usePathname } from "next/navigation"
import { PropsWithChildren } from "react"

export function NavLink({
  href,
  children,
}: PropsWithChildren<{
  href: string
}>) {
  const pathname = usePathname()
  const active = pathname === href || (href !== "/" && pathname.startsWith(href))
  return (
    <Link
      href={href}
      className={[
        "rounded-xl px-3 py-2 text-sm font-medium transition",
        active ? "bg-black text-white dark:bg-white dark:text-black" : "hover:bg-black/5 dark:hover:bg-white/10",
      ].join(" ")}
    >
      {children}
    </Link>
  )
}

