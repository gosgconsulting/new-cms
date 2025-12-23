import React, { useRef, useState } from 'react';
import { X } from 'lucide-react';

interface ImageThumbnailProps {
  url: string;
  onFileSelected: (file: File) => void;
  onRemove: () => void;
  className?: string;
}

const ImageThumbnail: React.FC<ImageThumbnailProps> = ({ url, onFileSelected, onRemove, className = '' }) => {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [dims, setDims] = useState<{ w: number; h: number } | null>(null);

  return (
    <div className={['w-40', className].filter(Boolean).join(' ')}>
      <div className="relative w-40 h-24 rounded overflow-hidden flex items-start justify-start">
        {url ? (
          <img
            src={url}
            alt="Thumbnail"
            className="w-full h-full object-cover object-left cursor-pointer"
            onClick={() => inputRef.current?.click()}
            onLoad={(e) => {
              const img = e.currentTarget;
              setDims({ w: img.naturalWidth, h: img.naturalHeight });
            }}
          />
        ) : (
          <div
            className="text-xs text-gray-500 cursor-pointer flex items-center justify-center w-full h-full"
            onClick={() => inputRef.current?.click()}
          >
            Click to add image
          </div>
        )}

        <button
          type="button"
          title="Remove image"
          onClick={onRemove}
          className="absolute top-2 right-2 p-1 rounded bg-red-500 text-white"
        >
          <X className="h-4 w-4" />
        </button>

        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) onFileSelected(file);
          }}
        />
      </div>

      <div className="mt-1 text-[11px] text-muted-foreground">
        {dims ? `${dims.w}×${dims.h}px` : url ? 'Loading size…' : 'No image selected'}
      </div>
    </div>
  );
};

export default ImageThumbnail;