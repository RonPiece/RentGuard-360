import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext/LanguageContext';

const DashboardMarketing = () => {
    const { t } = useLanguage();

    return (
        <>
            {/* How to Start Section */}
            <section className="how-to-start-section">
                <div className="how-to-inner">
                    <div className="how-to-header">
                        <h2>{t('dashboard.howToStart')}</h2>
                    </div>

                    <div className="steps-timeline">
                        <div className="step-item">
                            <div className="step-number text-primary">1</div>
                            <h4>{t('dashboard.step1Title')}</h4>
                            <p>{t('dashboard.step1Desc')}</p>
                        </div>

                        <div className="step-item">
                            <div className="step-line"></div>
                            <div className="step-number text-primary">2</div>
                            <h4>{t('dashboard.step2Title')}</h4>
                            <p>{t('dashboard.step2Desc')}</p>
                        </div>

                        <div className="step-item">
                            <div className="step-line"></div>
                            <div className="step-number text-primary">3</div>
                            <h4>{t('dashboard.step3Title')}</h4>
                            <p>{t('dashboard.step3Desc')}</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Asymmetrical Curved Wave Divider */}
            <div className="dp-wave-separator dark-wave-top relative-z10">
                <svg className="wave-svg" fill="none" viewBox="0 0 1200 120" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M985.66,92.83C906.67,72,823.78,31,743.84,14.19c-82.26-17.34-168.06-16.33-250.45.39-57.84,11.73-114,31.07-172,41.86A600.21,600.21,0,0,1,0,27.35V120H1200V95.83C1132.19,118.92,1055.71,111.31,985.66,92.83Z" className="wave-path-dark"></path>
                </svg>
            </div>

            <section className="why-rentguard-section">
                <div className="why-inner">
                    <div className="why-grid">

                        <div className="why-image-wrapper">
                            <div className="why-image-container">
                                <div className="image-overlay"></div>
                                <img src="/lawyer-hero.jpg" alt="Your Legal Consultant" />
                            </div>
                        </div>

                        <div className="why-content">
                            <h2>{t('dashboard.whyUs')}</h2>
                            <p className="why-subtitle text-primary-light-dim">{t('dashboard.whyUsSubtitle')}</p>

                            <div className="why-features-list">
                                {/* 1. Privacy */}
                                <div className="why-feature">
                                    <div className="why-feature-icon">
                                        <span className="material-symbols-outlined">lock</span>
                                    </div>
                                    <div className="why-feature-text">
                                        <h5>{t('dashboard.featurePrivacy')}</h5>
                                        <p className="text-primary-light-dim">{t('dashboard.featurePrivacyDesc')}</p>
                                    </div>
                                </div>

                                {/* 2. Legal Professionalism */}
                                <div className="why-feature">
                                    <div className="why-feature-icon">
                                        <span className="material-symbols-outlined">verified</span>
                                    </div>
                                    <div className="why-feature-text">
                                        <h5>{t('dashboard.featurePrompt')}</h5>
                                        <p className="text-primary-light-dim">{t('dashboard.featurePromptDesc')}</p>
                                    </div>
                                </div>

                                {/* 3. Risk Score */}
                                <div className="why-feature">
                                    <div className="why-feature-icon">
                                        <span className="material-symbols-outlined">query_stats</span>
                                    </div>
                                    <div className="why-feature-text">
                                        <h5>{t('dashboard.featureScore')}</h5>
                                        <p className="text-primary-light-dim">{t('dashboard.featureScoreDesc')}</p>
                                    </div>
                                </div>

                                {/* 4. Negotiation Tips */}
                                <div className="why-feature">
                                    <div className="why-feature-icon">
                                        <span className="material-symbols-outlined">lightbulb</span>
                                    </div>
                                    <div className="why-feature-text">
                                        <h5>{t('dashboard.featureTips')}</h5>
                                        <p className="text-primary-light-dim">{t('dashboard.featureTipsDesc')}</p>
                                    </div>
                                </div>

                                {/* 5. AWS Infrastructure */}
                                <div className="why-feature">
                                    <div className="why-feature-icon">
                                        <span className="material-symbols-outlined">cloud</span>
                                    </div>
                                    <div className="why-feature-text">
                                        <h5>{t('dashboard.featureAws')}</h5>
                                        <p className="text-primary-light-dim">{t('dashboard.featureAwsDesc')}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </section>
        </>
    );
};

export default DashboardMarketing;
