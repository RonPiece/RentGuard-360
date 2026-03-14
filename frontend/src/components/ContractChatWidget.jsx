import React, { useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { MessageCircle, X, Send, Loader2, Copy, Check } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { askContractQuestion, clearContractChatHistory, getContractChatHistory, getContracts } from '../services/api';
import './ContractChatWidget.css';

const getAnalysisContractIdFromPath = (pathname) => {
    const match = String(pathname || '').match(/^\/analysis\/([^/?#]+)/);
    if (!match || !match[1]) return null;
    try {
        return decodeURIComponent(match[1]);
    } catch {
        return match[1];
    }
};

const ContractChatWidget = () => {
    const { isAuthenticated, user } = useAuth();
    const { t, isRTL } = useLanguage();
    const location = useLocation();

    const [open, setOpen] = useState(false);
    const [loadingContracts, setLoadingContracts] = useState(false);
    const [contracts, setContracts] = useState([]);
    const [selectedContractId, setSelectedContractId] = useState('');
    const [messages, setMessages] = useState([]);
    const [question, setQuestion] = useState('');
    const [isAsking, setIsAsking] = useState(false);
    const [errorKey, setErrorKey] = useState('');
    const [copiedMessageKey, setCopiedMessageKey] = useState('');

    const routeContractId = useMemo(() => getAnalysisContractIdFromPath(location.pathname), [location.pathname]);

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
            } finally {
                setLoadingContracts(false);
            }
        };

        loadContracts();
    }, [isAuthenticated, open, user?.userId, user?.username]);

    useEffect(() => {
        if (!open) return;
        if (!routeContractId) return;

        const exists = contracts.some((c) => c.contractId === routeContractId);
        if (exists) {
            setSelectedContractId(routeContractId);
        }
    }, [open, routeContractId, contracts]);

    useEffect(() => {
        if (!selectedContractId || !open) {
            setMessages([]);
            return;
        }

        const loadHistory = async () => {
            try {
                const items = await getContractChatHistory(selectedContractId, 30);
                const mapped = [];
                for (const item of items) {
                    if (item.question) {
                        mapped.push({ role: 'user', text: item.question, ts: `${item.messageId || ''}-q` });
                    }
                    if (item.answer) {
                        mapped.push({ role: 'assistant', text: item.answer, ts: `${item.messageId || ''}-a`, meta: item.meta || null });
                    }
                }
                setMessages(mapped);
            } catch {
                setMessages([]);
                setErrorKey('loadHistory');
            }
        };

        loadHistory();
    }, [selectedContractId, open]);

    if (!isAuthenticated) return null;

    const sendQuestion = async () => {
        const trimmed = question.trim();
        if (!trimmed || isAsking) return;
        if (!selectedContractId) {
            setErrorKey('selectContract');
            return;
        }

        setErrorKey('');
        setIsAsking(true);

        const userMsg = {
            role: 'user',
            text: trimmed,
            ts: Date.now(),
        };

        setMessages((prev) => [...prev, userMsg]);
        setQuestion('');

        try {
            const result = await askContractQuestion(selectedContractId, trimmed);
            const answer = result?.answer || t('chat.noAnswer');
            const botMsg = {
                role: 'assistant',
                text: answer,
                ts: Date.now(),
                meta: result?.meta || null,
            };
            setMessages((prev) => [...prev, botMsg]);
        } catch {
            setErrorKey('askFailed');
        } finally {
            setIsAsking(false);
        }
    };

    const onSubmit = (e) => {
        e.preventDefault();
        sendQuestion();
    };

    const clearHistory = async () => {
        if (!selectedContractId || isAsking) return;
        try {
            await clearContractChatHistory(selectedContractId);
            setMessages([]);
            setErrorKey('');
        } catch {
            setErrorKey('clearFailed');
        }
    };

    const fallbackCopyText = (text) => {
        const textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.setAttribute('readonly', '');
        textarea.style.position = 'absolute';
        textarea.style.left = '-9999px';
        document.body.appendChild(textarea);
        textarea.select();
        const ok = document.execCommand('copy');
        document.body.removeChild(textarea);
        return ok;
    };

    const copyMessageText = async (text, key) => {
        const content = String(text || '').trim();
        if (!content) return;

        let copied = false;
        try {
            if (navigator?.clipboard?.writeText) {
                await navigator.clipboard.writeText(content);
                copied = true;
            }
        } catch {
            copied = false;
        }

        if (!copied) {
            copied = fallbackCopyText(content);
        }

        if (copied) {
            setCopiedMessageKey(key);
            setTimeout(() => {
                setCopiedMessageKey((prev) => (prev === key ? '' : prev));
            }, 1300);
        }
    };

    return (
        <div className={`chat-widget ${open ? 'open' : ''}`} dir={isRTL ? 'rtl' : 'ltr'}>
            {open && (
                <section className="chat-widget-panel" aria-label={t('chat.title')}>
                    <header className="chat-widget-header">
                        <div>
                            <h3>{t('chat.title')}</h3>
                            <p>{t('chat.subtitle')}</p>
                        </div>
                        <button
                            className="chat-widget-close"
                            onClick={() => setOpen(false)}
                            aria-label={t('chat.close')}
                            type="button"
                        >
                            <X size={18} />
                        </button>
                    </header>

                    <div className="chat-widget-contract-picker">
                        <label htmlFor="chat-contract-select">{t('chat.contractLabel')}</label>
                        <div className="chat-widget-contract-row">
                            <select
                                id="chat-contract-select"
                                value={selectedContractId}
                                onChange={(e) => setSelectedContractId(e.target.value)}
                                disabled={loadingContracts}
                            >
                                <option value="">{loadingContracts ? t('chat.loadingContracts') : t('chat.selectContract')}</option>
                                {contracts.map((contract) => (
                                    <option key={contract.contractId} value={contract.contractId}>
                                        {contract.fileName || contract.contractId}
                                    </option>
                                ))}
                            </select>
                            <button
                                type="button"
                                className="chat-widget-clear"
                                onClick={clearHistory}
                                disabled={!selectedContractId || isAsking}
                                title={t('chat.clear')}
                            >
                                {t('chat.clearShort')}
                            </button>
                        </div>
                    </div>

                    <div className="chat-widget-messages" role="log" aria-live="polite">
                        {!selectedContractId && (
                            <div className="chat-widget-empty">{t('chat.emptySelectContract')}</div>
                        )}

                        {selectedContractId && messages.length === 0 && (
                            <div className="chat-widget-empty">{t('chat.emptyStart')}</div>
                        )}

                        {messages.map((msg) => {
                            const messageKey = `${msg.ts}-${msg.role}`;
                            const copied = copiedMessageKey === messageKey;

                            return (
                            <article key={messageKey} className={`chat-msg ${msg.role}`}>
                                <div className="chat-msg-head">
                                    <div className="chat-msg-role">{msg.role === 'user' ? t('chat.you') : t('chat.assistant')}</div>
                                    <button
                                        type="button"
                                        className="chat-msg-copy"
                                        onClick={() => copyMessageText(msg.text, messageKey)}
                                        title={copied ? t('chat.copied') : t('chat.copy')}
                                        aria-label={copied ? t('chat.copied') : t('chat.copy')}
                                    >
                                        {copied ? <Check size={13} /> : <Copy size={13} />}
                                        <span>{copied ? t('chat.copied') : t('chat.copy')}</span>
                                    </button>
                                </div>
                                <p>{msg.text}</p>
                            </article>
                            );
                        })}

                        {isAsking && (
                            <article className="chat-msg assistant pending">
                                <div className="chat-msg-role">{t('chat.assistant')}</div>
                                <p><Loader2 size={14} className="spin" /> {t('chat.thinking')}</p>
                            </article>
                        )}
                    </div>

                    {errorKey && <p className="chat-widget-error">{t(`chat.errors.${errorKey}`)}</p>}

                    <form onSubmit={onSubmit} className="chat-widget-input-row">
                        <input
                            type="text"
                            value={question}
                            onChange={(e) => setQuestion(e.target.value)}
                            placeholder={t('chat.inputPlaceholder')}
                            maxLength={1200}
                            disabled={isAsking}
                        />
                        <button type="submit" disabled={isAsking || !question.trim()} aria-label={t('chat.send')}>
                            <Send size={16} />
                        </button>
                    </form>
                </section>
            )}

            {!open && (
                <button
                    type="button"
                    className="chat-widget-launcher"
                    onClick={() => setOpen(true)}
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
