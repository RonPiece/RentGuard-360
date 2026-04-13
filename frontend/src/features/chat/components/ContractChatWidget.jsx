/**
 * ============================================
 *  ContractChatWidget
 *  Floating AI Chat Assistant for Contracts
 * ============================================
 * 
 * STRUCTURE:
 * - Floating launcher button
 * - Main chat panel (Header, Messages, Input)
 * - Contract selector
 * - Quick prompts
 * 
 * DEPENDENCIES:
 * - useContractChat hook
 * - ChatMessage, ChatHeader, ChatInputForm, ChatContractSelector, ChatClearConfirmDialog, ChatPendingMessage, ChatQuickPrompts
 * ============================================
 */
import React from 'react';
import { MessageCircle, X } from 'lucide-react';
import ChatMessage from './ChatMessage';
import ChatHeader from './ChatHeader';
import ChatInputForm from './ChatInputForm';
import ChatContractSelector from './ChatContractSelector';
import ChatPendingMessage from './ChatPendingMessage';
import ChatQuickPrompts from './ChatQuickPrompts';
import ChatClearConfirmDialog from './ChatClearConfirmDialog';
import ChatHintBanner from './ChatHintBanner';
import ChatErrorBanner from './ChatErrorBanner';
import { useChatWidget } from '@/features/chat/hooks/useChatWidget';
import './ContractChatWidget.css';

const ContractChatWidget = () => {
    const {
        isAuthenticated,
        t,
        isRTL,
        locale,
        userInitial,
        userLabel,
        
        open,
        isClosing,
        showPanel,
        openPanel,
        closePanel,
        widgetRef,
        footerOffset,
        useWhyPalette,

        contracts,
        loadingContracts,
        selectedContractId,
        selectedContractLabel,
        handleContractSelect,
        isContractMenuOpen,
        setIsContractMenuOpen,

        messages,
        isHistoryLoading,
        messagesContainerRef,

        question,
        setQuestion,
        isAsking,
        inputRef,
        onSubmit,
        onInputKeyDown,

        errorKey,
        responseHintKey,
        setResponseHintKey,
        rateLimitSecondsLeft,

        quickPrompts,
        selectQuickPrompt,

        isClearConfirmOpen,
        setIsClearConfirmOpen,
        clearHistory,
        confirmClearHistory,

        copiedMessageKey,
        copyMessageText,
        scrollMessagesToBottom
    } = useChatWidget();

    React.useEffect(() => {
        if (!open) return;
        const rafId = window.requestAnimationFrame(() => {
            scrollMessagesToBottom('auto');
        });
        return () => window.cancelAnimationFrame(rafId);
    }, [open, selectedContractId, isHistoryLoading, scrollMessagesToBottom]);

    React.useEffect(() => {
        if (!open) return;
        const rafId = window.requestAnimationFrame(() => {
            scrollMessagesToBottom('smooth');
        });
        return () => window.cancelAnimationFrame(rafId);
    }, [open, messages.length, isAsking, scrollMessagesToBottom]);

    if (!isAuthenticated) return null;

    return (
        <div
            className={`chat-widget ${open ? 'open' : ''} ${showPanel ? 'panel-visible' : ''} ${isClosing ? 'closing' : ''} ${useWhyPalette ? 'context-why' : ''}`}
            dir={isRTL ? 'rtl' : 'ltr'}
            style={{ '--chat-offset-bottom': `${footerOffset}px` }}
            ref={widgetRef}
        >
            {showPanel && (
                <section className={`chat-widget-panel ${isClosing ? 'closing' : ''}`} aria-label={t('chat.title')}>
                    <ChatHeader t={t} closePanel={closePanel} />

                    <ChatContractSelector 
                        t={t}
                        contracts={contracts}
                        loadingContracts={loadingContracts}
                        selectedContractId={selectedContractId}
                        selectedContractLabel={selectedContractLabel}
                        handleContractSelect={handleContractSelect}
                        isContractMenuOpen={isContractMenuOpen}
                        setIsContractMenuOpen={setIsContractMenuOpen}
                        clearHistory={clearHistory}
                        isAsking={isAsking}
                        isHistoryLoading={isHistoryLoading}
                        messagesCount={messages.length}
                    />

                    <div className="chat-widget-messages" role="log" aria-live="polite" ref={messagesContainerRef}>
                        {selectedContractId && isHistoryLoading && (
                            <div className="chat-widget-empty">
                            </div>
                        )}

                        {!selectedContractId && (
                            <div className="chat-widget-empty">{t('chat.emptySelectContract')}</div>
                        )}

                        {selectedContractId && !isHistoryLoading && messages.length === 0 && (
                            <div className="chat-widget-empty">{t('chat.emptyStart')}</div>
                        )}

                        {selectedContractId && !isHistoryLoading && messages.length === 0 && (
                            <ChatQuickPrompts 
                                t={t} 
                                quickPrompts={quickPrompts} 
                                selectQuickPrompt={selectQuickPrompt} 
                            />
                        )}

{messages.map((msg) => (
                              <ChatMessage
                                  key={`${msg.ts}-${msg.role}`}
                                  msg={msg}
                                  isRTL={isRTL}
                                  t={t}
                                  userInitial={userInitial}
                                  userLabel={userLabel}
                                  copyMessageText={copyMessageText}
                                  copiedMessageKey={copiedMessageKey}
                                  locale={locale}
                              />
                          ))}

                        {isAsking && <ChatPendingMessage t={t} />}
                    </div>

                    <ChatHintBanner 
                        t={t}
                        responseHintKey={responseHintKey}
                        rateLimitSecondsLeft={rateLimitSecondsLeft}
                        setResponseHintKey={setResponseHintKey}
                    />

                    <ChatErrorBanner 
                        t={t}
                        errorKey={errorKey}
                    />

                    <ChatInputForm 
                        t={t}
                        question={question}
                        setQuestion={setQuestion}
                        onSubmit={onSubmit}
                        onInputKeyDown={onInputKeyDown}
                        inputRef={inputRef}
                        isAsking={isAsking}
                        isDisabled={isAsking || Boolean(errorKey) || rateLimitSecondsLeft > 0}
                    />

                    {isClearConfirmOpen && (
                        <ChatClearConfirmDialog 
                            t={t}
                            confirmClearHistory={confirmClearHistory}
                            setIsClearConfirmOpen={setIsClearConfirmOpen}
                        />
                    )}
                </section>
            )}

            {!showPanel && (
                <button
                    type="button"
                    className="chat-widget-launcher"
                    onClick={openPanel}
                    aria-label={t('chat.open')}
                >
                    <MessageCircle size={20} />
                    <span>{t('chat.title')}</span>
                </button>
            )}
        </div>
    );
};

export default ContractChatWidget;
