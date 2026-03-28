"use client"

import Link from "next/link"
import { Logo } from "@/app/components/Logo"
import { NavLink } from "@/app/components/NavLink"
import { ThemeToggle } from "@/app/components/ThemeToggle"
import { useAuth } from "@/app/lib/auth-client"

export function Navbar() {
  const auth = useAuth()
  return (
    <header className="sticky top-0 z-30 border-b bg-[var(--background)]/80 backdrop-blur">
      <div className="app-container">
        <div className="flex h-16 items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Logo />
            <nav className="hidden items-center gap-1 sm:flex">
              <NavLink href="/restaurants">Restaurants</NavLink>
              <NavLink href="/my-reservations">Mes réservations</NavLink>
              <NavLink href="/dashboard">Admin</NavLink>
            </nav>
          </div>

          <div className="flex items-center gap-2">
            <ThemeToggle />
            {auth.user ? (
              <>
                <span className="hidden text-sm text-[var(--muted-foreground)] sm:inline">
                  {auth.user.name} • {auth.user.role}
                </span>
                <button className="btn btn-outline" onClick={() => auth.clearSession()}>
                  Déconnexion
                </button>
              </>
            ) : (
              <>
                <Link className="btn btn-ghost" href="/login">
                  Se connecter
                </Link>
                <Link className="btn btn-primary" href="/register">
                  Créer un compte
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}

