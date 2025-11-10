
'use client';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

export default function BackgroundSlideshow() {
  const images = PlaceHolderImages.filter(p => p.id.startsWith('bg-'));
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, 7000); // Change image every 7 seconds

    return () => clearInterval(interval);
  }, [images.length]);

  if (images.length === 0) {
    return null;
  }

  return (
    <div className="fixed inset-0 w-full h-full -z-10 bg-background overflow-hidden">
      <AnimatePresence>
        <motion.div
          key={index}
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.5 }}
          className="absolute inset-0 w-full h-full bg-cover bg-center"
          style={{ backgroundImage: `url(${images[index].imageUrl})` }}
        />
      </AnimatePresence>
       <div className="absolute inset-0 bg-black/50"></div>
    </div>
  );
}
