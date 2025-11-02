
'use client';

import React, { useState } from 'react';
import { cn } from '@/lib/utils';

interface StarRatingProps {
  maxRating?: number;
  currentRating?: number;
  onRatingChange?: (rating: number) => void;
  readonly?: boolean;
  size?: 'small' | 'medium' | 'large';
}

export const StarRating: React.FC<StarRatingProps> = ({
  maxRating = 5,
  currentRating = 0,
  onRatingChange,
  readonly = false,
  size = 'medium'
}) => {
  const [hoverRating, setHoverRating] = useState(0);
  const [selectedRating, setSelectedRating] = useState(currentRating);

  const handleStarClick = (rating: number) => {
    if (!readonly) {
      setSelectedRating(rating);
      onRatingChange?.(rating);
    }
  };

  const handleMouseEnter = (rating: number) => {
    if (!readonly) {
      setHoverRating(rating);
    }
  }

  const handleMouseLeave = () => {
    if (!readonly) {
      setHoverRating(0);
    }
  }

  return (
    <div className={cn('flex items-center gap-1', `star-rating--${size}`)}>
      {[...Array(maxRating)].map((_, index) => {
        const ratingValue = index + 1;
        return (
          <span
            key={index}
            className={cn(
              'star',
              ratingValue <= (hoverRating || selectedRating) ? 'star--filled' : 'star--empty'
            )}
            onClick={() => handleStarClick(ratingValue)}
            onMouseEnter={() => handleMouseEnter(ratingValue)}
            onMouseLeave={handleMouseLeave}
          >
            ★
          </span>
        );
      })}
    </div>
  );
};
