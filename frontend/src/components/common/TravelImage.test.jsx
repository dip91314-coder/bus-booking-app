// @vitest-environment jsdom

import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import TravelImage from './TravelImage';
import { imageApi } from '../../services/api';

vi.mock('../../services/api', () => ({
  imageApi: {
    searchDestinationPhoto: vi.fn(),
  },
}));

describe('TravelImage', () => {
  beforeEach(() => {
    imageApi.searchDestinationPhoto.mockResolvedValue({
      imageUrl: 'https://images.unsplash.com/photo-example',
      alt: 'Pune city',
      photographer: 'Travel Photographer',
      photographerUrl: 'https://unsplash.com/@travelphotographer',
      sourceUrl: 'https://unsplash.com/photos/pune-photo',
    });
  });

  it('loads a destination photo and displays its attribution', async () => {
    render(
      <TravelImage
        query={`Pune-${Date.now()}`}
        src="https://example.com/fallback.jpg"
        alt="Pune"
      />
    );

    expect(
      (await screen.findByRole('link', { name: 'Travel Photographer' })).getAttribute('href')
    ).toBe('https://unsplash.com/@travelphotographer');
    expect(screen.getByAltText('Pune city').getAttribute('src')).toContain(
      'https://images.unsplash.com/photo-example'
    );
    expect(screen.getByRole('link', { name: 'Unsplash' }).getAttribute('href')).toBe(
      'https://unsplash.com/photos/pune-photo'
    );
  });
});
