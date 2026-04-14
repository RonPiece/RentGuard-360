/**
 * ============================================
 *  toast.utils Library
 *  Helpers for the Toast component
 * ============================================
 * 
 * PURPOSE:
 * - Utility functions like getIcon, normalizeType
 * 
 * ============================================
 */
export const TOAST_TYPES = new Set(['success', 'error', 'warning', 'info']);

export function normalizeType(input) {
    return TOAST_TYPES.has(input) ? input : 'success';
}

export function getIcon(type) {
    if (type === 'error') return '✕';
    if (type === 'warning') return '!';
    if (type === 'info') return 'i';
    return '✓';
}

export function getDocumentDirection() {
    if (typeof document === 'undefined') return 'ltr';
    return document.documentElement?.dir === 'rtl' ? 'rtl' : 'ltr';
}

export function getCloseLabel() {
    return getDocumentDirection() === 'rtl' ? 'סגור' : 'Dismiss';
}
