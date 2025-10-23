
'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { cn } from '@/lib/utils';

const natureImages = PlaceHolderImages.filter(p => p.id.startsWith('bg-'));

export function BackgroundSlideshow() {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % natureImages.length);
    }, 20000); // Change image every 20 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 w-full h-full z-0 overflow-hidden">
      {natureImages.map((image, index) => (
        <Image
          key={image.id}
          src={image.imageUrl}
          alt={image.description}
          fill
          priority={index === 0}
          className={cn(
            'object-cover transition-opacity duration-[8000ms] ease-in-out',
            index === currentIndex ? 'opacity-40' : 'opacity-0'
          )}
          data-ai-hint={image.imageHint}
        />
      ))}
    </div>
  );
}
