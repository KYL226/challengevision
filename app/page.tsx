import { Hero } from "@/app/components/Hero"

export default function Home() {
  return (
    <div className="bg-[var(--background)]">
      <Hero />
      <section className="app-container pb-16">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div className="card p-6">
            <p className="text-sm font-semibold">Rapide</p>
            <p className="mt-2 text-sm text-[var(--muted-foreground)]">
              Filtre par capacité et créneau, sans friction.
            </p>
          </div>
          <div className="card p-6">
            <p className="text-sm font-semibold">Sécurisé</p>
            <p className="mt-2 text-sm text-[var(--muted-foreground)]">
              Auth JWT + rôles client/admin.
            </p>
          </div>
          <div className="card p-6 sm:col-span-2 lg:col-span-1">
            <p className="text-sm font-semibold">Documenté</p>
            <p className="mt-2 text-sm text-[var(--muted-foreground)]">
              Swagger UI prêt pour la soumission.
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}
