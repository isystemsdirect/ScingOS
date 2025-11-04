
'use client';
import { useEffect, useState } from 'react';
import imageSources from '/public/background-images.json';

export default function BackgroundSlideshow() {
  const [index, setIndex] = useState(0);
  const [images, setImages] = useState<string[]>([]);

  useEffect(() => {
    if (Array.isArray(imageSources)) {
      setImages(imageSources);
    } else {
      console.error("Loaded data is not an array:", imageSources);
    }
  }, []);

  useEffect(() => {
    if (images.length === 0) return;
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % images.length);
    }, 8000);
    return () => clearInterval(interval);
  }, [images.length]);

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
        <img
          key={i}
          src={src}
          alt=""
          className={`slide ${i === index ? 'active' : ''}`}
        />
      ))}
    </div>
  );
}
