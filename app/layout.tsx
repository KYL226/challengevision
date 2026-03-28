import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import "./globals.css";
import { Navbar } from "@/app/components/Navbar"
import { AuthProvider } from "@/app/lib/auth-client"
import { ToastProvider } from "@/app/lib/toast"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
})

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
})

export const metadata: Metadata = {
  title: "ResaTable",
  description: "Réservez une table, simplement.",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <AuthProvider>
          <ToastProvider>
            <Navbar />
            <main className="flex-1">{children}</main>
            <footer className="border-t">
              <div className="app-container py-10 text-sm text-[var(--muted-foreground)]">
                ResaTable — backend Next.js + Swagger • {new Date().getFullYear()}
              </div>
            </footer>
          </ToastProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
