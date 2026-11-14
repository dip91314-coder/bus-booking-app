import React, { createContext, useContext, useEffect, useState } from 'react';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  // Theme state: 'light' | 'dark' (defaults to 'light')
  const [theme, setThemeState] = useState(() => {
    try {
      const saved = localStorage.getItem('yatrabus_theme');
      if (saved === 'dark' || saved === 'light') {
        return saved;
      }
    } catch {
      // In SSR or restricted storage environments
    }
    return 'light';
  });

  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const root = document.documentElement;
    const activeIsDark = theme === 'dark';

    setIsDark(activeIsDark);

    if (activeIsDark) {
      root.classList.add('dark');
      root.style.colorScheme = 'dark';
    } else {
      root.classList.remove('dark');
      root.style.colorScheme = 'light';
    }
  }, [theme]);

  const setTheme = (newTheme) => {
    const normalized = newTheme === 'dark' ? 'dark' : 'light';
    setThemeState(normalized);
    try {
      localStorage.setItem('yatrabus_theme', normalized);
    } catch {
      // Ignore storage errors
    }
  };

  const toggleTheme = () => {
    setTheme(isDark ? 'light' : 'dark');
  };

  return (
    <ThemeContext.Provider value={{ theme, isDark, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export default ThemeContext;