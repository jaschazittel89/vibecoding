import React from 'react'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import Providers from '../components/Providers'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'VibeCoding - Ingredient to Recipe App',
  description: 'Upload photos of your fridge and pantry to get recipe suggestions',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  )
} 