/** Dashboard hero section - greeting banner with user name, scan stats card, and quick-start CTA. */
import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext/LanguageContext';

const DashboardHero = ({ userName, greeting, stats, isLoading }) => {
    const { t } = useLanguage();

    return (
        <section className="dashboard-hero-section">
            <div className="dashboard-hero-header">
                <h2 className="dashboard-greeting">{greeting}, {userName}</h2>
                <p className="dashboard-subtitle">{t('dashboard.welcomeSubtitle')}</p>
            </div>

            <div className="status-cards-grid">
                {/* Status Card 1: Total */}
                <div className="status-card">
                    <div className="status-icon icon-primary">
                        <span className="material-symbols-outlined">description</span>
                    </div>
                    <span className="status-value text-primary">{isLoading ? '-' : stats.total}</span>
                    <span className="status-label">{t('dashboard.totalContracts')}</span>
                </div>

                {/* Status Card 2: Analyzed */}
                <div className="status-card">
                    <div className="status-icon icon-secondary">
                        <span className="material-symbols-outlined">analytics</span>
                    </div>
                    <span className="status-value text-secondary">{isLoading ? '-' : stats.analyzed}</span>
                    <span className="status-label">{t('dashboard.analyzed')}</span>
                </div>

                {/* Status Card 3: Pending */}
                <div className="status-card">
                    <div className="status-icon icon-tertiary">
                        <span className="material-symbols-outlined">pending_actions</span>
                    </div>
                    <span className="status-value text-tertiary">{isLoading ? '-' : stats.pending}</span>
                    <span className="status-label">{t('dashboard.pending')}</span>
                </div>

                {/* Status Card 4: Risks */}
                <div className="status-card">
                    <div className="status-icon icon-error">
                        <span className="material-symbols-outlined">warning</span>
                    </div>
                    <span className="status-value text-error">{isLoading ? '-' : stats.highRisk}</span>
                    <span className="status-label">{t('dashboard.highRisk')}</span>
                </div>
            </div>
        </section>
    );
};

export default DashboardHero;
