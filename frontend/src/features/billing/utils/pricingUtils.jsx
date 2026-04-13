/**
 * ============================================
 *  Pricing Utilities
 *  Helper functions for the Pricing Page
 * ============================================
 */
import React from 'react';

export const normalizePlanName = (value) => String(value || '').trim().toLowerCase();

export const getLastPurchaseDateTime = (subscription, t, isRTL) => {
    const updatedAt = subscription?.updatedAt || subscription?.UpdatedAt;
    if (!updatedAt) {
        return t('pricing.notAvailable');
    }

    const date = new Date(updatedAt);
    if (Number.isNaN(date.getTime())) {
        return t('pricing.notAvailable');
    }

    const locale = isRTL ? 'he-IL' : 'en-US';
    const datePart = date.toLocaleDateString(locale, {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
    });
    const timePart = date.toLocaleTimeString(locale, {
        hour: '2-digit',
        minute: '2-digit',
    });

    return t('pricing.atTime', { date: datePart, time: timePart });
};

export const getPackageIcon = (name) => {
    switch (name) {
        case 'Free':
            return (
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M12 2L2 7l10 5 10-5-10-5z" />
                    <path d="M2 17l10 5 10-5" />
                    <path d="M2 12l10 5 10-5" />
                </svg>
            );
        case 'Single':
            return (
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                    <polyline points="14 2 14 8 20 8"></polyline>
                    <line x1="16" y1="13" x2="8" y2="13"></line>
                    <line x1="16" y1="17" x2="8" y2="17"></line>
                    <polyline points="10 9 9 9 8 9"></polyline>
                </svg>
            );
        case 'Basic':
            return (
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
                </svg>
            );
        case 'Pro':
            return (
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" />
                </svg>
            );
        default:
            return null;
    }
};

export const getPackageFeatures = (pkgName, t) => {
    const features = {
        Free: t('pricing.featuresFree', { returnObjects: true }),
        Single: t('pricing.featuresSingle', { returnObjects: true }),
        Basic: t('pricing.featuresBasic', { returnObjects: true }),
        Pro: t('pricing.featuresPro', { returnObjects: true }),
    };
    return features[pkgName] || [];
};
