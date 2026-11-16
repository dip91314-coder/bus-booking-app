import { describe, expect, it, vi } from 'vitest';
import { searchUnsplashPhoto } from './unsplashImageService.js';

describe('searchUnsplashPhoto', () => {
  it('fetches a destination photo with attribution and caches the result', async () => {
    const fetchImpl = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        results: [
          {
            urls: { regular: 'https://images.unsplash.com/photo-example' },
            alt_description: 'Beach in Digha',
            links: { html: 'https://unsplash.com/photos/digha-photo' },
            user: {
              name: 'Travel Photographer',
              links: { html: 'https://unsplash.com/@travelphotographer' },
            },
          },
        ],
      }),
    });

    const query = `Digha-${Date.now()}`;
    const firstResult = await searchUnsplashPhoto(query, 'test-access-key', fetchImpl);
    const secondResult = await searchUnsplashPhoto(query, 'test-access-key', fetchImpl);

    expect(fetchImpl).toHaveBeenCalledTimes(1);
    expect(fetchImpl.mock.calls[0][0].searchParams.get('query')).toBe(`${query} India travel`);
    expect(fetchImpl.mock.calls[0][1].headers.Authorization).toBe('Client-ID test-access-key');
    expect(firstResult).toEqual(secondResult);
    expect(firstResult).toMatchObject({
      imageUrl: 'https://images.unsplash.com/photo-example',
      photographer: 'Travel Photographer',
      sourceUrl: expect.stringContaining('utm_source=yatrabus'),
      photographerUrl: expect.stringContaining('utm_medium=referral'),
    });
  });
});
