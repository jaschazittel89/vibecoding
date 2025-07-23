'use client'

import React from 'react'
import { useRecipes } from '@/lib/recipes'

export default function RecipeList() {
  const { recipes } = useRecipes()

  if (recipes.length === 0) {
    return <p className="text-gray-600">No recipes yet. Generate one to get started.</p>
  }

  return (
    <ul className="space-y-4">
      {recipes.map(recipe => (
        <li key={recipe.id} className="border rounded-lg p-4 shadow-sm">
          <h3 className="font-semibold text-lg">{recipe.name}</h3>
          <p className="text-sm text-gray-500">{new Date(recipe.date).toLocaleDateString()}</p>
        </li>
      ))}
    </ul>
  )
}
