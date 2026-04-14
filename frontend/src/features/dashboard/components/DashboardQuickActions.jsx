import React from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext/LanguageContext';

const DashboardQuickActions = ({ isAdmin, hasSubscription, packageName, isUnlimited, scansRemaining }) => {
    const { t } = useLanguage();

    const scrollToPageTop = () => {
        window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
    };

    return (
        <section className="quick-actions-section">
            <div className="quick-actions-inner">
                <h2 className="quick-actions-title">
                    {t('dashboard.quickActions')}
                    <span className="title-underline"></span>
                </h2>

                <div className="actions-grid-new">

                    <Link to="/contracts" className="action-card-new action-view" onClick={scrollToPageTop}>
                        <div className="action-bg-effect view-effect"></div>
                        <span className="material-symbols-outlined action-large-icon text-primary">folder_open</span>
                        <h3>{t('dashboard.viewContracts')}</h3>
                        <p>{t('dashboard.viewDescription')}</p>
                        <div className="action-link-text text-primary">
                            {t('dashboard.viewAll')} <span className="material-symbols-outlined">arrow_forward</span>
                        </div>
                    </Link>

                    <Link to="/upload" className="action-card-new action-upload" onClick={scrollToPageTop}>
                        <div className="action-bg-effect upload-effect"></div>
                        <span className="material-symbols-outlined action-large-icon text-white">cloud_upload</span>
                        <h3 className="text-white">{t('dashboard.uploadContract')}</h3>
                        <p className="text-white-dim">{t('dashboard.uploadDescription')}</p>
                        <div className="action-link-text text-white">
                            {t('dashboard.uploadPDF')} <span className="material-symbols-outlined">arrow_forward</span>
                        </div>
                    </Link>

                    {!isAdmin && (
                        <Link to="/pricing" className="action-card-new action-subscription">
                            <div className="action-bg-effect sub-effect"></div>
                            <span className="material-symbols-outlined action-large-icon text-tertiary">card_membership</span>
                            <h3>{t('subscription.myPlan')}</h3>
                            {hasSubscription ? (
                                <p>{packageName} — {isUnlimited ? t('subscription.unlimited') : `${scansRemaining} ${t('subscription.scansRemaining')}`}</p>
                            ) : (
                                <p>{t('subscription.noPlan')}</p>
                            )}
                            <div className="action-link-text text-tertiary">
                                {hasSubscription ? t('subscription.upgrade') : t('subscription.choosePlan')} <span className="material-symbols-outlined">arrow_forward</span>
                            </div>
                        </Link>
                    )}

                    {!isAdmin && (
                        <div className="action-card-new action-coming-soon">
                            <div className="action-bg-effect coming-soon-effect"></div>
                            <span className="material-symbols-outlined action-large-icon text-secondary">rocket_launch</span>
                            <span className="coming-soon-pill">{t('common.comingSoon')}</span>
                            <h3>{t('dashboard.newFeaturesTitle')}</h3>
                            <p>{t('dashboard.newFeaturesDesc')}</p>
                            <div className="action-link-text text-secondary">{t('common.comingSoon')}</div>
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
};

export default DashboardQuickActions;
