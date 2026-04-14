/** useCheckout - handles the Stripe checkout flow: validates plan, creates checkout session, redirects to Stripe. */
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

                if (packageData.price <= 0) {
                    const result = await createPaymentIntent(userId, parseInt(packageId), userEmail, userName);
                    if (isCancelled) return;
                    if (result.isFree) {
                        await refreshSubscription();
                        navigate('/payment-success', {
                            state: { packageName: packageData.name, isFree: true }
                        });
                        return;
                    }
                }

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
        try {
            await confirmPayment(paymentIntent.id);
        } catch (err) {
            console.error('Confirmation fallback error:', err);
        }

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
