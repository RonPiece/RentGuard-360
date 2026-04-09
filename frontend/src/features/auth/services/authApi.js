import { apiCall, API_URL, getAuthToken } from '@/services/apiClient';

export const checkUserStatus = async (email) => {
    try {
        const data = await publicApiCall(`/auth/check-user?email=${encodeURIComponent(email)}`);
        return data;
    } catch (error) {
        console.error('checkUserStatus error:', error);
        // Fallback to allowing registration try if check fails
        return { status: 'USER_NOT_FOUND' };
    }
};

/**
 * Ask a contract-grounded question for a selected contract
 * @param {string} contractId - The selected contract ID
 * @param {string} question - User question
 * @returns {{answer: string, meta: object}}
 */
