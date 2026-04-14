/**
 * ============================================
 *  Toggle
 *  iOS-Style Switch Components
 * ============================================
 * 
 * STRUCTURE:
 * - Toggle: Base switch component with keyboard support
 * 
 * DEPENDENCIES:
 * - ThemeContext, LanguageContext
 * - lucide-react icons
 * ============================================
 */
import React from 'react';
import PropTypes from 'prop-types';
import './Toggle.css';


const Toggle = ({
    checked = false,
    onChange,
    label,
    icon,
    disabled = false,
    className = '',
    ...props
}) => {
    const handleToggle = () => {
        if (!disabled && onChange) {
            onChange(!checked);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleToggle();
        }
    };

    const toggleClasses = [
        'toggle-switch',
        checked && 'toggle-checked',
        disabled && 'toggle-disabled',
    ].filter(Boolean).join(' ');

    return (
        <div className={`toggle-wrapper ${className}`}>
            {(label || icon) && (
                <span className="toggle-label">
                    {icon && <span className="toggle-icon">{icon}</span>}
                    {label}
                </span>
            )}
            <div
                className={toggleClasses}
                onClick={handleToggle}
                onKeyPress={handleKeyPress}
                role="switch"
                aria-checked={checked}
                aria-label={label || 'Toggle'}
                tabIndex={disabled ? -1 : 0}
                {...props}
            >
                <div className="toggle-thumb" />
            </div>
        </div>
    );
};

export default Toggle;
