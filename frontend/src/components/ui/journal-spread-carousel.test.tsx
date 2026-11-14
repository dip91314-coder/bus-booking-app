// @vitest-environment jsdom
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import JournalSpreadCarousel, {
  clamp,
  spreadAspect,
  spreadWidth,
  poseFor,
  settle,
  durationFor,
  easeInOut,
  easeOut,
  type JournalSpread
} from './journal-spread-carousel';

describe('JournalSpreadCarousel Math & Helper Functions', () => {
  it('clamps numbers within given bounds', () => {
    expect(clamp(5, 0, 10)).toBe(5);
    expect(clamp(-5, 0, 10)).toBe(0);
    expect(clamp(15, 0, 10)).toBe(10);
  });

  it('calculates spread aspects for narrow and wide stages', () => {
    expect(spreadAspect(400, 800)).toBe(0.86);
    expect(spreadAspect(1200, 800)).toBe(1.25);
  });

  it('calculates spread width cleanly', () => {
    expect(spreadWidth(0, 0)).toBe(0);
    expect(spreadWidth(1000, 600)).toBeGreaterThan(0);
  });

  it('computes 3D poses for open center and side stacked spreads', () => {
    const centerPose = poseFor(0, 800);
    expect(Math.abs(centerPose.x)).toBe(0);
    expect(Math.abs(centerPose.z)).toBe(0);
    expect(centerPose.hidden).toBe(false);

    const leftPose = poseFor(-1, 800);
    expect(leftPose.x).toBeLessThan(0);
    expect(leftPose.z).toBeLessThan(0);
  });

  it('computes settle positions with velocity', () => {
    expect(settle(2.2, 0, 5)).toBe(2);
    expect(settle(2.2, 10, 5)).toBe(4);
    expect(settle(0, -10, 5)).toBe(0);
  });

  it('computes tween durations and easings', () => {
    expect(durationFor(0)).toBe(0);
    expect(durationFor(3)).toBeGreaterThan(0);
    expect(easeInOut(0)).toBe(0);
    expect(easeInOut(1)).toBe(1);
    expect(easeOut(0)).toBe(0);
    expect(easeOut(1)).toBe(1);
  });
});

describe('JournalSpreadCarousel Component Render', () => {
  const dummySpreads: JournalSpread[] = [
    {
      id: 'test-1',
      label: 'Himalayan Journey',
      image: 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23',
      alt: 'Snowy mountains',
      prints: [
        {
          src: 'https://images.unsplash.com/photo-1544717305-2782549b5136',
          caption: 'Chai',
          x: 10,
          y: 10,
          w: 20
        }
      ],
      notes: [
        {
          title: 'Morning Pine',
          body: 'Crisp morning air.',
          x: 50,
          y: 20,
          w: 30
        }
      ]
    }
  ];

  it('renders carousel title and spreads properly', () => {
    render(
      <JournalSpreadCarousel
        spreads={dummySpreads}
        title="My Road Trip"
        meta="1 double-page spread"
      />
    );

    expect(screen.getByText('My Road Trip')).toBeDefined();
    expect(screen.getByText('1 double-page spread')).toBeDefined();
    expect(screen.getByText(/Himalayan Journey/)).toBeDefined();
  });
});
