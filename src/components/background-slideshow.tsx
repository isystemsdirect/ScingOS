'use client';
import { useEffect, useState } from 'react';

export default function BackgroundSlideshow() {
  const [index, setIndex] = useState(0);
  const [images, setImages] = useState<string[]>([]);

  useEffect(() => {
    fetch('/background-images.json')
      .then((res) => res.json())
      .then((data) => {
        setImages(data.background_photos);
      });
  }, []);

  useEffect(() => {
    if (images.length === 0) return;
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % images.length);
    }, 8000);
    return () => clearInterval(interval);
  }, [images.length]);

  if (images.length === 0) {
    return null; // Or a placeholder
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
