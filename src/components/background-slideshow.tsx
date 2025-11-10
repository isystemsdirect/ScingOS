
'use client';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { useState, useEffect } from 'react';

export default function BackgroundSlideshow() {
  const images = PlaceHolderImages.filter(p => p.id.startsWith('bg-'));
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (images.length === 0) return;
    const interval = setInterval(() => {
      setIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, 7000); // Change image every 7 seconds

    return () => clearInterval(interval);
  }, [images.length]);

  if (images.length === 0) {
    return null;
  }

  return (
    <div className="background-slideshow">
      {images.map((image, i) => (
         <div
          key={image.id}
          className={`background-slide ${i === index ? 'active' : ''}`}
          style={{ backgroundImage: `url(${image.imageUrl})` }}
        />
      ))}
      <div className="background-overlay"></div>
    </div>
  );
}
