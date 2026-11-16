import { describe, expect, it } from 'vitest';
import { getUserAvatarUrl } from './avatar';

describe('getUserAvatarUrl', () => {
  it('uses the UI Avatars defaults and omits color for random backgrounds', () => {
    const url = new URL(getUserAvatarUrl('Nadia Khan'));

    expect(`${url.origin}${url.pathname}`).toBe('https://ui-avatars.com/api/');
    expect(url.searchParams.get('name')).toBe('Nadia Khan');
    expect(url.searchParams.get('background')).toBe('random');
    expect(url.searchParams.has('color')).toBe(false);
    expect(url.searchParams.get('size')).toBe('128');
    expect(url.searchParams.get('rounded')).toBe('true');
    expect(url.searchParams.get('format')).toBe('svg');
  });

  it('supports custom avatar options', () => {
    const url = new URL(
      getUserAvatarUrl('Asha Shah', {
        background: '1c2b39',
        color: 'fff',
        size: 256,
        rounded: false,
        format: 'png',
      })
    );

    expect(url.searchParams.get('name')).toBe('Asha Shah');
    expect(url.searchParams.get('background')).toBe('1c2b39');
    expect(url.searchParams.get('color')).toBe('fff');
    expect(url.searchParams.get('size')).toBe('256');
    expect(url.searchParams.get('rounded')).toBe('false');
    expect(url.searchParams.get('format')).toBe('png');
  });
});
