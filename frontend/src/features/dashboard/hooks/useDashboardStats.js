/**
 * Lightweight data-aggregation hook for the user landing dashboard.
 * Iterates through the raw contracts matrix to compute live counters (total uploads, 
 * pending processing queues, and high-risk threshold matches).
 * 
 * @param {Object} user Cognito authenticated user profile.
 * @returns {Object} Numeric aggregates mapping directly to Dashboard Scorecards.
 */
import { useState, useCallback, useEffect } from 'react';
import { getContracts } from '@/features/contracts/services/contractsApi';

export const useDashboardStats = (user) => {
    const [stats, setStats] = useState({
        total: 0,
        analyzed: 0,
        pending: 0,
        highRisk: 0,
    });
    const [isLoading, setIsLoading] = useState(true);

    const fetchStats = useCallback(async () => {
        try {
            const userId = user?.userId || user?.username;
            if (!userId) {
                setIsLoading(false);
                return;
            }

            const contracts = await getContracts(userId);
            const contractsList = Array.isArray(contracts) ? contracts : [];

            const analyzedContracts = contractsList.filter(c => c.status === 'analyzed');
            // High risk means specifically low score (0-50). Handles both DB camelCase and snake_case schema variations.
            const highRiskContracts = analyzedContracts.filter(c => {
                const score = c.riskScore ?? c.risk_score ?? 100;
                return score <= 50;
            });

            setStats({
                total: contractsList.length,
                analyzed: analyzedContracts.length,
                // Count any contract that hasn't finished analysis nor permanently failed
                pending: contractsList.filter(c => c.status !== 'analyzed' && c.status !== 'failed' && c.status !== 'error').length,
                highRisk: highRiskContracts.length,
            });
        } catch (err) {
            console.error('Failed to fetch stats:', err);
        } finally {
            setIsLoading(false);
        }
    }, [user]);

    useEffect(() => {
        fetchStats();
    }, [fetchStats]);

    return { stats, isLoading, refetch: fetchStats };
};
