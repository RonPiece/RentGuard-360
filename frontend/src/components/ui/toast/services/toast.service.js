const TOAST_BURST_WINDOW_MS = 480;
const TOAST_STAGGER_STEP_MS = 80;
const TOAST_MAX_STAGGER_STEPS = 3;

let toastBurstIndex = 0;
let lastToastAt = 0;

export function getStaggerDelayMs() {
    const now = Date.now();
    if (now - lastToastAt > TOAST_BURST_WINDOW_MS) {
        toastBurstIndex = 0;
    } else {
        toastBurstIndex += 1;
    }
    lastToastAt = now;
    return Math.min(toastBurstIndex, TOAST_MAX_STAGGER_STEPS) * TOAST_STAGGER_STEP_MS;
}

/**
 * Event-driven app toast dispatcher. 
 * Allows triggering toasts from anywhere outside React components.
 */
export function emitAppToast(payload) {
    if (typeof window === 'undefined') return;
    window.dispatchEvent(new CustomEvent('rg:toast', { detail: payload }));
}
