/**
 * ============================================
 *  BillingPage
 *  Stripe Customer Portal – Billing Management
 * ============================================
 * 
 * STRUCTURE:
 * - Current plan summary
 * - Stripe Portal redirection CTA
 * - Transaction history list
 * 
 * DEPENDENCIES:
 * - stripeApi (createCustomerPortalSession, getTransactions)
 * - SubscriptionContext
 * ============================================
 */
import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
    CreditCard,
    ExternalLink,
    FileText,
    History,
    Shield,
    Lock,
    Loader2,
    Filter,
    ChevronDown
} from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext/LanguageContext';
import { useBilling } from '@/features/billing/hooks/useBilling';
import { formatStripeAmount, formatDateLocalized } from '@/utils/formatUtils';
import BackButton from '@/components/ui/BackButton/BackButton';
import './BillingPage.css';

const BillingPage = () => {
    const navigate = useNavigate();
    const { t, isRTL } = useLanguage();
    
    const {
        isAdmin,
        subLoading,
        planName,
        scansRemaining,
        isUnlimited,
        portalLoading,
        portalError,
        transactionsLoading,
        transactionsError,
        transactionsFilterOpen,
        transactionsFilter,
        setTransactionsFilterOpen,
        setTransactionsFilter,
        filterMenuRef,
        transactionFilterOptions,
        filteredTransactions,
        handleOpenPortal
    } = useBilling();

    return (
        <div className="billing-container" dir={isRTL ? 'rtl' : 'ltr'}>

            {/* Header */}
            <div className="billing-header">
                <div className="billing-header-content">
                    <div className="billing-header-text">
                        <h1 className="billing-title">{t('billing.title')}</h1>
                        <p className="billing-subtitle">{t('billing.subtitle')}</p>
                    </div>
                    <div className="billing-header-actions">
                        <BackButton to="/settings" label={t('billing.backToSettings')} />
                    </div>
                </div>
            </div>

            <div className="billing-grid">

                {/* Current Plan Card */}
                <div className="billing-card">
                    <div className="plan-card-content">
                        <div className="plan-info">
                            <div className="plan-icon-wrapper">
                                <CreditCard size={24} />
                            </div>
                            <div className="plan-details">
                                <h3>{t('billing.currentPlan')}</h3>
                                <div className="plan-meta">
                                    <span className="plan-badge">{planName}</span>
                                    <span className="plan-scans">
                                        {subLoading
                                            ? '...'
                                            : isUnlimited
                                                ? t('billing.unlimited')
                                                : `${scansRemaining} ${t('billing.scansRemaining')}`
                                        }
                                    </span>
                                </div>
                            </div>
                        </div>
                        {!isAdmin && (
                            <button
                                className="plan-upgrade-btn"
                                onClick={() => navigate('/pricing')}
                            >
                                {t('billing.upgradePlan')}
                            </button>
                        )}
                    </div>
                </div>

                {/* Stripe Portal Card (Main CTA) */}
                <div className="billing-card portal-card">
                    <div className="portal-card-content">
                        <div className="portal-icon-wrapper">
                            <FileText size={32} />
                        </div>
                        <div className="portal-text">
                            <h3>{t('billing.portalTitle')}</h3>
                            <p>{t('billing.portalDesc')}</p>
                        </div>
                        <button
                            className="portal-btn"
                            onClick={handleOpenPortal}
                            disabled={portalLoading}
                        >
                            {portalLoading ? (
                                <>
                                    <span className="btn-spinner" />
                                    {t('billing.portalLoading')}
                                </>
                            ) : (
                                <>
                                    {t('billing.portalButton')}
                                    <ExternalLink size={18} />
                                </>
                            )}
                        </button>
                        {portalError && (
                            <p className="portal-error-msg">{portalError}</p>
                        )}
                    </div>
                </div>

                {/* Transactions History (moved up above feature cards) */}
                <div className="billing-card transactions-card">
                    <div className="transactions-header">
                        <h3>{t('billing.historyTitle')}</h3>
                        <div className="billing-transactions-filter-menu" ref={filterMenuRef}>
                            <button
                                type="button"
                                className="billing-transactions-filter-trigger"
                                onClick={() => setTransactionsFilterOpen(prev => !prev)}
                            >
                                <Filter size={14} />
                                <span>
                                    {transactionFilterOptions.find(option => option.key === transactionsFilter)?.label}
                                </span>
                                <ChevronDown size={14} className={`billing-filter-chevron ${transactionsFilterOpen ? 'open' : ''}`} />
                            </button>

                            {transactionsFilterOpen && (
                                <div className="billing-transactions-filter-dropdown">
                                    {transactionFilterOptions.map((option) => (
                                        <button
                                            key={option.key}
                                            type="button"
                                            className={`billing-transactions-filter-item ${transactionsFilter === option.key ? 'active' : ''}`}
                                            onClick={() => {
                                                setTransactionsFilter(option.key);
                                                setTransactionsFilterOpen(false);
                                            }}
                                        >
                                            {option.label}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {transactionsLoading && (
                        <div className="transactions-loading">
                            <Loader2 size={16} className="spin" />

                        </div>
                    )}

                    {!transactionsLoading && transactionsError && (
                        <p className="transactions-error-msg">{transactionsError}</p>
                    )}

                    {!transactionsLoading && !transactionsError && filteredTransactions.length === 0 && (
                        <p className="transactions-empty">
                            {t('billing.noTransactionsForFilter')}
                        </p>
                    )}

                    {!transactionsLoading && !transactionsError && filteredTransactions.length > 0 && (
                        <div className="transactions-list" role="list">
                            {filteredTransactions.map((tx) => {
                                const key = tx.id || tx.stripePaymentId || `${tx.createdAt}-${tx.amount}`;
                                const status = String(tx.status || '').toLowerCase();

                                return (
                                <div className={`transaction-row ${isRTL ? 'rtl' : 'ltr'}`} key={key} role="listitem">
                                        <div className="transaction-date">{formatDateLocalized(tx.createdAt, isRTL ? 'he-IL' : 'en-US') || t('billing.notAvailable')}</div>
                                        <div className="transaction-amount">{formatStripeAmount(tx.amount, tx.currency, isRTL ? 'he-IL' : 'en-US')}</div>
                                        <div className={`transaction-status ${status}`}>
                                            {status === 'succeeded'
                                                ? t('billing.statusPaid')
                                                : status === 'failed'
                                                    ? t('billing.statusFailed')
                                                    : (tx.status || t('billing.statusUnknown'))}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Feature Cards */}
                <div className="billing-features">
                    <div className="billing-card billing-feature-card">
                        <div className="feature-icon-wrapper green">
                            <CreditCard size={22} />
                        </div>
                        <h4>{t('billing.feature1Title')}</h4>
                        <p>{t('billing.feature1Desc')}</p>
                    </div>
                    <div className="billing-card billing-feature-card">
                        <div className="feature-icon-wrapper blue">
                            <FileText size={22} />
                        </div>
                        <h4>{t('billing.feature2Title')}</h4>
                        <p>{t('billing.feature2Desc')}</p>
                    </div>
                    <div className="billing-card billing-feature-card">
                        <div className="feature-icon-wrapper purple">
                            <History size={22} />
                        </div>
                        <h4>{t('billing.feature3Title')}</h4>
                        <p>{t('billing.feature3Desc')}</p>
                    </div>
                </div>



                {/* Security Bar */}
                <div className="billing-security-bar">
                    <div className="security-item">
                        <Shield size={16} />
                        <span>{t('billing.poweredByStripe')}</span>
                    </div>
                    <div className="security-item">
                        <Lock size={16} />
                        <span>{t('billing.securityNote')}</span>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default BillingPage;
