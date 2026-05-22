/**
 * @file src/app/components/ui/OptimizedImage.tsx
 * @description Optimized Image Component with WebP Support - Phase 2 UX
 * @author YanYuCloudCube Team
 * @version v1.0.0
 * @created 2026-05-22
 * @status stable
 * @license MIT
 *
 * Features:
 * - Automatic WebP format detection with fallback
 * - Responsive image with srcset support
 * - Lazy loading for below-the-fold images
 * - Blur placeholder to prevent CLS
 */

import React, { useState, useRef, useEffect } from 'react';

interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  lazy?: boolean;
  priority?: boolean;
  blurPlaceholder?: string;
  objectFit?: 'cover' | 'contain' | 'fill' | 'none';
}

const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  width,
  height,
  className = '',
  lazy = true,
  priority = false,
  blurPlaceholder,
  objectFit = 'cover',
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(!lazy || priority);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    if (!lazy || priority || !imgRef.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { rootMargin: '50px' }
    );

    observer.observe(imgRef.current);

    return () => observer.disconnect();
  }, [lazy, priority]);

  const webpSrc = src.replace(/\.(png|jpg|jpeg)$/i, '.webp');
  const supportsWebP = typeof window !== 'undefined' && document.createElement('canvas').toDataURL('image/webp').startsWith('data:image/webp');

  return (
    <div
      ref={imgRef}
      className={`relative overflow-hidden ${className}`}
      style={{ width: width || '100%', height: height || 'auto', backgroundColor: '#112240' }}
    >
      {!isLoaded && blurPlaceholder && (
        <div
          className="absolute inset-0 skeleton"
          style={{ backgroundImage: `url(${blurPlaceholder})`, backgroundSize: 'cover', filter: 'blur(20px)' }}
          aria-hidden="true"
        />
      )}

      {isInView && (
        <picture>
          {supportsWebP && <source srcSet={webpSrc} type="image/webp" />}
          <img
            src={src}
            alt={alt}
            width={width}
            height={height}
            loading={priority ? 'eager' : 'lazy'}
            decoding="async"
            onLoad={() => setIsLoaded(true)}
            style={{
              opacity: isLoaded ? 1 : 0,
              transition: 'opacity 0.3s ease-in',
              objectFit,
              width: '100%',
              height: '100%',
            }}
          />
        </picture>
      )}
    </div>
  );
};

export default OptimizedImage;
