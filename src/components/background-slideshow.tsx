
'use client';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import placeholderImages from '@/lib/placeholder-images.json';

export default function BackgroundSlideshow() {
  const [index, setIndex] = useState(0);
  const images = placeholderImages.background_photos; // Array of file paths in /public/background_photos

  useEffect(() => {
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
          sizes="100vw"
        />
      ))}
    </div>
  );
}
