/**
 * ============================================
 *  Toast Notifications
 *  Application-wide toast notification system
 * ============================================
 * 
 * STRUCTURE:
 * - showAppToast: Displays single toast
 * - emitAppToast: Event-driven toast
 * - Rate-limiting and burst window logic
 * 
 * DEPENDENCIES:
 * - react-hot-toast
 * ============================================
 */
import React from 'react';
import toast from 'react-hot-toast';
import { getStaggerDelayMs } from './services/toast.service';
import { normalizeType, getIcon, getDocumentDirection, getCloseLabel } from './utils/toast.utils';
import './toast.css';

export function showAppToast(payload) {
    const detail = payload || {};
    const type = normalizeType(detail.type || detail.variant);
    const icon = detail.icon;
    const title = detail.title || '';
    const message = detail.message || '';
    const duration = typeof detail.duration === 'number'
        ? detail.duration
        : (typeof detail.ttlMs === 'number' ? detail.ttlMs : 5500);
    const staggerMs = typeof detail.staggerMs === 'number'
        ? Math.max(0, detail.staggerMs)
        : getStaggerDelayMs();
    const direction = getDocumentDirection();

    return toast.custom(
        (instance) => {
            const isVisible = instance.visible;
            return (
                <div 
                    className={`rg-hot-toast rg-hot-toast--${type} ${isVisible ? 'rg-hot-toast--visible' : 'rg-hot-toast--hidden'}`} 
                    style={{
                        '--rg-toast-stagger-ms': `${staggerMs}ms`,
                        '--rg-toast-exit-stagger-ms': `${Math.round(staggerMs * 0.5)}ms`,
                    }}
                    dir={direction} 
                    role="status" 
                    aria-live={type === 'error' ? 'assertive' : 'polite'}
                >
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
            );
        },
        {
            id: detail.id,
            duration,
            position: detail.position || 'top-right',
            removeDelay: typeof detail.removeDelay === 'number' ? detail.removeDelay : 850,
        }
    );
}

export { emitAppToast } from './services/toast.service';
