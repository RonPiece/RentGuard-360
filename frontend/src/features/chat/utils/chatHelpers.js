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
        if (saved === null) return true;
        return saved !== 'false';
    } catch {
        // Failsafe for restricted storage access
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