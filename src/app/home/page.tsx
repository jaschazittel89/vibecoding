'use client'

import React from 'react'
import RecipeList from '@/components/RecipeList'
import { useRecipes } from '@/lib/recipes'

export default function HomeScreen() {
  const { addRecipe } = useRecipes()

  const handleGenerate = () => {
    // For now just add a placeholder recipe
    const name = `Recipe ${Math.floor(Math.random() * 1000)}`
    addRecipe(name)
  }

  return (
    <div className="min-h-screen px-4 py-8 bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-xl mx-auto space-y-6">
        <button
          onClick={handleGenerate}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition duration-200"
        >
          Generate New Recipe
        </button>
        <RecipeList />
      </div>
    </div>
  )
}
