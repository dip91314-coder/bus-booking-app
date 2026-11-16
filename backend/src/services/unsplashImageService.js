import { AppError } from '../utils/customErrors.js';

const PHOTO_CACHE_TTL = 24 * 60 * 60 * 1000;
const MAX_CACHE_SIZE = 500;
const photoCache = new Map();
const pendingRequests = new Map();

const addUnsplashTracking = (value) => {
  const url = new URL(value);
  url.searchParams.set('utm_source', 'yatrabus');
  url.searchParams.set('utm_medium', 'referral');
  return url.toString();
};

export async function searchUnsplashPhoto(query, accessKey, fetchImpl = fetch) {
  const normalizedQuery = query.trim().replace(/\s+/g, ' ');
  const cacheKey = normalizedQuery.toLowerCase();
  const cached = photoCache.get(cacheKey);
  if (cached && cached.expiresAt > Date.now()) {
    return cached.photo;
  }

  if (pendingRequests.has(cacheKey)) {
    return pendingRequests.get(cacheKey);
  }

  const searchUrl = new URL('https://api.unsplash.com/search/photos');
  searchUrl.search = new URLSearchParams({
    query: `${normalizedQuery} India travel`,
    per_page: '1',
    orientation: 'landscape',
    content_filter: 'high',
  });

  const request = fetchImpl(searchUrl, {
    headers: {
      Authorization: `Client-ID ${accessKey}`,
      'Accept-Version': 'v1',
    },
  })
    .then(async (response) => {
      if (!response.ok) {
        const statusCode = response.status === 429 ? 503 : 502;
        throw new AppError(`Unsplash image search failed with status ${response.status}.`, statusCode);
      }

      const result = (await response.json()).results?.[0];
      const photo = result
        ? {
            imageUrl: result.urls?.regular,
            alt: result.alt_description || `${normalizedQuery}, India`,
            photographer: result.user?.name,
            photographerUrl: result.user?.links?.html
              ? addUnsplashTracking(result.user.links.html)
              : null,
            sourceUrl: result.links?.html ? addUnsplashTracking(result.links.html) : null,
          }
        : null;

      if (photo && (!photo.imageUrl || !photo.photographerUrl || !photo.sourceUrl)) {
        throw new AppError('Unsplash returned incomplete image attribution data.', 502);
      }

      if (photoCache.size >= MAX_CACHE_SIZE) {
        const oldestKey = photoCache.keys().next().value;
        if (oldestKey) photoCache.delete(oldestKey);
      }
      photoCache.set(cacheKey, { photo, expiresAt: Date.now() + PHOTO_CACHE_TTL });
      return photo;
    })
    .finally(() => {
      pendingRequests.delete(cacheKey);
    });

  pendingRequests.set(cacheKey, request);
  return request;
}
