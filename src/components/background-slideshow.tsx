
'use client';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import data from '@/lib/placeholder-images.json';

export default function BackgroundSlideshow() {
  const [index, setIndex] = useState(0);
  const images = data.background_photos; 

  useEffect(() => {
    if (images.length === 0) return;
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % images.length);
    }, 8000);
    return () => clearInterval(interval);
  }, [images.length]);

  return (
    <div className="background-slideshow">
      {images.map((src, i) => (
        <Image
          key={i}
          src={src}
          alt={`slideshow-${i}`}
          fill
          priority={i === index}
          className={`slide ${i === index ? 'active' : ''}`}
        />
      ))}
    </div>
  );
}
