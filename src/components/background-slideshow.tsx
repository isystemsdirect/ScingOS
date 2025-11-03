
'use client';
import { useEffect, useState } from 'react';

export default function BackgroundSlideshow() {
  const [index, setIndex] = useState(0);
  const [images, setImages] = useState<string[]>([]);

  useEffect(() => {
    fetch('/background-images.json')
      .then((res) => {
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        return res.json();
      })
      .then((data) => {
        if (Array.isArray(data)) {
          setImages(data);
        } else {
          console.error("Fetched data is not an array:", data);
        }
      })
      .catch((error) => {
        console.error("Could not fetch background images:", error);
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
