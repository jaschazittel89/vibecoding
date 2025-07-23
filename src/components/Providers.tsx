'use client'

import React from 'react'
import { SessionProvider } from 'next-auth/react'
import { RecipesProvider } from '@/lib/recipes'

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <RecipesProvider>{children}</RecipesProvider>
    </SessionProvider>
  )
}
