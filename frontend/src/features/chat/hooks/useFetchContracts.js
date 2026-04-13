import { useState, useEffect } from 'react';
import { getContracts } from '@/features/contracts/services/contractsApi';
import { trackChatEvent } from '../utils/chatHelpers';

export function useFetchContracts(isAuthenticated, open, user, setErrorKey) {
    const [loadingContracts, setLoadingContracts] = useState(false);
    const [contracts, setContracts] = useState([]);

    useEffect(() => {
        if (!isAuthenticated || !open) return;

        const loadContracts = async () => {
            setLoadingContracts(true);
            setErrorKey('');
            try {
                const userId = user?.userId || user?.username || '';
                const data = await getContracts(userId);
                setContracts(Array.isArray(data) ? data : []);
            } catch {
                setContracts([]);
                setErrorKey('loadContracts');
                trackChatEvent('chat_contracts_load_failed');
            } finally {
                setLoadingContracts(false);
            }
        };

        loadContracts();
    }, [isAuthenticated, open, user?.userId, user?.username, setErrorKey]);

    return { contracts, loadingContracts };
}
