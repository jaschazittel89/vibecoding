import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import React from 'react'
import RecipeList from './RecipeList'
import { RecipesProvider } from '@/lib/recipes'

describe('RecipeList', () => {
  it('renders recipe items', () => {
    const wrapper = (
      <RecipesProvider>
        <RecipeList />
      </RecipesProvider>
    )

    render(wrapper)

    // Initially no recipes
    expect(screen.getByText(/no recipes yet/i)).toBeInTheDocument()
  })
})
