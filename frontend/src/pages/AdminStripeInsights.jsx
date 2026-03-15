import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useTheme } from '../contexts/ThemeContext';
import { getAdminStripeStats } from '../services/stripeApi';
import {
    AlertTriangle,
    CreditCard,
    DollarSign,
    TrendingUp,
    CheckCircle2,
    XCircle,
    BarChart3,
    ShieldAlert,
    Landmark,
    BadgeDollarSign,
    Activity,
    Percent,
} from 'lucide-react';
import './AdminStripeInsights.css';

const formatMoney = (value, currency = 'USD', locale = 'en-US') => {
    const safe = Number(value || 0);
    try {
        return new Intl.NumberFormat(locale, {
            style: 'currency',
            currency: String(currency || 'USD').toUpperCase(),
            maximumFractionDigits: 2,
        }).format(safe);
    } catch {
        return `${safe.toFixed(2)} ${String(currency || 'USD').toUpperCase()}`;
    }
};

const shortUserId = (value) => {
    const text = String(value || '');
    if (text.length <= 12) return text;
    return `${text.slice(0, 6)}...${text.slice(-4)}`;
};

const CACHE_KEY = 'rg_admin_stripe_stats';

const getCachedStats = () => {
    try {
        const raw = sessionStorage.getItem(CACHE_KEY);
        return raw ? JSON.parse(raw) : null;
    } catch {
        return null;
    }
};

const withTimeout = (promise, timeoutMs = 9000) => new Promise((resolve, reject) => {
    const id = setTimeout(() => reject(new Error('Request timeout')), timeoutMs);
    promise
        .then((value) => {
            clearTimeout(id);
            resolve(value);
        })
        .catch((error) => {
            clearTimeout(id);
            reject(error);
        });
});

const normalizeAdminStatsError = (err) => {
    const msg = String(err?.message || '').toLowerCase();
    if (msg.includes('504')) return 'Stripe service זמנית לא זמין (504).';
    if (msg.includes('timeout')) return 'טעינת Stripe התעכבה. נסה שוב בעוד רגע.';
    return err?.message || 'שגיאה בטעינת נתוני Stripe';
};

const METHOD_COLORS = {
    card: '#38bdf8',
    paypal: '#10b981',
    apple_pay: '#8b5cf6',
    bank_transfer: '#14b8a6',
    ideal: '#6366f1',
    unknown: '#64748b',
};

