/**
 * Hook managing the logic for the Stripe Checkout pipeline.
 * Fetches the user's selected package, handles logic bypasses for entirely free packages, 
 * requests PaymentIntent `clientSecret` payloads from the backend to mount the Stripe Elements UI, 
 * and forces post-success entitlement syncing before redirecting to success views.
 * 
 * @param {string|number} packageId The ID of the subscription package being purchased.
 * @returns {Object} Pre-fetched package data, Stripe intent credentials, and completion callbacks.
 */
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext/LanguageContext';
import { useSubscription } from '@/contexts/SubscriptionContext';
import { getPackageById, createPaymentIntent, confirmPayment } from '@/features/billing/services/stripeApi';
import { calculateDisplayPrice } from '@/utils/formatUtils';

export const useCheckout = (packageId) => {
    const navigate = useNavigate();
    const { isRTL } = useLanguage();
    const { user, userAttributes } = useAuth();
    const { refreshSubscription } = useSubscription();

    const [pkg, setPkg] = useState(null);
    const [clientSecret, setClientSecret] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    const userId = userAttributes?.sub || user?.userId || user?.sub || user?.username;
    const userEmail = userAttributes?.email;
    const userName = userAttributes?.name;

    const { displayPrice, displayCurrency } = calculateDisplayPrice(pkg?.price, isRTL);

    useEffect(() => {
        let isCancelled = false;

        const initCheckout = async () => {
            try {
                setIsLoading(true);

                const packageData = await getPackageById(packageId);
                if (isCancelled) return;
                setPkg(packageData);

                // Handle entirely free packages without creating standard Stripe intents
                if (packageData.price <= 0) {
                    const result = await createPaymentIntent(userId, parseInt(packageId), userEmail, userName);
                    if (isCancelled) return;
                    if (result.isFree) {
                        // Immediately update local entitlements context and send user to success dashboard
                        await refreshSubscription();
                        navigate('/payment-success', {
                            state: { packageName: packageData.name, isFree: true }
                        });
                        return;
                    }
                }

                // If not free, request a real Stripe Intent Client Secret to load the Elements UI
                const intentData = await createPaymentIntent(userId, parseInt(packageId), userEmail, userName);
                if (isCancelled) return;
                setClientSecret(intentData.clientSecret);
            } catch (err) {
                if (isCancelled) return;
                console.error('Checkout init error:', err);
                setError(err.message);
            } finally {
                if (!isCancelled) setIsLoading(false);
            }
        };

        if (userId && packageId && userEmail && userName) {
            initCheckout();
        }
        
        return () => {
            isCancelled = true;
        };
    }, [userId, packageId, userEmail, userName, navigate, refreshSubscription]);

    const handlePaymentSuccess = async (paymentIntent) => {
        setIsLoading(true);
        window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
        try {
            // Tell our backend to verify the Stripe intent and grant the purchased scans
            await confirmPayment(paymentIntent.id);
        } catch (err) {
            console.error('Confirmation fallback error:', err);
        }

        // Force a refresh of the user's scan balance/entitlements from the server
        await refreshSubscription();

        setIsLoading(false);
        navigate('/payment-success', {
            state: {
                packageName: pkg?.name,
                amount: displayPrice,
                currency: displayCurrency,
                isFree: false,
            }
        });
    };

    const handleBackToPricing = () => {
        navigate('/pricing');
    }

    return {
        pkg,
        clientSecret,
        isLoading,
        error,
        displayPrice,
        displayCurrency,
        handlePaymentSuccess,
        handleBackToPricing
    };
};
