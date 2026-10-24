import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('openlib_theme') || 'light'; // 'light' | 'sepia' | 'dark'
  });

  useEffect(() => {
    localStorage.setItem('openlib_theme', theme);
    const root = document.documentElement;
    root.classList.remove('theme-light', 'theme-sepia', 'theme-dark', 'dark');

    if (theme === 'dark') {
      root.classList.add('dark', 'theme-dark');
      document.body.style.backgroundColor = '#0B0F19';
      document.body.style.color = '#CBD5E1';
    } else if (theme === 'sepia') {
      root.classList.add('theme-sepia');
      document.body.style.backgroundColor = '#F4ECD8';
      document.body.style.color = '#433422';
    } else {
      root.classList.add('theme-light');
      document.body.style.backgroundColor = '#F8FAFC';
      document.body.style.color = '#0F172A';
    }
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used within ThemeProvider');
  return context;
}
