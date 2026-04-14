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
})

const atkinsonMono = Atkinson_Hyperlegible_Mono({
  variable: '--font-atkinson-mono',
  subsets: ['latin'],
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Décisions — Protection des données',
  description: 'Décisions juridiques suisses sur la protection des données',
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
