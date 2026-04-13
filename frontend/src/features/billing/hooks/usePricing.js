import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getPackages } from '@/features/billing/services/stripeApi';
import { useSubscription } from '@/contexts/SubscriptionContext';

const FALLBACK_PACKAGES = [
    { id: 'free', name: 'Free', price: 0, scanLimit: 1 },
    { id: 'single', name: 'Single', price: 10, scanLimit: 1 },
    { id: 'basic', name: 'Basic', price: 39, scanLimit: 5 },
    { id: 'pro', name: 'Pro', price: 79, scanLimit: 15 },
];

export const usePricing = () => {
    const { subscription, packageName: currentPlan, hasSubscription } = useSubscription();
    const navigate = useNavigate();

    const [packages, setPackages] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    
    const currentPackageId = Number(subscription?.packageId ?? subscription?.PackageId ?? 0);

    useEffect(() => {
        let isMounted = true;

        const fetchPackages = async () => {
            try {
                if (isMounted) setIsLoading(true);

                const timeoutPromise = new Promise((_, reject) => {
                    window.setTimeout(() => reject(new Error('Packages request timeout')), 12000);
                });

                const data = await Promise.race([getPackages(), timeoutPromise]);
                if (isMounted) {
                    setPackages(data);
                }
            } catch (err) {
                console.warn('Using fallback packages (backend unavailable):', err.message);
                if (isMounted) {
                    setPackages(FALLBACK_PACKAGES);
                }
            } finally {
                if (isMounted) setIsLoading(false);
            }
        };

        fetchPackages();

        return () => {
            isMounted = false;
        };
    }, []);

    const handleSelectPackage = (pkg) => {
        navigate(`/checkout/${pkg.id}`);
    };

    return {
        packages,
        isLoading,
        error,
        currentPlan,
        hasSubscription,
        currentPackageId,
        handleSelectPackage,
        subscription
    };
};
