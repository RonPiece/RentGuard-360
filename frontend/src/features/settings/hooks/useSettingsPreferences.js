/** Hook that manages user preferences: theme, language, compact nav mode. Persists to localStorage. */
import { useState, useEffect } from 'react';

const CHAT_AUTO_OPEN_PREF_KEY = 'rentguard_chat_auto_open_contract';
const MOBILE_NAV_COMPACT_PREF_KEY = 'rentguard_mobile_nav_compact';

export const useSettingsPreferences = () => {
    const [chatAutoOpenEnabled, setChatAutoOpenEnabled] = useState(() => {
        try {
            const saved = localStorage.getItem(CHAT_AUTO_OPEN_PREF_KEY);
            if (saved !== null) return saved !== 'false';
            
            if (typeof window !== 'undefined' && window.innerWidth <= 768) {
                return false;
            }
            return true;
        } catch {
            if (typeof window !== 'undefined' && window.innerWidth <= 768) {
                return false;
            }
            return true;
        }
    });

    const [mobileNavCompactEnabled, setMobileNavCompactEnabled] = useState(() => {
        try {
            return localStorage.getItem(MOBILE_NAV_COMPACT_PREF_KEY) === 'true';
        } catch {
            return false;
        }
    });

    const [isMobileViewport, setIsMobileViewport] = useState(() => {
        if (typeof window === 'undefined' || !window.matchMedia) return false;
        return window.matchMedia('(max-width: 768px)').matches;
    });

    useEffect(() => {
        if (typeof window === 'undefined' || !window.matchMedia) return undefined;

        const mediaQuery = window.matchMedia('(max-width: 768px)');
        const updateIsMobile = () => setIsMobileViewport(mediaQuery.matches);
        updateIsMobile();

        // Graceful fallback for older iOS/Safari matching media queries (Listener vs EventListener)
        if (mediaQuery.addEventListener) {
            mediaQuery.addEventListener('change', updateIsMobile);
            return () => mediaQuery.removeEventListener('change', updateIsMobile);
        }

        mediaQuery.addListener(updateIsMobile);
        return () => mediaQuery.removeListener(updateIsMobile);
    }, []);

    const toggleChatAutoOpen = () => {
        setChatAutoOpenEnabled((prev) => {
            const next = !prev;
            try {
                localStorage.setItem(CHAT_AUTO_OPEN_PREF_KEY, String(next));
            } catch {
                // Ignore storage failures
            }
            return next;
        });
    };

    const toggleMobileNavCompact = () => {
        setMobileNavCompactEnabled((prev) => {
            const next = !prev;
            try {
                localStorage.setItem(MOBILE_NAV_COMPACT_PREF_KEY, String(next));
                window.dispatchEvent(new CustomEvent('rg:mobile-nav-compact-changed', {
                    detail: { enabled: next }
                }));
            } catch {
                // Ignore storage failures
            }
            return next;
        });
    };

    return {
        chatAutoOpenEnabled,
        toggleChatAutoOpen,
        mobileNavCompactEnabled,
        toggleMobileNavCompact,
        isMobileViewport
    };
};
