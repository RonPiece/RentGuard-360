/**
 * Central API Client — all backend HTTP calls go through this file.
 * - apiCall(): For authenticated requests (attaches Cognito JWT token).
 * - publicApiCall(): For unauthenticated requests (uses API key if needed).
 * - sendContactMessage(): Shared contact form handler (works for both guest and logged-in users).
 * In local dev, requests are proxied via Vite to avoid CORS issues.
 */
import { fetchAuthSession } from 'aws-amplify/auth';

// Base API URL from environment (set via CloudFormation stack output)
export const API_URL = import.meta.env.VITE_API_ENDPOINT;
// API key used exclusively for public endpoints (e.g. check-user)
const CHECK_USER_API_KEY = import.meta.env.VITE_CHECK_USER_API_KEY;
const IS_LOCAL_DEV = Boolean(import.meta.env.DEV);
// In local dev, Vite proxies requests through /__rg_api__ to bypass CORS
const EFFECTIVE_API_BASE_URL = IS_LOCAL_DEV ? '/__rg_api__' : API_URL;

if (!API_URL) {
    throw new Error('Missing VITE_API_ENDPOINT. Set it from the CloudFormation stack Output ApiUrl.');
}

// Fetches the current Cognito ID token from the active session
const getAuthToken = async () => {
    try {
        const session = await fetchAuthSession();
        const token = session.tokens?.idToken?.toString();
        if (!token) throw new Error('No auth token available');
        return token;
    } catch (error) {
        console.error('Failed to get auth token:', error);
        throw new Error('Authentication required');
    }
};

// Authenticated API call — automatically attaches JWT and handles timeouts / error parsing
export const apiCall = async (endpoint, options = {}) => {
    const token = await getAuthToken();
    const url = `${EFFECTIVE_API_BASE_URL}${endpoint}`;
    console.log(`API Call: ${url}`);

    const method = String(options.method || 'GET').toUpperCase();
    const defaultHeaders = { 'Authorization': token };
    // Apply default content-type for mutations (POST, PUT, DELETE, PATCH, etc.)
    if (method !== 'GET' && method !== 'HEAD') {
        defaultHeaders['Content-Type'] = 'application/json';
    }

    // AbortController enforces a maximum request lifetime (default 2 minutes to accommodate long analysis processing)
    const controller = new AbortController();
    const timeoutValue = options.timeout || 120000;
    const timeoutId = setTimeout(() => controller.abort(), timeoutValue);

    try {
        // Spread syntax (...) overrides default options/headers with any custom ones provided
        const response = await fetch(url, {
            ...options,
            signal: controller.signal,
            headers: { ...defaultHeaders, ...options.headers },
        });

        clearTimeout(timeoutId);

        // Guard: if API Gateway returns HTML it usually means a misconfigured endpoint
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('text/html')) {
            console.error('Received HTML instead of JSON');
            throw new Error('API configuration error');
        }

        if (!response.ok) {
            const errorText = await response.text();
            if (!(response.status == 404 && options.silent404)) {
                console.error(`API Error ${response.status}:`, errorText);
            }
            let serverMessage = '';
            try {
                const parsed = JSON.parse(errorText);
                serverMessage = parsed?.error || parsed?.message || '';
            } catch {
                serverMessage = errorText;
            }
            const error = new Error(serverMessage || `API Error: ${response.status}`);
            error.status = response.status;
            throw error;
        }

        const text = await response.text();
        if (!text) return { items: [] };

        try {
            return JSON.parse(text);
        } catch {
            console.error('Failed to parse JSON:', text.substring(0, 100));
            throw new Error('Invalid response from server');
        }
    } catch (error) {
        clearTimeout(timeoutId);
        if (error.name == 'AbortError') {
            throw new Error('Request failed - timeout. Please try again.');
        }
        throw error;
    }
};

// Public API call — no auth token required, uses API key for rate-limited public endpoints
export const publicApiCall = async (endpoint, options = {}, config = {}) => {
    const { requireApiKey = true } = config;
    const url = `${EFFECTIVE_API_BASE_URL}${endpoint}`;
    const method = (options.method || 'GET').toUpperCase();
    const baseHeaders = {};

    if (requireApiKey && CHECK_USER_API_KEY) {
        baseHeaders['X-Api-Key'] = CHECK_USER_API_KEY;
    }

    if (method !== 'GET') {
        baseHeaders['Content-Type'] = 'application/json';
    }
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    try {
        const response = await fetch(url, {
            ...options,
            signal: controller.signal,
            headers: { ...baseHeaders, ...options.headers },
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
            const errorText = await response.text();
            console.error(`Public API Error ${response.status}:`, errorText);
            throw new Error(`API Error: ${response.status}`);
        }

        const text = await response.text();
        return text ? JSON.parse(text) : {};
    } catch (error) {
        clearTimeout(timeoutId);
        throw error;
    }
};

// Sends a contact/support message — routes to public or authenticated endpoint based on user state
export const sendContactMessage = async (formData, options = {}) => {
    const { isPublic = false } = options;
    const ticketData = {
        user_email: formData.email,
        category: formData.subject || 'General',
        message: formData.message,
        contract_id: formData.contractId || 'N/A'
    };

    const endpoint = isPublic ? '/public/contact' : '/contact';
    const request = {
        method: 'POST',
        body: JSON.stringify(ticketData),
    };

    return isPublic
        ? await publicApiCall(endpoint, request, { requireApiKey: false })
        : await apiCall(endpoint, request);
};

