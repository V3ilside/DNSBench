'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

interface ThemeContextType {
  accentColor: string;
  setAccentColor: (c: string) => void;
  resetAccentColor: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const DEFAULT_ACCENT = 'rgb(61, 70, 188)'; // #3d46bc

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [accentColor, setAccentColorState] = useState<string>(DEFAULT_ACCENT);

  useEffect(() => {
    const savedAccent = localStorage.getItem('accentColor');
    if (savedAccent) {
      setAccentColorState(savedAccent);
    }
  }, []);

  const setAccentColor = (newColor: string) => {
    setAccentColorState(newColor);
    localStorage.setItem('accentColor', newColor);
  };

  const resetAccentColor = () => {
    setAccentColorState(DEFAULT_ACCENT);
    localStorage.removeItem('accentColor');
  };

  // Apply to DOM
  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty('--accent', accentColor);
    root.style.setProperty('--accent-light', accentColor);
  }, [accentColor]);

  return (
    <ThemeContext.Provider value={{ accentColor, setAccentColor, resetAccentColor }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used within ThemeProvider');
  return context;
}
