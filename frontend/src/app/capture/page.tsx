'use client';

import { useState } from 'react';
import ImageUpload from '@/components/ImageUpload';

export default function CapturePage() {
  const [pantryFile, setPantryFile] = useState<File | null>(null);
  const [fridgeFile, setFridgeFile] = useState<File | null>(null);
  const [recipes, setRecipes] = useState<{ title: string; description: string }[]>([]);

  const handleGenerate = async () => {
    const formData = new FormData();
    if (pantryFile) formData.append('pantry', pantryFile);
    if (fridgeFile) formData.append('fridge', fridgeFile);
    const res = await fetch('/api/generate', { method: 'POST', body: formData });
    const data = await res.json();
    setRecipes(data.recipes);
  };

  return (
    <div className="flex flex-col gap-6 p-6 items-center">
      <h1 className="text-2xl font-bold">Upload Pantry and Fridge Photos</h1>
      <ImageUpload label="Pantry photo" onSelect={setPantryFile} />
      {pantryFile && <ImageUpload label="Fridge photo" onSelect={setFridgeFile} />}
      {pantryFile && fridgeFile && (
        <button
          className="px-4 py-2 bg-blue-600 text-white rounded"
          onClick={handleGenerate}
        >
          Generate Recipes
        </button>
      )}
      {recipes.length > 0 && (
        <ul className="mt-4 space-y-2">
          {recipes.map((r) => (
            <li key={r.title} className="border p-2 rounded">
              <h3 className="font-semibold">{r.title}</h3>
              <p className="text-sm">{r.description}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
