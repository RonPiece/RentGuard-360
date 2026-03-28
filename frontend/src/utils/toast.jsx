import React from 'react';
import toast from 'react-hot-toast';

const TOAST_TYPES = new Set(['success', 'error', 'warning', 'info']);

function normalizeType(input) {
    return TOAST_TYPES.has(input) ? input : 'success';
}

function getIcon(type) {
    if (type === 'error') return '✕';
    if (type === 'warning') return '!';
    if (type === 'info') return 'i';
    return '✓';
}

function getDocumentDirection() {
    if (typeof document === 'undefined') return 'ltr';
    return document.documentElement?.dir === 'rtl' ? 'rtl' : 'ltr';
}

function getCloseLabel() {
    return getDocumentDirection() === 'rtl' ? 'סגור' : 'Dismiss';
}

export function showAppToast(payload) {
    const detail = payload || {};
    const type = normalizeType(detail.type || detail.variant);
    const icon = detail.icon;
    const title = detail.title || '';
    const message = detail.message || '';
    const duration = typeof detail.duration === 'number'
        ? detail.duration
        : (typeof detail.ttlMs === 'number' ? detail.ttlMs : 5500);
    const direction = getDocumentDirection();

    return toast.custom(
        (instance) => (
            <div className={`rg-hot-toast rg-hot-toast--${type}`} dir={direction} role="status" aria-live={type === 'error' ? 'assertive' : 'polite'}>
                <span className="rg-hot-toast__icon" aria-hidden="true">{icon ?? getIcon(type)}</span>
                <div className="rg-hot-toast__content">
                    {title && <div className="rg-hot-toast__title">{title}</div>}
                    {message && <div className="rg-hot-toast__message">{message}</div>}
                </div>
                <button
                    type="button"
                    className="rg-hot-toast__dismiss"
                    onClick={(event) => {
                        event.preventDefault();
                        event.stopPropagation();
                        toast.dismiss(instance.id);
                    }}
                    aria-label={getCloseLabel()}
                    title={getCloseLabel()}
                >
                    ×
                </button>
            </div>
        ),
        {
            id: detail.id,
            duration,
            position: detail.position || 'top-right',
        }
    );
}

export function emitAppToast(payload) {
    if (typeof window === 'undefined') return;
    window.dispatchEvent(new CustomEvent('rg:toast', { detail: payload }));
}

export function emitLegacyToast(title, message, options = {}) {
    emitAppToast({ title, message, ...options });
}
