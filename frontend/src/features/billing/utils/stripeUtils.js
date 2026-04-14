/** Stripe utility helpers - formats amounts, resolves currency symbols, and normalizes plan data. */
export const getStripeElementOptions = (isDark) => ({
    style: {
        base: {
            fontSize: '16px',
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
            color: isDark ? '#FFFFFF' : '#0F172A',
            '::placeholder': {
                color: isDark ? '#94A3B8' : '#94A3B8',
            },
            iconColor: '#059669',
        },
        invalid: {
            color: '#EF4444',
            iconColor: '#EF4444',
        },
    },
    hidePostalCode: true,
});

