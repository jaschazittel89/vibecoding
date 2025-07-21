import { useState } from "react";

interface ImageUploadProps {
  label: string;
  onSelect: (file: File) => void;
}

export default function ImageUpload({ label, onSelect }: ImageUploadProps) {
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [progress, setProgress] = useState<number>(0);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!["image/jpeg", "image/png"].includes(file.type)) {
      setError("Only JPEG or PNG allowed");
      return;
    }
    if (file.size > 8 * 1024 * 1024) {
      setError("File must be under 8MB");
      return;
    }
    setError(null);
    setProgress(0);
    const reader = new FileReader();
    reader.onloadstart = () => setProgress(25);
    reader.onloadend = () => setProgress(100);
    reader.onload = () => {
      setPreview(reader.result as string);
      onSelect(file);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="flex flex-col gap-2 w-full max-w-sm">
      <label className="font-medium">{label}</label>
      <input
        type="file"
        accept="image/jpeg,image/png"
        capture="environment"
        onChange={handleChange}
        className="border p-2"
      />
      {error && <p className="text-red-600 text-sm">{error}</p>}
      {preview && (
        <img
          src={preview}
          alt="preview"
          className="w-full h-auto rounded border"
        />
      )}
      {progress > 0 && progress < 100 && (
        <div className="h-2 bg-gray-200 rounded">
          <div
            className="h-full bg-blue-600 rounded"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}
    </div>
  );
}
