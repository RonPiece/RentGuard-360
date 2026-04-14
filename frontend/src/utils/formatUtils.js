/**
 * Shared formatting utilities used across the app.
 * Handles money formatting, date localization, price conversion (ILS/USD),
 * Stripe amount normalization, and admin display helpers.
 */

// Format a numeric value as currency (e.g. "$12.00") using Intl.NumberFormat
export const formatMoney = (value, currency = 'USD', locale = 'en-US') => {
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

// Truncate long user IDs for display (e.g. "abc123...xyz9")
export const shortUserId = (value) => {
    const text = String(value || '');
    if (text.length <= 12) return text;
    return `${text.slice(0, 6)}...${text.slice(-4)}`;
};

// Translate admin bundle/package names using i18n keys, fallback to raw name
export const localizeBundleName = (key, raw, t) => {
    if (!key) return raw;
    const trans = t(`admin.package${key}`);
    return trans === `admin.package${key}` ? raw : trans;
};

// Format seconds into a human-readable time string
export const formatTime = (seconds, t) => {
    if (!seconds) return '—';
    if (seconds < 60) return `${Math.round(seconds)} ${t('admin.seconds')}`;
};

// Exchange rate used to convert ILS prices to USD for English-speaking users
export const USD_EXCHANGE_RATE = 3.7;

// Converts a price for display based on language direction (RTL = ILS, LTR = USD)
export const calculateDisplayPrice = (price, isRTL) => {
    const safePrice = Number(price) || 0;
    const displayPrice = !isRTL ? Math.round(safePrice / USD_EXCHANGE_RATE) : safePrice;
    const displayCurrency = !isRTL ? '$' : '₪';
    return { displayPrice, displayCurrency };
};


// Stripe stores amounts in cents — this divides by 100 if the value looks like cents
export const formatStripeAmount = (amount, currency, locale) => {
    let numericAmount = Number(amount || 0);
    const safeCurrency = (currency || 'ILS').toUpperCase();
    if (numericAmount !== 0 && Number.isInteger(numericAmount) && Math.abs(numericAmount) >= 100) {
        numericAmount = numericAmount / 100;
    }
    try {
        return new Intl.NumberFormat(locale, {
            style: 'currency',
            currency: safeCurrency,
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        }).format(numericAmount);
    } catch {
        const symbol = safeCurrency === 'ILS' ? '₪' : '$';
        return `${symbol}${numericAmount.toFixed(2)}`;
    }
};

// Format a date string into a localized short format (e.g. "Apr 14, 2026")
export const formatDateLocalized = (value, locale) => {
    if (!value) return '';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '';
    return date.toLocaleDateString(locale, {
        year: 'numeric',
        month: 'short',
        day: '2-digit',
    });
};

