import React, { useState } from "react";
import { Link } from "react-router-dom";
import { CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { useLanguage } from "@/contexts/LanguageContext/LanguageContext";
import { useTheme } from "@/contexts/ThemeContext";
import Button from "@/components/ui/Button";

const CheckoutForm = ({ pkg, clientSecret, onSuccess }) => {
    const stripe = useStripe();
    const elements = useElements();
    const { t, isRTL } = useLanguage();
    const { isDark } = useTheme();
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState(null);
    const [termsAccepted, setTermsAccepted] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!stripe || !elements) return;

        setIsProcessing(true);
        setError(null);

        try {
            const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(
                clientSecret,
                {
                    payment_method: {
                        card: elements.getElement(CardElement),
                    },
                }
            );

            if (stripeError) {
                setError(stripeError.message);
            } else if (paymentIntent.status === 'succeeded') {
                onSuccess(paymentIntent);
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setIsProcessing(false);
        }
    };

    const cardElementOptions = {
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
    };

    return (
        <form onSubmit={handleSubmit} className="checkout-form">
            <div className="card-element-wrapper">
                <label className="card-element-label">{t('checkout.cardDetails')}</label>
                <div className="card-element-container">
                    <CardElement options={cardElementOptions} />
                </div>
            </div>

            {error && (
                <div className="checkout-error">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="10" />
                        <line x1="15" y1="9" x2="9" y2="15" />
                        <line x1="9" y1="9" x2="15" y2="15" />
                    </svg>
                    <span>{error}</span>
                </div>
            )}

            <div className="checkout-test-notice">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="16" x2="12" y2="12" />
                    <line x1="12" y1="8" x2="12.01" y2="8" />
                </svg>
                <span>{t('checkout.testMode')}: 4242 4242 4242 4242</span>
            </div>

            {/* Payment Terms Consent */}
            <div className="checkout-terms-wrapper">
                <label className="checkout-terms-label">
                    <input
                        type="checkbox"
                        className="checkout-terms-checkbox"
                        checked={termsAccepted}
                        onChange={(e) => setTermsAccepted(e.target.checked)}
                    />
                    <span className="checkout-terms-text">
                        {t('checkout.termsLabel')}
                        <Link to="/terms" className="checkout-terms-link">
                            {t('checkout.termsLinkTerms')}
                        </Link>
                        {t('checkout.termsJoin')}
                        <Link to="/privacy" className="checkout-terms-link">
                            {t('checkout.termsLinkPrivacy')}
                        </Link>
                        {t('checkout.termsDisclaimer')}
                    </span>
                </label>
            </div>

            <Button
                type="submit"
                variant="primary"
                fullWidth
                disabled={!stripe || isProcessing || !termsAccepted}
            >
                {isProcessing ? t('checkout.processing') : (() => {
                    const price = !isRTL ? Math.round(pkg.price / 3.7) : pkg.price;
                    const currency = !isRTL ? '$' : '₪';
                    return `${t('checkout.pay')} ${currency}${price}`;
                })()}
            </Button>

            <p className="checkout-secure">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
                {t('checkout.securedByStripe')}
            </p>
        </form>
    );
};

/**
 * Main CheckoutPage component
 */
export default CheckoutForm;
