
'use client';

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { UploadCloud, X } from 'lucide-react';
import * as exifr from 'exifr';
import { Button } from '../ui/button';

interface ImageUploadZoneProps {
  onImageProcessed: (data: { imageBase64: string; metadata: any }) => void;
  onReset: () => void;
  currentImage: string | null;
}

export function ImageUploadZone({ onImageProcessed, onReset, currentImage }: ImageUploadZoneProps) {
  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const imageBase64 = e.target?.result as string;
        try {
          const metadata = await exifr.parse(file);
          onImageProcessed({ imageBase64, metadata });
        } catch (error) {
          console.error("Metadata extraction failed:", error);
          // Proceed without metadata if parsing fails
          onImageProcessed({ imageBase64, metadata: { error: "Could not parse EXIF data." } });
        }
      };
      reader.readAsDataURL(file);
    }
  }, [onImageProcessed]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': ['.jpeg', '.png', '.jpg', '.webp'] },
    multiple: false,
  });

  if (currentImage) {
    return (
      <div className="relative group w-full aspect-video rounded-lg overflow-hidden border-2 border-dashed border-primary/50">
        <img src={currentImage} alt="Uploaded preview" className="w-full h-full object-contain" />
        <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          <Button variant="destructive" onClick={onReset}>
            <X className="mr-2 h-4 w-4" />
            Remove Image
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div
      {...getRootProps()}
      className={`w-full aspect-video rounded-lg border-2 border-dashed flex flex-col items-center justify-center text-center p-8 cursor-pointer transition-colors ${
        isDragActive ? 'border-primary bg-primary/10' : 'border-border hover:border-primary/50'
      }`}
    >
      <input {...getInputProps()} />
      <div className="p-4 bg-muted/50 rounded-full mb-4">
        <UploadCloud className="h-10 w-10 text-muted-foreground" />
      </div>
      <h3 className="font-semibold text-lg">
        {isDragActive ? 'Drop the image here ...' : 'Drag & drop an image, or click to select'}
      </h3>
      <p className="text-muted-foreground text-sm mt-1">
        Supports: JPEG, PNG, WEBP (max. 10MB)
      </p>
    </div>
  );
}
