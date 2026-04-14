/**
 * Domain hook managing the contract context picker within the Floating Chat Widget.
 * Orchestrates fetching the user's available contracts, mapping their active selection, 
 * and auto-selecting the relevant context if a user initiates chat while actively 
 * viewing a specific Analysis Page route.
 * 
 * @param {boolean} isAuthenticated Is the user active?
 * @param {boolean} open Is the chat widget visually open?
 * @param {Object} user Cognito user details.
 * @param {Function} t Translation handler.
 * @param {string|null} routeContractId Passed URL param of the active page.
 * @param {Function} setErrorKey Mutation callback.
 * @returns {Object} State bindings for the chat contract selection menu.
 */
import { useState, useEffect, useMemo } from 'react';
import { trackChatEvent } from '../utils/chatHelpers';
import { useFetchContracts } from './useFetchContracts';

export function useChatContracts(isAuthenticated, open, user, t, routeContractId, setErrorKey) {
    const { contracts, loadingContracts } = useFetchContracts(isAuthenticated, open, user, setErrorKey);
    const [selectedContractId, setSelectedContractId] = useState('');
    const [isContractMenuOpen, setIsContractMenuOpen] = useState(false);

    const selectedContractLabel = useMemo(() => {
        if (loadingContracts) return t('chat.loadingContracts');
        if (!selectedContractId) return t('chat.selectContract');

        const selected = contracts.find((contract) => contract.contractId === selectedContractId);
        return selected?.fileName || selected?.contractId || t('chat.selectContract');
    }, [contracts, loadingContracts, selectedContractId, t]);



    useEffect(() => {
        if (!open && isContractMenuOpen) {
            setIsContractMenuOpen(false);
        }
    }, [open, isContractMenuOpen]);

    useEffect(() => {
        if (!open || !routeContractId) return;
        // Automatically match and select the contract if the user navigated directly from its URL        const exists = contracts.some((c) => c.contractId === routeContractId);
        if (exists) {
            setSelectedContractId(routeContractId);
            trackChatEvent('chat_contract_auto_selected', { contractId: routeContractId });
        }
    }, [open, routeContractId, contracts]);

    const handleContractSelect = (nextContractId) => {
        setSelectedContractId(nextContractId);
        setErrorKey('');
        setIsContractMenuOpen(false);
        trackChatEvent('chat_contract_selected', { contractId: nextContractId || null });
    };

    return {
        contracts,
        loadingContracts,
        selectedContractId,
        selectedContractLabel,
        handleContractSelect,
        isContractMenuOpen,
        setIsContractMenuOpen
    };
}
