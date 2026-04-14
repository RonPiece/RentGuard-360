/**
 * ============================================
 *  useCloseMenu Hook
 *  Custom React Hook for closing menus
 * ============================================
 * 
 * PURPOSE:
 * - Detects clicks outside a specific element
 * - Detects "Escape" key presses
 * - Fires a callback to close menus/modals
 * 
 * ============================================
 */
/**
 *  A combined hook that triggers onClose when clicking outside a referenced element or pressing Escape.
 *  @param {Object} ref - React ref object pointing to the menu element.
 *  @param {boolean} isOpen - Whether the menu is currently open.
 *  @param {Function} onClose - Callback function to call when closing the menu.
 */

import { useEffect } from 'react';

/**
 * A combined hook that triggers onClose when clicking outside a referenced element or pressing Escape.
 */
export function useCloseMenu(ref, isOpen, onClose) {
    useEffect(() => {
        if (!isOpen) return;

        const handleOutsideClick = (event) => {
            if (ref.current && !ref.current.contains(event.target)) {
                onClose?.();
            }
        };

        const handleEscape = (event) => {
            if (event.key === 'Escape') {
                onClose?.();
            }
        };

        document.addEventListener('mousedown', handleOutsideClick);
        document.addEventListener('keydown', handleEscape);

        return () => {
            document.removeEventListener('mousedown', handleOutsideClick);
            document.removeEventListener('keydown', handleEscape);
        };
    }, [ref, isOpen, onClose]);
}
