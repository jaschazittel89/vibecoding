import React from 'react'
import Link from 'next/link'

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-md w-full mx-auto p-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            VibeCoding
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Upload photos of your fridge and pantry to get recipe suggestions
          </p>
        </div>
        
        <div className="space-y-4">
          <Link 
            href="/signup"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition duration-200 block text-center"
          >
            Get Started
          </Link>
          
          <Link 
            href="/login"
            className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-3 px-4 rounded-lg transition duration-200 block text-center"
          >
            Sign In
          </Link>
        </div>
        
        <div className="mt-8 text-center text-sm text-gray-500 dark:text-gray-400">
          <p>Based on the specs from agents.md and specs.md</p>
        </div>
      </div>
    </div>
  )
} 