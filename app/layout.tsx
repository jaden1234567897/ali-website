import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import './globals.css'

export const metadata: Metadata = {
  title: 'Ali Al-Ali | Strategy to Execution',
  description:
    'A premium executive brand, advisory, course, and consultation platform for bridging the strategy to execution gap.',
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
