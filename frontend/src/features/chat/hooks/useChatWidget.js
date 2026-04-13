/**
 * ============================================
 * useChatWidget Hook
 * Composer Hook for AI Contract Assistant Chat
 * ============================================
 * * STRUCTURE:
 * This is the master composer hook. It delegates logic to:
 * - useChatUI: visual states, opening/closing, clipboard
 * - useChatContracts: fetching and managing the contract list
 * - useChatMessages: fetching history and managing the conversation
 * ============================================
 */
import { useMemo, useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext/LanguageContext';
import { isContractChatAutoOpenEnabled, getAnalysisContractIdFromPath, getUserDisplayLabel, getUserInitial } from '../utils/chatHelpers';
import { useChatUI } from './useChatUI';
import { useChatContracts } from './useChatContracts';
import { useChatMessages } from './useChatMessages';

export function useChatWidget() {
    const { isAuthenticated, user, userAttributes } = useAuth();
    const { t, isRTL, language } = useLanguage();
    const location = useLocation();

    // Shared state between sub-hooks
    const [errorKey, setErrorKey] = useState('');
    const [responseHintKey, setResponseHintKey] = useState('');

    const routeContractId = useMemo(() => getAnalysisContractIdFromPath(location.pathname), [location.pathname]);
    const lastAutoOpenedPathRef = useRef('');

    // 1. UI Logic
    const ui = useChatUI(location.pathname);

    // Auto open logic
    useEffect(() => {
        if (!isAuthenticated || !routeContractId || !isContractChatAutoOpenEnabled()) return;
        const currentPath = location.pathname;
        if (lastAutoOpenedPathRef.current === currentPath) return;

        ui.setOpen(true);
        lastAutoOpenedPathRef.current = currentPath;
    }, [isAuthenticated, routeContractId, location.pathname, ui.setOpen]);

    // 2. Contracts Logic
    const contractsState = useChatContracts(
        isAuthenticated, 
        ui.open, 
        user, 
        t, 
        routeContractId, 
        setErrorKey
    );

    // 3. Messages Logic
    const messagesState = useChatMessages(
        contractsState.selectedContractId,
        ui.open,
        t,
        errorKey,
        setErrorKey,
        responseHintKey,
        setResponseHintKey
    );

    // Prepare User Info
    const userLabel = useMemo(() => getUserDisplayLabel(userAttributes, user, t), [userAttributes, user, t]);
    const userInitial = getUserInitial(userLabel);
    const locale = language === 'he' ? 'he-IL' : 'en-US';

    return {
        isAuthenticated,
        t,
        isRTL,
        locale,
        userInitial,
        userLabel,
        errorKey,
        setErrorKey,
        responseHintKey,
        setResponseHintKey,
        ...ui,
        ...contractsState,
        ...messagesState
    };
}