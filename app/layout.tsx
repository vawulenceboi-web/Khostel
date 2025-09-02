import type { Metadata } from 'next'
import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'
import { Analytics } from '@vercel/analytics/next'
import { Providers } from './providers'
import './globals.css'

export const metadata: Metadata = {
  title: 'k-H - Nigerian Student Hostel Platform',
  description: 'Find and book student hostels around Nigerian universities. Modern, secure platform for students and verified agents.',
  keywords: 'student hostel, Nigeria, university accommodation, hostel booking, student housing, KWASU, UI, OAU, UNILORIN',
  authors: [{ name: 'k-H Team' }],
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable} antialiased`}>
        <Providers>
          {children}
        </Providers>
        <Analytics />
      </body>
    </html>
  )
}
