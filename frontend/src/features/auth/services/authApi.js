/**
 * Auth API — pre-registration check. Calls the public /auth/check-user endpoint
 * to determine if an email is already registered, needs verification, or is social-only.
 * Falls back to USER_NOT_FOUND on network errors so registration can still be attempted.
 */
import { publicApiCall } from '@/services/apiClient';

export const checkUserStatus = async (email) => {
    try {
        // Calls the unauthenticated API endpoint to query Cognito user existence before real sign-up
        const data = await publicApiCall(`/auth/check-user?email=${encodeURIComponent(email)}`);
        return data;
    } catch (error) {
        console.error('checkUserStatus error:', error);
        // Resiliency Fallback: if the custom check fails, assume it's free to register; Cognito will reject it directly if it truly exists
        return { status: 'USER_NOT_FOUND' };
    }
};
