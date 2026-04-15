/**
 * Chat Helper Utilities.
 * Provides isolated, pure functions for chat preferences, URL parsing, 
 * UX formatting (ID masking), and decoupled telemetry tracking.
 */

const CHAT_AUTO_OPEN_PREF_KEY = 'rentguard_chat_auto_open_contract';

/*Retrieves the user's preference for auto-opening the chat widget.*/
export const isContractChatAutoOpenEnabled = () => {
    try {
        const saved = localStorage.getItem(CHAT_AUTO_OPEN_PREF_KEY);
        if (saved !== null) return saved !== 'false';
        
        // If no preference is saved, default to false on mobile, true on desktop
        if (typeof window !== 'undefined' && window.innerWidth <= 768) {
            return false;
        }
        return true;
    } catch {
        // Failsafe for restricted storage access
        if (typeof window !== 'undefined' && window.innerWidth <= 768) {
            return false;
        }
        return true;
    }
};

/*Extracts the contract ID directly from the URL path.*/
export const getAnalysisContractIdFromPath = (pathname) => {
    const match = String(pathname || '').match(/^\/analysis\/([^/?#]+)/);
    if (!match || !match[1]) return null;
    
    try {
        return decodeURIComponent(match[1]);
    } catch {
        // Fallback to raw string if decoding fails
        return match[1];
    }
};

/**
 * Heuristic check to determine if a string is a raw database ID (like AWS Cognito UUIDs)
 * rather than a human-readable name.
 * Used for UX purposes: prevents greeting the user with an ugly machine hash 
 * (e.g., avoiding "Hello, 550e8400-e29b...") when their actual profile name is missing.
 */
export const looksLikeMachineId = (value) => {
    const text = String(value || '').trim();
    if (!text) return true;

    // Detect standard UUID v1-v5 format (typical for Cognito sub IDs)
    if (/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(text)) {
        return true;
    }

    // Detect OAuth provider-prefixed IDs (e.g., "google-oauth2|12345...") or unusually long tokens
    if (text.includes('|') || text.length > 28) {
        return true;
    }

    return false;
};

/**
 * Decoupled Analytics Dispatcher.
 * Emits standard CustomEvents instead of hardcoding a specific analytics provider (like Mixpanel/GA).
 * This allows any part of the application to listen to 'rg:chat-analytics' and process metrics independently.
 */
export const trackChatEvent = (eventName, payload = {}) => {
    const detail = {
        event: eventName,
        timestamp: Date.now(),
        ...payload,
    };

    window.dispatchEvent(new CustomEvent('rg:chat-analytics', { detail }));

    // Prevent console spam in production environments
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