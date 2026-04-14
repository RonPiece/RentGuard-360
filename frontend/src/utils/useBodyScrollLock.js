import { useEffect } from 'react';

/**
 * Hook to lock body scroll when an overlay (modal, chat, etc.) is open.
 * Important for mobile UX so the page doesn't scroll when scrolling inside the overlay.
 * Handles iOS Safari quirks using fixed positioning to prevent scroll bleeding.
 * 
 * @param {boolean} isLocked - Whether scrolling should be locked
 */
export function useBodyScrollLock(isLocked) {
  useEffect(() => {
    if (!isLocked) return;

    const scrollBarWidth = window.innerWidth - document.documentElement.clientWidth;
    const body = document.body;

    const originalStyle = window.getComputedStyle(body);
    const originalOverflow = originalStyle.overflow;
    const originalPaddingRight = originalStyle.paddingRight;
    const originalPosition = originalStyle.position;
    const originalTop = originalStyle.top;
    const originalWidth = originalStyle.width;
    
    // Log current scroll position so we can restore it later
    const scrollY = window.scrollY;

    // Apply styles to lock scroll
    body.style.overflow = 'hidden';
    body.style.position = 'fixed';
    body.style.top = `-${scrollY}px`;
    body.style.width = '100%';

    // Only add padding if there's actually a scrollbar
    if (scrollBarWidth > 0) {
      body.style.paddingRight = `calc(${originalPaddingRight} + ${scrollBarWidth}px)`;
    }

    return () => {
      // Revert styles
      body.style.overflow = originalOverflow;
      body.style.position = originalPosition;
      body.style.top = originalTop;
      body.style.width = originalWidth;
      body.style.paddingRight = originalPaddingRight;
      
      // Restore scroll position
      window.scrollTo(0, scrollY);
    };
  }, [isLocked]);
}
