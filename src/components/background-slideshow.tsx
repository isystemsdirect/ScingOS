'use client';

import { PlaceHolderImages } from '@/lib/placeholder-images';

const backgroundImages = PlaceHolderImages.filter(p => p.id.startsWith('bg-'));

export function BackgroundSlideshow() {
  return (
    <ul className="slideshow">
      {backgroundImages.map(image => (
        <li
          key={image.id}
          style={{ backgroundImage: `url(${image.imageUrl})` }}
        />
      ))}
    </ul>
  );
}
