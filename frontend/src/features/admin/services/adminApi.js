import { apiCall, API_URL, getAuthToken } from '@/services/apiClient';

export const getSystemStats = async () => {
    const data = await apiCall('/admin/stats', {
        method: 'GET',
    });
    return data;
};

/**
 * Get all users (admin only)
 * @param {string} searchQuery - Optional search filter
 */

export const getUsers = async (searchQuery = '') => {
    const params = searchQuery ? `?search=${encodeURIComponent(searchQuery)}` : '';
    const data = await apiCall(`/admin/users${params}`, {
        method: 'GET',
    });
    return data;
};

/**
 * Disable a user (admin only)
 * @param {string} username - User's Cognito username/sub
 * @param {string} reason - Reason for disabling
 */

export const disableUser = async (username, reason = 'Policy violation') => {
    const data = await apiCall('/admin/users/disable', {
        method: 'POST',
        body: JSON.stringify({ username, reason }),
    });
    return data;
};

/**
 * Enable a user (admin only)
 * @param {string} username - User's Cognito username/sub
 */

export const enableUser = async (username) => {
    const data = await apiCall('/admin/users/enable', {
        method: 'POST',
        body: JSON.stringify({ username }),
    });
    return data;
};

/**
 * Delete all contracts for the current user
 * Used when a user deletes their account
 * @param {string} userId - The user's ID
 */

export const deleteAllUserContracts = async (userId) => {
    try {
        // Get all user's contracts first
        const contracts = await getContracts(userId);

        // Delete each contract
        const deletePromises = contracts.map(contract =>
            deleteContract(contract.contractId, userId)
        );

        await Promise.all(deletePromises);
        return { success: true, count: contracts.length };
    } catch (error) {
        console.error('Error deleting user contracts:', error);
        return { success: false, error: error.message };
    }
};

/**
 * Delete a user permanently (admin only)
 * WARNING: This action cannot be undone!
 * @param {string} username - User's Cognito username/sub
 */

export const deleteUser = async (username) => {
    const data = await apiCall(`/admin/users/delete?username=${encodeURIComponent(username)}`, {
        method: 'DELETE',
    });
    return data;
};

/**
 * Check if a user exists in Cognito and their verification status
 * @param {string} email - The email to check
 * @returns {status: 'EXISTS' | 'NEEDS_VERIFICATION' | 'USER_NOT_FOUND'}
 */
