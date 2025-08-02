import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { Toaster } from "@/components/ui/toaster"

const inter = Inter({ subsets: ["latin", "cyrillic"] })

export const metadata: Metadata = {
  title: "BeamNG Моды - Место для модов BeamNG.drive",
  description: "Открывайте, играйте и делитесь контентом BeamNG.drive через нашу платформу, созданную для сообщества.",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ru" className="dark">
      <body className={inter.className}>
        {children}
        <Toaster />
      </body>
    </html>
  )
}
