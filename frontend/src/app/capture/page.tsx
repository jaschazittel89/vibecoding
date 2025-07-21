'use client';

import { useState } from 'react';
import ImageUpload from '@/components/ImageUpload';

export default function CapturePage() {
  const [pantryFile, setPantryFile] = useState<File | null>(null);
  const [fridgeFile, setFridgeFile] = useState<File | null>(null);

  return (
    <div className="flex flex-col gap-6 p-6 items-center">
      <h1 className="text-2xl font-bold">Upload Pantry and Fridge Photos</h1>
      <ImageUpload label="Pantry photo" onSelect={setPantryFile} />
      {pantryFile && <ImageUpload label="Fridge photo" onSelect={setFridgeFile} />}
      {pantryFile && fridgeFile && (
        <p className="text-green-700">Both images selected!</p>
      )}
    </div>
  );
}
