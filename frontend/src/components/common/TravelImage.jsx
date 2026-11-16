import React, { useEffect, useRef, useState } from 'react';
import { imageApi } from '../../services/api';
import OptimizedImage from './OptimizedImage';

const IMAGE_CACHE_PREFIX = 'yatrabus_travel_image:';
const IMAGE_CACHE_TTL = 7 * 24 * 60 * 60 * 1000;
const photoCache = new Map();
const pendingRequests = new Map();
let hasWarnedPhotoLookupError = false;

const getCachedPhoto = (query) => {
  if (photoCache.has(query)) return photoCache.get(query);

  try {
    const cached = JSON.parse(localStorage.getItem(`${IMAGE_CACHE_PREFIX}${query}`) || 'null');
    if (cached?.expiresAt > Date.now()) {
      photoCache.set(query, cached.photo);
      return cached.photo;
    }
    localStorage.removeItem(`${IMAGE_CACHE_PREFIX}${query}`);
  } catch {
    return null;
  }

  return null;
};

const cachePhoto = (query, photo) => {
  const cached = { photo, expiresAt: Date.now() + IMAGE_CACHE_TTL };
  photoCache.set(query, photo);

  try {
    localStorage.setItem(`${IMAGE_CACHE_PREFIX}${query}`, JSON.stringify(cached));
  } catch {
    // Keep the in-memory cache if browser storage is unavailable.
  }
};

const loadPhoto = (query) => {
  const cached = getCachedPhoto(query);
  if (cached) return Promise.resolve(cached);
  if (pendingRequests.has(query)) return pendingRequests.get(query);

  const request = imageApi
    .searchDestinationPhoto(query)
    .then((photo) => {
      if (photo) cachePhoto(query, photo);
      return photo;
    })
    .finally(() => pendingRequests.delete(query));

  pendingRequests.set(query, request);
  return request;
};

const TravelImage = ({
  query,
  src,
  alt = '',
  className = '',
  containerClassName = '',
  fallbackSrc,
  priority = false,
}) => {
  const containerRef = useRef(null);
  const [photo, setPhoto] = useState(null);

  useEffect(() => {
    const normalizedQuery = query?.trim();
    if (!normalizedQuery) return undefined;

    let active = true;
    const requestPhoto = () => {
      loadPhoto(normalizedQuery)
        .then((result) => {
          if (active && result) setPhoto(result);
        })
        .catch((error) => {
          if (active && !hasWarnedPhotoLookupError) {
            hasWarnedPhotoLookupError = true;
            console.warn('Travel photo lookup failed; using the configured fallback image.', error);
          }
        });
    };

    if (typeof IntersectionObserver === 'undefined' || !containerRef.current) {
      requestPhoto();
    } else {
      const observer = new IntersectionObserver(
        (entries) => {
          if (entries.some((entry) => entry.isIntersecting)) {
            observer.disconnect();
            requestPhoto();
          }
        },
        { rootMargin: '200px' }
      );
      observer.observe(containerRef.current);
      return () => {
        active = false;
        observer.disconnect();
      };
    }

    return () => {
      active = false;
    };
  }, [query]);

  return (
    <div ref={containerRef} className={`relative overflow-hidden ${containerClassName}`}>
      <OptimizedImage
        key={photo?.imageUrl || src}
        src={photo?.imageUrl || src}
        alt={photo?.alt || alt}
        className={className}
        containerClassName="w-full h-full"
        fallbackSrc={fallbackSrc}
        priority={priority}
      />
      {photo?.photographerUrl && photo?.sourceUrl && (
        <span className="absolute bottom-1 left-1 z-10 max-w-[calc(100%-0.5rem)] truncate rounded bg-black/60 px-1.5 py-0.5 text-[9px] text-white shadow">
          Photo by{' '}
          <a
            href={photo.photographerUrl}
            target="_blank"
            rel="noreferrer"
            onClick={(event) => event.stopPropagation()}
            className="underline"
          >
            {photo.photographer}
          </a>{' '}
          on{' '}
          <a
            href={photo.sourceUrl}
            target="_blank"
            rel="noreferrer"
            onClick={(event) => event.stopPropagation()}
            className="underline"
          >
            Unsplash
          </a>
        </span>
      )}
    </div>
  );
};

export default TravelImage;
