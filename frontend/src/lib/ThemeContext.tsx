import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import { apiService } from './apiService';

type Theme = 'light' | 'dark';

export const themeStyles = {
  light: {
    background: '#ffffff',
    surface: '#f8fafc',
    text: '#1e293b',
    subtext: '#64748b',
    border: '#dbe4f0',
    primary: '#7c3aed',
    secondary: '#f59e0b',
    accent: '#0f766e'
  },
  dark: {
    background: '#0f172a',
    surface: '#1e293b',
    text: '#f8fafc',
    subtext: '#94a3b8',
    border: '#334155',
    primary: '#a78bfa',
    secondary: '#fbbf24',
    accent: '#2dd4bf'
  }
};

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  colors: typeof themeStyles.light;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, token } = useAuth();
  const [theme, setThemeState] = useState<Theme>(() => {
    const saved = localStorage.getItem('theme');
    return (saved as Theme) || 'light';
  });

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    localStorage.setItem('theme', newTheme);
    document.body.className = newTheme;
  };

  useEffect(() => {
    const fetchUserSettings = async () => {
      if (isAuthenticated && token) {
        try {
          const response = await apiService.getUserSettings(token);
          if (response && response.settings && response.settings.theme) {
            const userTheme = response.settings.theme as Theme;
            setTheme(userTheme);
          }
        } catch (err) {
          console.error(err);
        }
      }
    };

    fetchUserSettings();
  }, [isAuthenticated, token]);

  useEffect(() => {
    if (!isAuthenticated) {
      setThemeState('light');
      document.body.className = 'light';
    } else {
      const saved = localStorage.getItem('theme') as Theme;
      if (saved === 'light' || saved === 'dark') {
        setThemeState(saved);
        document.body.className = saved;
      }
    }
  }, [isAuthenticated]);

  const colors = themeStyles[theme];

  return (
    <ThemeContext.Provider value={{ theme, setTheme, colors }}>
      <div style={{ backgroundColor: colors.background, color: colors.text, minHeight: '100vh', transition: 'background-color 0.2s, color 0.2s' }}>
        {children}
      </div>
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