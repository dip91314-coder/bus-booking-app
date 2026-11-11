// @vitest-environment jsdom
import { describe, it, expect } from 'vitest';
import React from 'react';
import { renderToString } from 'react-dom/server';
import App from './App';

describe('App render test', () => {
  it('renders without throwing', () => {
    try {
      const html = renderToString(<App />);
      console.log('HTML length:', html.length);
      expect(html.length).toBeGreaterThan(0);
    } catch (err) {
      console.error('RENDER ERROR:', err);
      throw err;
    }
  });
});
