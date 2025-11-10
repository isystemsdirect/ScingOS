'use client';
import { PlaceHolderImages } from '@/lib/placeholder-images';

export default function BackgroundSlideshow() {
  const images = PlaceHolderImages.filter(p => p.id.startsWith('bg-'));

  return (
    <div className="background-slideshow">
      {images.map((image, i) => (
        <div
          key={image.id}
          className="background-slideshow__slide"
          style={{ 
            backgroundImage: `url(${image.imageUrl})`,
            animationDelay: `${i * 7}s`,
           }}
        />
      ))}
    </div>
  );
}
