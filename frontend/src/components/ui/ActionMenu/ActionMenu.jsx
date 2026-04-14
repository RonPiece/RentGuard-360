/**
 * ============================================
 *  ActionMenu Component
 *  Generic Dropdown Menu with Click-Outside
 * ============================================
 * 
 * STRUCTURE:
 * - Manages focus and escape key closing
 * - Handles outside click detection
 * 
 * DEPENDENCIES:
 * - React useRef, useEffect
 * ============================================
 */
import React, { useRef } from 'react';
import PropTypes from 'prop-types';
import { useCloseMenu } from './hooks/useCloseMenu';

const ActionMenu = ({
    isOpen,
    onToggle,
    onClose,
    containerClassName = '',
    containerStyle,
    triggerClassName = '',
    triggerStyle,
    triggerTitle,
    triggerAriaLabel,
    triggerContent,
    panelClassName = '',
    panelStyle,
    disabled = false,
    preventDefault = true,
    children,
}) => {
    const menuRef = useRef(null);

    useCloseMenu(menuRef, isOpen, onClose);

    return (
        <div className={containerClassName} style={containerStyle} ref={menuRef}>
            <button
                type="button"
                className={triggerClassName}
            style={triggerStyle}
                title={triggerTitle}
                aria-label={triggerAriaLabel || triggerTitle}
                aria-expanded={isOpen}
                aria-haspopup="menu"
                disabled={disabled}
                onClick={(event) => {
                    if (preventDefault) {
                        event.preventDefault();
                    }
                    onToggle?.();
                }}
            >
                {triggerContent}
            </button>
            {isOpen && (
                <div className={panelClassName} style={panelStyle} role="menu">
                    {children}
                </div>
            )}
        </div>
    );
};

ActionMenu.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    onToggle: PropTypes.func,
    onClose: PropTypes.func,
    containerClassName: PropTypes.string,
    containerStyle: PropTypes.object,
    triggerClassName: PropTypes.string,
    triggerStyle: PropTypes.object,
    triggerTitle: PropTypes.string,
    triggerAriaLabel: PropTypes.string,
    triggerContent: PropTypes.node,
    panelClassName: PropTypes.string,
    panelStyle: PropTypes.object,
    disabled: PropTypes.bool,
    preventDefault: PropTypes.bool,
    children: PropTypes.node,
};

export default ActionMenu;
