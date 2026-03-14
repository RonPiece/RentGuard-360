/**
 * ============================================
 *  PaymentSuccessPage
 *  Post-payment confirmation screen
 * ============================================
 * 
 * STRUCTURE:
 * - Success animation
 * - Order confirmation details
 * - Navigation to dashboard/contracts
 * 
 * DEPENDENCIES:
 * - LanguageContext: translations
 * - React Router: location state for order details
 * 
 * ============================================
 */
import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import Card from '../components/Card';
import Button from '../components/Button';
import './PaymentSuccessPage.css';

const PaymentSuccessPage = () => {
    const { t, isRTL } = useLanguage();
    const navigate = useNavigate();
    const location = useLocation();

    const { packageName, amount, currency, isFree } = location.state || {};

    return (
        <div className="payment-success-page page-container" dir={isRTL ? 'rtl' : 'ltr'}>
            <div className="section-band-alt">
                <section className="success-content">
                    <Card variant="elevated" padding="lg" className="success-card animate-scaleIn">
                        {/* Success Icon */}
                        <div className="success-icon-wrapper">
                            <div className="success-icon-circle">
                                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
                                    <polyline points="20,6 9,17 4,12" />
                                </svg>
                            </div>
                        </div>

                        <h1 className="success-title">{t('paymentSuccess.title')}</h1>
                        <p className="success-message">
                            {isFree
                                ? t('paymentSuccess.freeActivated')
                                : t('paymentSuccess.paymentCompleted')
                            }
                        </p>

                        {/* Order Details */}
                        <div className="success-details">
                            <div className="success-detail-item">
                                <span className="detail-label">{t('paymentSuccess.plan')}</span>
                                <span className="detail-value">{packageName || 'N/A'}</span>
                            </div>
                            {!isFree && amount && (
                                <div className="success-detail-item">
                                    <span className="detail-label">{t('paymentSuccess.amount')}</span>
                                    <span className="detail-value">
                                        {currency === 'ILS' ? '₪' : '$'}{amount}
                                    </span>
                                </div>
                            )}
                        </div>

                        <p className="success-hint">{t('paymentSuccess.hint')}</p>

                        {/* Navigation Buttons */}
                        <div className="success-actions">
                            <Button variant="primary" onClick={() => navigate('/dashboard')}>
                                {t('paymentSuccess.goToDashboard')}
                            </Button>
                            <Button variant="secondary" onClick={() => navigate('/upload')}>
                                {t('paymentSuccess.uploadContract')}
                            </Button>
                        </div>
                    </Card>
                </section>
            </div>
        </div>
    );
};

export default PaymentSuccessPage;
