/**
 * ============================================
 *  useAdminAnalytics Hook
 *  Fetches and formats system statistical data
 * ============================================
 * 
 * STRUCTURE:
 * - fetchStats: Gets data from API
 * - pieData, commonIssues, avgRiskScore: Formatted data
 * 
 * DEPENDENCIES:
 * - getSystemStats API
 * - statsUtils (Caching)
 * ============================================
 */
import { useState, useEffect, useCallback, useRef } from 'react';
import { getSystemStats } from '@/features/admin/services/adminApi';
import { useLanguage } from '@/contexts/LanguageContext/LanguageContext';
import { getCachedSystemStats, setCachedSystemStats } from '@/features/admin/utils/statsUtils';

/**
 * Custom hook to fetch and manage the administrative analytics metrics.
 * It manages the lifecycle of the data via an API call and formats the raw 
 * statistics into structured payload constants for UI components like pie charts.
 * 
 * @returns {Object} Admin analytics state including chart datasets, top issues, and average risk score.
 */
export const useAdminAnalytics = () => {
    const { t } = useLanguage();
    // ------------------------------------------------------------------------
    // STATE MANAGEMENT: Core statistics from the backend system
    // ------------------------------------------------------------------------
    const [stats, setStats] = useState(() => getCachedSystemStats());
    const [loading, setLoading] = useState(() => !getCachedSystemStats());
    const [error, setError] = useState(null);
    const initialHasCacheRef = useRef(Boolean(getCachedSystemStats()));

    // ------------------------------------------------------------------------
    // DATA FETCHING: Retrieves all aggregated metrics needed for Admin Dashboard
    // ------------------------------------------------------------------------
    const fetchStats = useCallback(async (silent = false) => {
        if (!silent) {
            setLoading(true);
        }
        setError(null);
        try {
            const data = await getSystemStats();
            setStats(data);
            setCachedSystemStats(data);
        } catch (err) {
            setError(err.message || t('common.error'));
        } finally {
            setLoading(false);
        }
    }, [t]);

    useEffect(() => {
        fetchStats(initialHasCacheRef.current);
    }, [fetchStats]);

    // ------------------------------------------------------------------------
    // METRICS PROCESSING:
    // Secure defaults and transformations applied to pure API data before rendering
    // ------------------------------------------------------------------------
    const riskDistribution = stats?.riskDistribution || {
        lowRisk: 0,
        lowMediumRisk: 0,
        mediumRisk: 0,
        highRisk: 0
    };

    // Calculate risk distributions (without colors - pure data)
    const pieData = [
        { id: 0, value: riskDistribution.lowRisk, label: t('score.lowRisk') || 'Low Risk', state: 'lowRisk' },
        { id: 1, value: riskDistribution.lowMediumRisk, label: t('score.lowMediumRisk') || 'Low-Medium', state: 'lowMediumRisk' },
        { id: 2, value: riskDistribution.mediumRisk, label: t('score.mediumRisk') || 'Medium Risk', state: 'mediumRisk' },
        { id: 3, value: riskDistribution.highRisk, label: t('score.highRisk') || 'High Risk', state: 'highRisk' },
    ];

    const commonIssues = stats?.commonIssues || [];

    const rawScore = stats?.analysis?.avgRiskScore || 60;
    const avgRiskScore = typeof rawScore === 'number' ? rawScore : parseInt(rawScore, 10);

    return {
        stats,
        loading,
        error,
        fetchStats,
        pieData,
        commonIssues,
        avgRiskScore
    };
};
