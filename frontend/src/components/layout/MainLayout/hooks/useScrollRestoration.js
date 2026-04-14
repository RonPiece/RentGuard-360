/** Scrolls to top on every route change to prevent stale scroll positions. */
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export const useScrollRestoration = () => {
    const location = useLocation();

    // Scroll restoration: Ensure new page loads start at the top
    useEffect(() => {
        // Use requestAnimationFrame to ensure the scroll happens exactly
        // after the new DOM layout is computed, which is the most reliable way for React SPAs
        const scrollId = requestAnimationFrame(() => {
            window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
            document.documentElement.scrollTop = 0;
            document.body.scrollTop = 0;
        });

        return () => cancelAnimationFrame(scrollId);
    }, [location.pathname]);
};
