/** Dismissible error banner displayed at the top of the chat when an API call fails. */
import React from 'react';

export default function ChatErrorBanner({ t, errorKey }) {
    if (!errorKey) return null;

    return <p className="chat-widget-error">{t(`chat.errors.${errorKey}`)}</p>;
}
