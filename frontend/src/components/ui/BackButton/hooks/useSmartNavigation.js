/** Smart back navigation - uses browser history if available, otherwise navigates to a fallback route. */
import { useNavigate } from 'react-router-dom';

/**
 * Hook to handle smart backward navigation
 * Uses browser history if available, otherwise goes to a fallback route
 */
export function useSmartNavigation() {
    const navigate = useNavigate();

    const navigateBack = (fallback = '/') => {
        if (window.history.length > 2 || (window.history.state && window.history.state.idx > 0)) {
            navigate(-1);
        } else {
            navigate(fallback);
        }
    };

    return { navigateBack };
}
