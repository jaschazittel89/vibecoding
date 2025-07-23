import React, { createContext, useContext, useState } from 'react'

export type Recipe = {
  id: string
  name: string
  date: string
}

interface RecipesContextValue {
  recipes: Recipe[]
  addRecipe: (name: string) => void
}

const RecipesContext = createContext<RecipesContextValue | undefined>(undefined)

export function RecipesProvider({ children }: { children: React.ReactNode }) {
  const [recipes, setRecipes] = useState<Recipe[]>([])

  const addRecipe = (name: string) => {
    setRecipes(prev => [
      ...prev,
      {
        id: crypto.randomUUID(),
        name,
        date: new Date().toISOString()
      }
    ])
  }

  return (
    <RecipesContext.Provider value={{ recipes, addRecipe }}>
      {children}
    </RecipesContext.Provider>
  )
}

export function useRecipes() {
  const context = useContext(RecipesContext)
  if (!context) throw new Error('useRecipes must be used within RecipesProvider')
  return context
}
