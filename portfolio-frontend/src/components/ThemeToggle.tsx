import React, { useContext } from 'react';
import { ThemeContext } from '../context/ThemeContext';
import './ThemeToggle.css';

const ThemeToggle = () => {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error('ThemeToggle must be used within a ThemeContext.Provider');
  }

  const { theme, toggleTheme } = context;

  return (
    <button 
      className="theme-toggle" 
      onClick={toggleTheme} 
      data-theme={theme}
      aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
    >
      <span className="theme-icon">☀️</span>
      <span className="theme-icon">🌙</span>
    </button>
  );
};

export default ThemeToggle;