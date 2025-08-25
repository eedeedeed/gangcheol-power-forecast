import React, { createContext, useState, useEffect, useCallback } from 'react';

const defaultThemeContext = {
  theme: 'light',
  toggleTheme: () => {},
};

export const ThemeContext = createContext(defaultThemeContext);

export default function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => {
    if (typeof window === 'undefined') {
      return 'light';
    }
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) return savedTheme;
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) return 'light';
    return 'dark';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-color-scheme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = useCallback(() => setTheme(prev => (prev === 'light' ? 'dark' : 'light')), []);

  const value = {
    theme,
    toggleTheme,
  };


  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}