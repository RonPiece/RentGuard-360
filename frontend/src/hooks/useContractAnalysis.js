import { useState, useEffect, useCallback } from 'react';
import { getAnalysis } from '../services/api';

export const useContractAnalysis = (contractId) => {
    const [analysis, setAnalysis] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [pollCount, setPollCount] = useState(0);
    const MAX_POLLS = 10;
    const POLL_INTERVAL = 3000;

    const fetchAnalysis = useCallback(async () => {
        if (!contractId) return;

        try {
            const data = await getAnalysis(contractId);
            setAnalysis(data);
            setIsLoading(false);
            if (data.status !== 'PROCESSING') {
                setError(null);
            }
            return data;
        } catch (err) {
            console.error('Error fetching analysis:', err);
            
            // Polling logic for when analysis is still generating (404 initially)
            if (err.message && err.message.includes('404')) {
                if (pollCount < MAX_POLLS) {
                    setTimeout(() => {
                        setPollCount(prev => prev + 1);
                    }, POLL_INTERVAL);
                } else {
                    setError('Analysis not found after multiple attempts. Return to dashboard and try again.');
                    setIsLoading(false);
                }
            } else {
                setError(err.message || 'Failed to fetch analysis details.');
                setIsLoading(false);
            }
        }
    }, [contractId, pollCount]);

    useEffect(() => {
        fetchAnalysis();
    }, [fetchAnalysis, pollCount]);

    return { analysis, isLoading, error, fetchAnalysis, setAnalysis };
};
