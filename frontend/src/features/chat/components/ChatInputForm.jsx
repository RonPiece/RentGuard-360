/**
 * ============================================
 *  ChatInputForm Component
 *  Input area for the Contract AI Chat Widget
 * ============================================
 * 
 * STRUCTURE:
 * - Textarea for user input (auto-resize)
 * - Submit button
 * 
 * DEPENDENCIES:
 * - None
 * ============================================
 */
import React from 'react';
import { Send } from 'lucide-react';
import './ChatInputForm.css';

const ChatInputForm = ({
    t,
    question,
    setQuestion,
    onSubmit,
    onInputKeyDown,
    inputRef,
    isAsking,
    hasBlockingError,
    rateLimitSecondsLeft
}) => {
    const isInputDisabled = isAsking || hasBlockingError || rateLimitSecondsLeft > 0;

    return (
        <form onSubmit={onSubmit} className="chat-widget-input-row">
            <textarea
                ref={inputRef}
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                onKeyDown={onInputKeyDown}
                placeholder={t('chat.inputPlaceholder')}
                maxLength={1200}
                disabled={isInputDisabled}
                rows={1}
                dir="auto"
            />
            <button type="submit" disabled={isInputDisabled || !question.trim()} aria-label={t('chat.send')}>
                <Send size={16} />
            </button>
        </form>
    );
};

export default ChatInputForm;
