/**
 * ============================================
 *  Input Component
 *  iOS-Style Input Field
 * ============================================
 * 
 * STRUCTURE:
 * - Supports text, email, password, etc.
 * - Handles left/right icons
 * - Displays error or helper text
 * 
 * DEPENDENCIES:
 * - Input.css
 * ============================================
 */
import React from 'react';
import PropTypes from 'prop-types';
import './Input.css';

const Input = ({
    type = 'text',
    label,
    placeholder,
    value,
    onChange,
    error,
    helperText,
    leftIcon,
    rightIcon,
    disabled = false,
    required = false,
    className = '',
    ...props
}) => {
    const inputClasses = [
        'input',
        error && 'input-error',
        leftIcon && 'input-with-left-icon',
        rightIcon && 'input-with-right-icon',
        disabled && 'input-disabled'
    ].filter(Boolean).join(' ');

    return (
        <div className={`input-wrapper ${className}`}>
            {label && (
                <label className="input-label">
                    {label}
                    {required && <span className="input-required">*</span>}
                </label>
            )}

            <div className="input-container">
                {leftIcon && (
                    <span className="input-icon input-icon-left">{leftIcon}</span>
                )}

                <input
                    type={type}
                    className={inputClasses}
                    placeholder={placeholder}
                    value={value}
                    onChange={onChange}
                    disabled={disabled}
                    required={required}
                    {...props}
                />

                {rightIcon && (
                    <span className="input-icon input-icon-right">{rightIcon}</span>
                )}
            </div>

            {(error || helperText) && (
                <p className={error ? 'input-error-text' : 'input-helper-text'}>
                    {error || helperText}
                </p>
            )}
        </div>
    );
};

export default Input;

Input.propTypes = {
  type: PropTypes.string,
  label: PropTypes.node,
  placeholder: PropTypes.string,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  onChange: PropTypes.func,
  error: PropTypes.string,
  helperText: PropTypes.node,
  leftIcon: PropTypes.node,
  rightIcon: PropTypes.node,
  disabled: PropTypes.bool,
  required: PropTypes.bool,
  className: PropTypes.string,
  id: PropTypes.string,
  name: PropTypes.string,
};

