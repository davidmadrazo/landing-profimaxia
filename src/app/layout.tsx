import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import localFont from 'next/font/local'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
})

const clashDisplay = localFont({
  src: [
    {
      path: '../../public/fonts/ClashDisplay-Medium.woff2',
      weight: '500',
      style: 'normal',
    },
    {
      path: '../../public/fonts/ClashDisplay-Semibold.woff2',
      weight: '600',
      style: 'normal',
    },
    {
      path: '../../public/fonts/ClashDisplay-Bold.woff2',
      weight: '700',
      style: 'normal',
    },
  ],
  variable: '--font-clash',
})

export const metadata: Metadata = {
  title: 'ProfimaxIA - Inteligencia Artificial para tu Negocio',
  description: 'Bots de WhatsApp, llamadas IA, apps personalizadas, CRM, desarrollo web y landing pages. Automatiza tu negocio con inteligencia artificial. Consulta gratuita.',
  keywords: ['bots whatsapp', 'llamadas ia', 'agencia ia', 'automatizacion', 'crm', 'desarrollo web', 'landing pages', 'inteligencia artificial'],
  authors: [{ name: 'ProfimaxIA' }],
  openGraph: {
    title: 'ProfimaxIA - Inteligencia Artificial para tu Negocio',
    description: 'Bots de WhatsApp, llamadas IA, apps personalizadas y CRM. Automatiza y escala tu negocio con IA. Consulta gratuita.',
    type: 'website',
    locale: 'es_ES',
    siteName: 'ProfimaxIA',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ProfimaxIA - Inteligencia Artificial para tu Negocio',
    description: 'Bots de WhatsApp, llamadas IA, apps personalizadas y CRM. Automatiza y escala tu negocio con IA.',
  },
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: '32x32' },
      { url: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: '/apple-icon.png',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es" className={`dark ${inter.variable} ${clashDisplay.variable}`}>
      <body className={inter.className}>{children}</body>
    </html>
  )
}
