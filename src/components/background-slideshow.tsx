'use client';
import { useEffect, useState } from 'react';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { cn } from '@/lib/utils';

export default function BackgroundSlideshow() {
  const [images, setImages] = useState<string[]>([]);

  useEffect(() => {
    // Directly use the imported image data
    const imageList = PlaceHolderImages.map(p => p.imageUrl);
    if (Array.isArray(imageList)) {
      setImages(imageList);
    } else {
      console.error("Loaded data is not an array:", imageList);
    }
  }, []);


  if (images.length === 0) {
    // Return a single static background to prevent a black screen on error
    return (
       <div className="background-slideshow">
         <img src="/background_photos/bg-city-1.jpg" alt="" className="slide active" />
       </div>
    );
  }

  return (
    <div className="background-slideshow">
      {images.map((src, i) => (
        <div
          key={i}
          className="background-slideshow__slide"
          style={{ 
            backgroundImage: `url(${src})`,
            animationDelay: `${i * 7}s`,
           }}
        />
      ))}
    </div>
  );
}
