
'use client';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

export default function BackgroundSlideshow() {
  // A more robust way to select images for the background
  const backgroundImages = PlaceHolderImages.filter(p => 
    p.id.startsWith('bg-')
  );

  // Fallback to all images if the filter returns none
  const images = backgroundImages.length > 0 ? backgroundImages : PlaceHolderImages;

  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (images.length === 0) return;

    const interval = setInterval(() => {
      setIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, 7000); // Change image every 7 seconds

    return () => clearInterval(interval);
  }, [images.length]);

  // Render a fallback if there are absolutely no images
  if (images.length === 0) {
     return (
       <div className="background-slideshow">
         <div className="background-slide active" style={{ backgroundImage: `url(https://picsum.photos/seed/1/1920/1080)` }} />
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