const AdminStripeInsights = () => {
    const { isAdmin } = useAuth();
    const { t, isRTL } = useLanguage();
    const { isDark } = useTheme();

    const [data, setData] = useState(() => getCachedStats());
    const [loading, setLoading] = useState(() => !getCachedStats());
    const [error, setError] = useState('');

    const loadData = useCallback(async (silent = false) => {
        if (!silent || !data) {
            setLoading(true);
        }
        setError('');

        try {
            const result = await withTimeout(getAdminStripeStats(), 9000);
            setData(result);
            try {
                sessionStorage.setItem(CACHE_KEY, JSON.stringify(result));
            } catch {
                // ignore cache write errors
            }
        } catch (err) {
            setError(normalizeAdminStatsError(err));
        } finally {
            setLoading(false);
        }
    }, [data]);

    useEffect(() => {
        loadData(Boolean(data));
    }, [loadData]);

    const sql = data?.sql || {};
    const stripe = data?.stripe || {};

    const successRate = useMemo(() => {
        const total = Number(stripe.chargesLast30Days || 0);
        const successful = Number(stripe.successfulChargesLast30Days || 0);
        if (!total) return 0;
        return Math.round((successful / total) * 100);
    }, [stripe]);

    const locale = isRTL ? 'he-IL' : 'en-US';
    const displayCurrency = stripe.defaultCurrency || 'USD';
    const paymentMethods = stripe.paymentMethodBreakdown || [];
    const currencies = stripe.currencyBreakdown || [];
    const conversionRate = useMemo(() => {
        const intents = Number(stripe.paymentIntentsLast30Days || 0);
        const successfulCharges = Number(stripe.successfulChargesLast30Days || 0);
        if (!intents) return 0;
        return Math.round((successfulCharges / intents) * 100);
    }, [stripe]);

    const totalMethodCount = Math.max(paymentMethods.reduce((sum, method) => sum + Number(method.count || 0), 0), 1);
    const maxMethodCount = Math.max(...paymentMethods.map((method) => Number(method.count || 0)), 1);
    const disputeRate = useMemo(() => {
        const charges = Number(stripe.chargesLast30Days || 0);
        if (!charges) return 0;
        return ((Number(stripe.disputeCountLast30Days || 0) / charges) * 100).toFixed(2);
    }, [stripe]);
    const refundRate = useMemo(() => {
        const charges = Number(stripe.chargesLast30Days || 0);
        if (!charges) return 0;
        return ((Number(stripe.refundedChargesLast30Days || 0) / charges) * 100).toFixed(2);
    }, [stripe]);
    const derivedCurrencies = useMemo(() => {
        if (currencies.length > 0) {
            return currencies;
        }

        const map = new Map();
        (sql.recentTransactions || []).forEach((tx) => {
            const code = String(tx.currency || 'N/A').toUpperCase();
            const amount = Number(tx.amount || 0);
            map.set(code, (map.get(code) || 0) + amount);
        });

        return Array.from(map.entries())
            .map(([currency, amount]) => ({ currency, amount }))
            .sort((a, b) => Number(b.amount || 0) - Number(a.amount || 0));
    }, [currencies, sql.recentTransactions]);

    const statusMix = useMemo(() => {
        const items = [
            { label: 'Succeeded', value: Number(sql.successfulTransactions || 0), className: 'ok' },
            { label: 'Failed', value: Number(sql.failedTransactions || 0), className: 'bad' },
            {
                label: 'Other',
                value: Math.max(0, Number(sql.totalTransactions || 0) - Number(sql.successfulTransactions || 0) - Number(sql.failedTransactions || 0)),
                className: 'neutral'
            },
        ];

        const total = Math.max(items.reduce((sum, item) => sum + item.value, 0), 1);
        return {
            total,
            items: items.map((item) => ({
                ...item,
                percent: Math.round((item.value / total) * 100),
            })),
        };
    }, [sql.failedTransactions, sql.successfulTransactions, sql.totalTransactions]);
    const paymentMixRows = useMemo(() => {
        if (paymentMethods.length > 0) {
            return paymentMethods
                .slice()
                .sort((a, b) => Number(b.count || 0) - Number(a.count || 0))
                .map((method) => {
                    const key = String(method.method || 'unknown').toLowerCase();
                    const value = Number(method.count || 0);
                    const width = Math.max(6, Math.round((value / maxMethodCount) * 100));
                    const percent = Math.round((value / totalMethodCount) * 100);
                    const color = METHOD_COLORS[key] || METHOD_COLORS.unknown;

                    return {
                        label: key.replace(/_/g, ' '),
                        percent,
                        width,
                        fill: `linear-gradient(90deg, ${color}, #22d3ee)`,
                    };
                });
        }

        const fallbackTotal = Math.max(statusMix.items.reduce((sum, item) => sum + item.value, 0), 1);
        return statusMix.items
            .filter((item) => item.value > 0)
            .map((item) => {
                const width = Math.max(8, Math.round((item.value / fallbackTotal) * 100));
                const fill = item.className === 'ok'
                    ? 'linear-gradient(90deg, #4ade80, #22c55e)'
                    : item.className === 'bad'
                        ? 'linear-gradient(90deg, #fb7185, #ef4444)'
                        : 'linear-gradient(90deg, #94a3b8, #64748b)';

                return {
                    label: `${item.label} (fallback)`,
                    percent: item.percent,
                    width,
                    fill,
                };
            });
    }, [paymentMethods, maxMethodCount, totalMethodCount, statusMix]);

    if (!isAdmin) {
        return (
            <div className={`stripe-insights-page page-container ${isDark ? 'dark' : 'light'}`} dir={isRTL ? 'rtl' : 'ltr'}>
                <div className="stripe-insights-denied">
                    <AlertTriangle size={42} />
                    <h2>{t('admin.accessDenied')}</h2>
                    <p>{t('admin.noPermission')}</p>
                </div>
            </div>
        );
    }

    return (
        <div className={`admin-dashboard stripe-insights-page page-container ${isDark ? 'dark' : 'light'}`} dir={isRTL ? 'rtl' : 'ltr'}>
            <header className="admin-header stripe-header-row">
                <div>
                    <h1>
                        <CreditCard size={28} style={{ marginInlineEnd: '12px' }} />
                        Stripe & Billing Insights
                    </h1>
                    <p>Comprehensive analysis of payments, revenue trends, and billing performance</p>
                </div>
            </header>

            <div className="admin-content">
                {error && (
                    <div className="error-banner stripe-insights-error">
                        <AlertTriangle size={16} />
                        <span>{error}</span>
                    </div>
                )}

                {loading ? (
                    <div className="loading-state stripe-insights-loading">
                        <div className="loading-spinner"></div>
                        <p>{t('common.loading')}</p>
                    </div>
                ) : (
                    <div className="stats-dashboard stripe-stats-dashboard">
                        <section className="stripe-kpi-grid">
                            <article className="stripe-kpi-card revenue">
                            <div className="kpi-icon"><DollarSign size={20} /></div>
                            <div>
                                <p className="kpi-label">{t('admin.revenue')}</p>
                                <p className="kpi-value">{formatMoney(sql.totalRevenue, displayCurrency, locale)}</p>
                            </div>
                        </article>

                        <article className="stripe-kpi-card">
                            <div className="kpi-icon"><Landmark size={20} /></div>
                            <div>
                                <p className="kpi-label">{t('admin.availableBalance')}</p>
                                <p className="kpi-value">{formatMoney(stripe.availableBalance, displayCurrency, locale)}</p>
                            </div>
                        </article>

                        <article className="stripe-kpi-card">
                            <div className="kpi-icon"><TrendingUp size={20} /></div>
                            <div>
                                <p className="kpi-label">{t('admin.successRate')}</p>
                                <p className="kpi-value">{successRate}%</p>
                            </div>
                        </article>

                        <article className="stripe-kpi-card">
                            <div className="kpi-icon"><CreditCard size={20} /></div>
                            <div>
                                <p className="kpi-label">{t('admin.transactions')}</p>
                                <p className="kpi-value">{Number(sql.totalTransactions || 0)}</p>
                            </div>
                        </article>

                        <article className="stripe-kpi-card">
                            <div className="kpi-icon"><BadgeDollarSign size={20} /></div>
                            <div>
                                <p className="kpi-label">{t('admin.avgOrderValue')}</p>
                                <p className="kpi-value">{formatMoney(sql.avgOrderValue, displayCurrency, locale)}</p>
                            </div>
                        </article>

                        <article className="stripe-kpi-card">
                            <div className="kpi-icon"><ShieldAlert size={20} /></div>
                            <div>
                                <p className="kpi-label">Disputes (30d)</p>
                                <p className="kpi-value">{Number(stripe.disputeCountLast30Days || 0)}</p>
                            </div>
                        </article>
                        </section>

                        <section className="stripe-content-grid compact-grid">
                            <article className="stripe-panel bundle-panel">
                                <h3>{t('admin.bundleDistribution')}</h3>
                                <div className="bundle-bars">
                                    {(sql.bundleBreakdown || []).map((item) => {
                                    const max = Math.max(...(sql.bundleBreakdown || []).map((x) => Number(x.count || 0)), 1);
                                    const width = Math.max(6, Math.round((Number(item.count || 0) / max) * 100));
                                    return (
                                        <div className="bundle-row" key={item.name}>
                                            <div className="bundle-row-head">
                                                <span>{item.name}</span>
                                                <span>{item.count}</span>
                                            </div>
                                            <div className="bundle-track">
                                                <div className="bundle-fill" style={{ width: `${width}%` }}></div>
                                            </div>
                                        </div>
                                    );
                                })}
                                    {(!sql.bundleBreakdown || sql.bundleBreakdown.length === 0) && (
                                        <p className="empty-text">{t('admin.noData')}</p>
                                    )}
                                </div>
                            </article>

                            <article className="stripe-panel">
                                <h3>{t('admin.stripeFeatures')}</h3>
                                <div className="features-grid">
                                    <div className="feature-row">
                                        <span>{t('admin.country')}</span>
                                        <strong>{stripe.accountCountry || 'N/A'}</strong>
                                    </div>
                                    <div className="feature-row">
                                        <span>{t('admin.currency')}</span>
                                        <strong>{(stripe.defaultCurrency || 'N/A').toUpperCase()}</strong>
                                    </div>
                                    <div className="feature-row">
                                        <span>{t('admin.chargesEnabled')}</span>
                                        <strong className={stripe.chargesEnabled ? 'ok' : 'bad'}>
                                            {stripe.chargesEnabled ? <CheckCircle2 size={15} /> : <XCircle size={15} />}
                                            {stripe.chargesEnabled ? 'ON' : 'OFF'}
                                        </strong>
                                    </div>
                                    <div className="feature-row">
                                        <span>{t('admin.payoutsEnabled')}</span>
                                        <strong className={stripe.payoutsEnabled ? 'ok' : 'bad'}>
                                            {stripe.payoutsEnabled ? <CheckCircle2 size={15} /> : <XCircle size={15} />}
                                            {stripe.payoutsEnabled ? 'ON' : 'OFF'}
                                        </strong>
                                    </div>
                                    <div className="feature-row">
                                        <span>{t('admin.charges30Days')}</span>
                                        <strong>{stripe.chargesLast30Days || 0}</strong>
                                    </div>
                                    <div className="feature-row">
                                        <span>{t('admin.refundedCharges')}</span>
                                        <strong>{stripe.refundedChargesLast30Days || 0}</strong>
                                    </div>
                                    <div className="feature-row">
                                        <span>Refund Amount (30d)</span>
                                        <strong>{formatMoney(stripe.refundedAmountLast30Days, displayCurrency, locale)}</strong>
                                    </div>
                                    <div className="feature-row">
                                        <span>{t('admin.intents30Days')}</span>
                                        <strong>{stripe.paymentIntentsLast30Days || 0}</strong>
                                    </div>
                                    <div className="feature-row">
                                        <span>{t('admin.pendingBalance')}</span>
                                        <strong>{formatMoney(stripe.pendingBalance, displayCurrency, locale)}</strong>
                                    </div>
                                    <div className="feature-row">
                                        <span>Intent to Charge Conversion</span>
                                        <strong>{conversionRate}%</strong>
                                    </div>
                                </div>
                                {stripe.error ? (
                                    <p className="stripe-runtime-error">{t('admin.stripeStatusError')}: {stripe.error}</p>
                                ) : null}
                            </article>
                        </section>

                        <section className="stripe-single-panel stretch-panels">
                            <article className="stripe-panel">
                                <h3><BarChart3 size={17} /> Payment Method Mix</h3>
                                {paymentMixRows.length > 0 ? (
                                    <div className="payment-mix-list">
                                        {paymentMixRows.map((row) => (
                                            <div className="payment-mix-row" key={`mix-${row.label}`}>
                                                <div className="payment-mix-head">
                                                    <span>{row.label}</span>
                                                    <span>{row.percent}%</span>
                                                </div>
                                                <div className="bundle-track">
                                                    <div className="bundle-fill custom-fill" style={{ width: `${row.width}%`, background: row.fill }}></div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="empty-text">No payment signals found yet.</p>
                                )}

                                <div className="stripe-extra-signals">
                                    <div className="signal-row">
                                        <span><Activity size={14} /> Failed Charges (30d)</span>
                                        <strong>{Number(stripe.failedChargesLast30Days || 0)}</strong>
                                    </div>
                                    <div className="signal-row">
                                        <span><ShieldAlert size={14} /> Dispute Rate</span>
                                        <strong>{disputeRate}%</strong>
                                    </div>
                                    <div className="signal-row">
                                        <span><Percent size={14} /> Refund Rate</span>
                                        <strong>{refundRate}%</strong>
                                    </div>
                                    <div className="signal-row">
                                        <span><Landmark size={14} /> Charges / Intents</span>
                                        <strong>{stripe.chargesLast30Days || 0}/{stripe.paymentIntentsLast30Days || 0}</strong>
                                    </div>
                                </div>
                            </article>
                        </section>

                        <section className="stripe-panel">
                            <h3>Top Currencies</h3>
                            {derivedCurrencies.length > 0 ? (
                                <div className="currency-list">
                                    {derivedCurrencies.slice(0, 6).map((cur) => {
                                        const maxCurrency = Math.max(...derivedCurrencies.map((item) => Number(item.amount || 0)), 1);
                                        const currencyAmount = Number(cur.amount || 0);
                                        const width = Math.max(10, Math.round((currencyAmount / maxCurrency) * 100));
                                        return (
                                            <div className="currency-row" key={cur.currency}>
                                                <div className="currency-head">
                                                    <span>{String(cur.currency || '').toUpperCase()}</span>
                                                    <strong>{formatMoney(cur.amount, cur.currency, locale)}</strong>
                                                </div>
                                                <div className="bundle-track">
                                                    <div className="bundle-fill alt" style={{ width: `${width}%` }}></div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : (
                                <p className="empty-text">No currency amounts found yet.</p>
                            )}

                            <div className="status-mix">
                                <h4>Transaction Status Split</h4>
                                {statusMix.items.map((item) => (
                                    <div className="status-mix-row" key={`status-mix-${item.label}`}>
                                        <div className="status-mix-head">
                                            <span>{item.label}</span>
                                            <span>{item.percent}%</span>
                                        </div>
                                        <div className="bundle-track">
                                            <div className={`status-mix-fill ${item.className}`} style={{ width: `${Math.max(3, item.percent)}%` }}></div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>

                        <section className="stripe-panel table-panel">
                            <div className="table-head">
                                <h3>{t('admin.recentTransactions')}</h3>
                                <span>{t('admin.generatedAt')}: {data?.generatedAt ? new Date(data.generatedAt).toLocaleString(locale) : 'N/A'}</span>
                            </div>
                            <div className="table-wrap">
                                <table>
                                    <thead>
                                        <tr>
                                            <th>User</th>
                                            <th>{t('admin.bundle')}</th>
                                            <th>{t('admin.amount')}</th>
                                            <th>{t('admin.currency')}</th>
                                            <th>{t('admin.status')}</th>
                                            <th>{t('admin.updatedAt')}</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {(sql.recentTransactions || []).map((tx, idx) => (
                                            <tr key={`${tx.userId}-${tx.createdAt}-${idx}`}>
                                                <td>{shortUserId(tx.userId)}</td>
                                                <td>{tx.bundleName}</td>
                                                <td>{Number(tx.amount || 0).toFixed(2)}</td>
                                                <td>{String(tx.currency || '').toUpperCase()}</td>
                                                <td>
                                                    <span className={`status-pill ${String(tx.status || '').toLowerCase()}`}>
                                                        {tx.status}
                                                    </span>
                                                </td>
                                                <td>{tx.createdAt ? new Date(tx.createdAt).toLocaleString(locale) : '-'}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                                {(!sql.recentTransactions || sql.recentTransactions.length === 0) && (
                                    <p className="empty-text">{t('admin.noData')}</p>
                                )}
                            </div>
                        </section>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminStripeInsights;
