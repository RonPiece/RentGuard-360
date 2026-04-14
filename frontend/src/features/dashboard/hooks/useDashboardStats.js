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
            const highRiskContracts = analyzedContracts.filter(c => {
                const score = c.riskScore ?? c.risk_score ?? 100;
                return score <= 50;
            });

            setStats({
                total: contractsList.length,
                analyzed: analyzedContracts.length,
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
