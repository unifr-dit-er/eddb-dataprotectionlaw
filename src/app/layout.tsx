import type { Metadata } from 'next'
import {
  Atkinson_Hyperlegible_Next,
  Atkinson_Hyperlegible_Mono,
} from 'next/font/google'
import './globals.css'
import Providers from '@/components/Providers'

const atkinson = Atkinson_Hyperlegible_Next({
  variable: '--font-atkinson',
  subsets: ['latin'],
  display: 'swap',
  adjustFontFallback: false,
})

const atkinsonMono = Atkinson_Hyperlegible_Mono({
  variable: '--font-atkinson-mono',
  subsets: ['latin'],
  display: 'swap',
  adjustFontFallback: false,
})

// Note: metadata and html[lang] are static (server-rendered) and cannot be driven
// by the client-side LanguageContext. They reflect the default locale (FR).
// Canton labels in src/lib/cantons.ts are also French-only (follow-up task).
export const metadata: Metadata = {
  title: 'Base de données — Protection des données',
  description: 'Décisions juridiques cantonales suisses concernant la protection des données',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr" className={`${atkinson.variable} ${atkinsonMono.variable}`}>
      <body className="antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
