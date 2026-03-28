import Link from "next/link"

export function Logo() {
  return (
    <Link href="/" className="inline-flex items-center gap-2 font-semibold tracking-tight">
      <span className="grid size-8 place-items-center rounded-xl bg-black text-white dark:bg-white dark:text-black">
        R
      </span>
      <span className="text-base sm:text-lg">ResaTable</span>
    </Link>
  )
}

