/**
 * ============================================
 *  ThemeToggle Component
 *  Switches between dark and light mode
 * ============================================
 * 
 * STRUCTURE:
 * - Uses ThemeContext for synced state
 * - Uses LanguageContext for tooltips
 *
 * DEPENDENCIES:
 * - Toggle (base switch component)
 * - ThemeContext, LanguageContext
 * - lucide-react icons
 * ============================================
 */
import React from 'react';
import Toggle from './Toggle';
import { useTheme } from '@/contexts/ThemeContext';
import { useLanguage } from '@/contexts/LanguageContext/LanguageContext';       
import { Sun, Moon } from 'lucide-react';

/** 
 * ThemeToggle Component
 * Switches between dark and light mode
 */
export const ThemeToggle = ({ showLabel = true }) => {
    const { isDark, toggleTheme } = useTheme();
    const { t } = useLanguage();

    return (
        <Toggle
            checked={isDark}
            onChange={toggleTheme}
            icon={isDark ? <Moon size={16} /> : <Sun size={16} />}
            label={showLabel ? (isDark ? t('nav.dark') : t('nav.light')) : undefined}
        />
    );
};

export default ThemeToggle;