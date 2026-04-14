/** Pre-defined quick prompt buttons (e.g. Summarize, Find risks) shown at the start of a chat session. */
import React from 'react';
import './ChatQuickPrompts.css';

const ChatQuickPrompts = ({ t, quickPrompts, selectQuickPrompt }) => {
    return (
        <div className="chat-widget-quick-prompts" aria-label={t('chat.quickPromptsLabel')}>
            {quickPrompts.map((promptText) => (
                <button
                    key={promptText}
                    type="button"
                    className="chat-widget-prompt-chip"
                    onClick={() => selectQuickPrompt(promptText)}
                >
                    {promptText}
                </button>
            ))}
        </div>
    );
};

export default ChatQuickPrompts;
