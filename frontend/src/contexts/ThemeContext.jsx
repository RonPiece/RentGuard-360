/**
 * ============================================
 *  ThemeContext
 *  Global Theme Provider (Light/Dark Mode)
 * ============================================
 * 
 * STRUCTURE:
 * - useTheme: Hook for consuming theme state
 * - ThemeProvider: Manages theme context and persistence
 * 
 * DEPENDENCIES:
 * - React Context API
 * - localStorage: 'theme' persistence
 * - document.documentElement 'data-theme' attribute
 * 
 * ============================================
 */
/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext(null);

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
};

export const ThemeProvider = ({ children }) => {
    const [isDark, setIsDark] = useState(() => {
        const saved = localStorage.getItem('theme');
        // Default to light theme if nothing is saved
        if (saved) return saved === 'dark';
        return false; // Light mode by default
    });

    useEffect(() => {
        document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
        localStorage.setItem('theme', isDark ? 'dark' : 'light');
    }, [isDark]);

    const toggleTheme = () => setIsDark(prev => !prev);
    const setTheme = (dark) => setIsDark(dark);

    return (
        <ThemeContext.Provider value={{ isDark, toggleTheme, setTheme }}>
            {children}
        </ThemeContext.Provider>
    );
};
