import { useState } from 'react';
import { ChevronLeft, ChevronRight, PawPrint } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ImageGalleryProps {
  images: string[];
  alt: string;
}

export function ImageGallery({ images, alt }: ImageGalleryProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [imageLoaded, setImageLoaded] = useState<Record<number, boolean>>({});
  const [imageError, setImageError] = useState<Record<number, boolean>>({});

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
  };

  const goToPrev = () => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  return (
    <div className="relative">
      {/* Main Image */}
      <div className="aspect-[4/3] overflow-hidden rounded-xl bg-muted">
        {/* Loading skeleton */}
        {!imageLoaded[currentIndex] && !imageError[currentIndex] && (
          <div className="absolute inset-0 animate-pulse bg-muted rounded-xl" />
        )}
        {/* Error fallback */}
        {imageError[currentIndex] ? (
          <div className="w-full h-full flex items-center justify-center bg-muted">
            <PawPrint className="w-16 h-16 text-muted-foreground/30" />
          </div>
        ) : (
          <img
            src={images[currentIndex]}
            alt={`${alt} - Image ${currentIndex + 1}`}
            className={cn(
              "w-full h-full object-cover transition-opacity duration-300",
              !imageLoaded[currentIndex] && "opacity-0"
            )}
            onLoad={() => setImageLoaded(prev => ({ ...prev, [currentIndex]: true }))}
            onError={() => setImageError(prev => ({ ...prev, [currentIndex]: true }))}
          />
        )}
      </div>

      {/* Navigation Arrows */}
      {images.length > 1 && (
        <>
          <button
            onClick={goToPrev}
            className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-lg bg-card/90 backdrop-blur-sm flex items-center justify-center text-foreground hover:bg-card transition-colors"
            aria-label="Previous image"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={goToNext}
            className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-lg bg-card/90 backdrop-blur-sm flex items-center justify-center text-foreground hover:bg-card transition-colors"
            aria-label="Next image"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </>
      )}

      {/* Dots Indicator */}
      {images.length > 1 && (
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
          {images.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={cn(
                'w-1.5 h-1.5 rounded-full transition-colors',
                index === currentIndex
                  ? 'bg-primary'
                  : 'bg-card/60 hover:bg-card/80'
              )}
              aria-label={`Go to image ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
