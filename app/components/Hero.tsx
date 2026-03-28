import Link from "next/link"

export function Hero() {
  return (
    <section className="app-container py-12 sm:py-16">
      <div className="card overflow-hidden">
        <div className="relative p-8 sm:p-12">
          <div className="absolute inset-0 opacity-60 [background:radial-gradient(1200px_500px_at_20%_0%,rgba(0,0,0,0.08),transparent),radial-gradient(900px_400px_at_100%_30%,rgba(0,0,0,0.06),transparent)] dark:[background:radial-gradient(1200px_500px_at_20%_0%,rgba(255,255,255,0.10),transparent),radial-gradient(900px_400px_at_100%_30%,rgba(255,255,255,0.06),transparent)]" />
          <div className="relative grid gap-10 lg:grid-cols-2 lg:items-center">
            <div className="space-y-5">
              <p className="inline-flex items-center rounded-full border bg-[var(--muted)] px-3 py-1 text-xs font-medium text-[var(--muted-foreground)]">
                Réservation simple • Disponibilités en temps réel
              </p>
              <h1 className="text-3xl font-semibold tracking-tight sm:text-5xl">
                Trouvez une table parfaite, au bon moment.
              </h1>
              <p className="max-w-xl text-base leading-7 text-[var(--muted-foreground)] sm:text-lg">
                Parcourez les restaurants, filtrez par capacité et créneau, puis réservez en quelques secondes.
              </p>
              <div className="flex flex-col gap-3 sm:flex-row">
                <Link href="/restaurants" className="btn btn-primary">
                  Explorer les restaurants
                </Link>
                <a href="/api/docs" className="btn btn-outline">
                  Voir Swagger
                </a>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="card p-5">
                <p className="text-sm font-semibold">Recherche & filtres</p>
                <p className="mt-2 text-sm text-[var(--muted-foreground)]">
                  Capacité, date, horaires… trouvez rapidement.
                </p>
              </div>
              <div className="card p-5">
                <p className="text-sm font-semibold">Gestion des réservations</p>
                <p className="mt-2 text-sm text-[var(--muted-foreground)]">
                  Consultez, modifiez ou annulez facilement.
                </p>
              </div>
              <div className="card p-5 sm:col-span-2">
                <p className="text-sm font-semibold">Admin</p>
                <p className="mt-2 text-sm text-[var(--muted-foreground)]">
                  CRUD restaurants/tables + visibilité sur les réservations.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

