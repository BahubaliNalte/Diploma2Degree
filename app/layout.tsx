'use client'

import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'
import { Toaster } from 'react-hot-toast'
import { usePathname, useRouter } from 'next/navigation'
import { useAuth } from './useAuth'
import { useEffect } from 'react'
import Script from 'next/script'
import Analytics from './analytics'
import DevToolsBlocker from '@/components/DevToolsBlocker';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const { user, loading } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    // Only run on client
    if (typeof window === 'undefined') return
    if (loading) return
    // Allow unauthenticated access to landing, login, signup, counselling, and premium
    const publicPaths = ['/', '/login', '/signup', '/counselling', '/counselling/premium']
    if (!user && !publicPaths.includes(pathname)) {
      router.push('/login')
    }
  }, [user, loading, pathname, router])

  useEffect(() => {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('config', 'G-0NBRXY1124', {
        page_path: pathname,
      })
    }
  }, [pathname])

  return (
    <html lang="en">
      <head>
        {/* Favicons */}
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/favicon-180x180.png" />
        <link rel="icon" type="image/png" sizes="192x192" href="/favicon-192x192.png" />
        <link rel="icon" type="image/png" sizes="512x512" href="/favicon-512x512.png" />
        <link rel="shortcut icon" href="/favicon.ico" />

        {/* Google Analytics Scripts */}
        <Script
          strategy="afterInteractive"
          src={`https://www.googletagmanager.com/gtag/js?id=G-0NBRXY1124`}
        />
        <Script
          id="gtag-init"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'G-0NBRXY1124', {
                page_path: window.location.pathname,
              });
            `,
          }}
        />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <DevToolsBlocker />
        <Analytics />
        {children}
        <Toaster position="top-center" />
      </body>
    </html>
  )
}
