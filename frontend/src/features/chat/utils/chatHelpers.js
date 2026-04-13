/**
 * ============================================
 * Chat Helper Utilities
 * System logic, analytics tracking, and preferences
 * ============================================
 */

const CHAT_AUTO_OPEN_PREF_KEY = 'rentguard_chat_auto_open_contract';

export const isContractChatAutoOpenEnabled = () => {
    try {
        const saved = localStorage.getItem(CHAT_AUTO_OPEN_PREF_KEY);
        if (saved === null) return true;
        return saved !== 'false';
    } catch {
        return true;
    }
};

export const getAnalysisContractIdFromPath = (pathname) => {
    const match = String(pathname || '').match(/^\/analysis\/([^/?#]+)/);
    if (!match || !match[1]) return null;
    try {
        return decodeURIComponent(match[1]);
    } catch {
        return match[1];
    }
};

export const looksLikeMachineId = (value) => {
    const text = String(value || '').trim();
    if (!text) return true;

    // Common UUID-like Cognito identifiers.
    if (/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(text)) {
        return true;
    }

    // Provider-prefixed IDs or long opaque tokens.
    if (text.includes('|') || text.length > 28) {
        return true;
    }

    return false;
};

export const trackChatEvent = (eventName, payload = {}) => {
    const detail = {
        event: eventName,
        timestamp: Date.now(),
        ...payload,
    };

    window.dispatchEvent(new CustomEvent('rg:chat-analytics', { detail }));

    if (import.meta.env.DEV) {
        console.debug('chat-analytics', detail);
    }
};

export const isRateLimitError = (error) => {
    const text = String(error?.message || error || '').toLowerCase();
    return (
        text.includes('429') ||
        text.includes('too many requests') ||
        text.includes('rate limit') ||
        text.includes('rate-limit') ||
        text.includes('קצב')
    );
};

export const getUserDisplayLabel = (userAttributes, user, t) => {
    if (userAttributes?.name) return userAttributes.name;
    if (typeof userAttributes?.email === 'string' && userAttributes.email.includes('@')) {
        return userAttributes.email.split('@')[0];
    }
    if (user?.name) return user.name;
    if (user?.fullName) return user.fullName;
    if (user?.given_name) return user.given_name;
    if (typeof user?.email === 'string' && user.email.includes('@')) {
        return user.email.split('@')[0];
    }
    if (user?.username && !looksLikeMachineId(user.username)) {
        return user.username;
    }
    return t('common.user');
};

export const getUserInitial = (label) => String(label).trim().charAt(0).toUpperCase() || 'U';