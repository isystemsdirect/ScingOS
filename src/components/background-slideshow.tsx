'use client';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

export default function BackgroundSlideshow() {
  const images = PlaceHolderImages.filter(p => p.id.startsWith('bg-') || p.id.startsWith('hero') || p.id.includes('architecture'));
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (images.length === 0) return;
    const interval = setInterval(() => {
      setIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, 7000); // Change image every 7 seconds

    return () => clearInterval(interval);
  }, [images.length]);

  if (images.length === 0) {
     return (
       <div className="background-slideshow">
         <div className="background-slide active" style={{ backgroundImage: `url(/bg-city-1.jpg)` }} />
         <div className="background-overlay"></div>
       </div>
    );
  }

  return (
    <div className="background-slideshow">
      {images.map((image, i) => (
         <div
          key={image.id}
          className={cn("background-slide", i === index && 'active')}
          style={{ backgroundImage: `url(${image.imageUrl})` }}
        />
      ))}
      <div className="background-overlay"></div>
    </div>
  );
}
