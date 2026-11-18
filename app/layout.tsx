import type React from "react"
import type { Metadata, Viewport } from "next"
import { Manrope, Noto_Sans_JP, Sora } from "next/font/google"
import { Toaster } from "sonner"
import { LanguageProvider } from "@/lib/i18n"
import "./globals.css"

// Sora ("sky" in Japanese) for headings, Manrope for body text.
const sora = Sora({ subsets: ["latin"], variable: "--font-display", display: "swap" })
const manrope = Manrope({ subsets: ["latin"], variable: "--font-sans", display: "swap" })
// Neither has Japanese characters; those come from Noto Sans JP (see the font stacks in
// tailwind.config.js). It is served in small slices by character range, and none load until
// Japanese text is on screen, so it is not preloaded.
const notoSansJp = Noto_Sans_JP({ variable: "--font-jp", display: "swap", preload: false })

export const metadata: Metadata = {
  title: "KWON WOOSUB - Developer Portfolio",
  description: "Portfolio of KWON WOOSUB, a Developer specializing in web technologies.",
  generator: "Next.js",
}

export const viewport: Viewport = {
  themeColor: "#03040c",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${sora.variable} ${manrope.variable} ${notoSansJp.variable}`}>
      <body>
        {/* English first; the language button in the navigation bar switches to Japanese */}
        <LanguageProvider>{children}</LanguageProvider>
        <Toaster position="top-right" richColors />
      </body>
    </html>
  )
}
