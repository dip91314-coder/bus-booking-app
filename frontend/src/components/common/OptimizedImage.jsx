import React, { useState } from 'react';

/**
 * High-performance responsive image component
 * - Fast lazy loading and async decoding
 * - Shimmer skeleton placeholder while loading
 * - Graceful fallback on broken image URLs
 * - Prevents layout shift (CLS)
 */
export const OptimizedImage = ({
  src,
  alt = '',
  className = '',
  containerClassName = '',
  fallbackSrc = 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=800&q=75',
  width,
  height,
  priority = false,
  ...props
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  // Fast format optimization query for Unsplash if applicable
  const optimizedSrc = React.useMemo(() => {
    if (!src) return fallbackSrc;
    if (src.includes('unsplash.com') && !src.includes('auto=format')) {
      const joiner = src.includes('?') ? '&' : '?';
      return `${src}${joiner}auto=format&fit=crop&w=800&q=75`;
    }
    return src;
  }, [src, fallbackSrc]);

  const currentSrc = hasError ? fallbackSrc : optimizedSrc;

  return (
    <div className={`relative overflow-hidden ${containerClassName}`}>
      {/* Shimmer skeleton until image loads */}
      {!isLoaded && !hasError && (
        <div
          className="absolute inset-0 bg-slate-200 dark:bg-slate-800 animate-pulse transition-opacity duration-300"
          aria-hidden="true"
        />
      )}

      <img
        src={currentSrc}
        alt={alt}
        loading={priority ? 'eager' : 'lazy'}
        decoding="async"
        width={width}
        height={height}
        onLoad={() => setIsLoaded(true)}
        onError={() => {
          setHasError(true);
          setIsLoaded(true);
        }}
        className={`${className} transition-opacity duration-300 ${
          isLoaded ? 'opacity-100' : 'opacity-0'
        }`}
        {...props}
      />
    </div>
  );
};

export default OptimizedImage;
