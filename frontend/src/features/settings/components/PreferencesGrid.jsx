import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Palette,
    Languages,
    Smartphone,
    BellRing,
    MessageCircle,
    Lightbulb,
    CreditCard
} from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext/LanguageContext';
import { useTheme } from '@/contexts/ThemeContext';
import Toggle from '@/components/ui/Toggle';
import LanguageToggle from '@/components/ui/LanguageToggle';

const PreferencesGrid = ({
    chatAutoOpenEnabled,
    toggleChatAutoOpen,
    isMobileViewport,
    mobileNavCompactEnabled,
    toggleMobileNavCompact
}) => {
    const { t } = useLanguage();
    const { isDark, toggleTheme } = useTheme();
    const navigate = useNavigate();

    return (
        <>
            {/* Billing Placeholder Cube */}
            <div className="bento-card bento-col-2 flex-between billing-cube">
                <div>
                    <div className="cube-icon-wrapper icon-secondary">
                        <CreditCard size={24} />
                    </div>
                    <h3>{t('billing.title')}</h3>
                    
                    <div className="fake-credit-card">
                        <div className="card-dots">
                            <div className="dot red"></div>
                            <div className="dot orange"></div>
                        </div>
                        <span className="card-number">•••• 4421</span>
                    </div>
                </div>
                <button className="cube-link-btn text-secondary" onClick={() => navigate('/billing')}>
                    {t('settings.manageBilling')} &rarr;
                </button>
            </div>

            {/* Appearance Cube */}
            <div className="bento-card bento-col-2 flex-between appearance-cube">
                <div>
                    <div className="cube-icon-wrapper icon-primary">
                        <Palette size={24} />
                    </div>
                    <h3>{t('settings.appearanceTitle')}</h3>
                    <p className="cube-desc">{t('settings.appearanceDesc')}</p>
                </div>
                <div className="cube-action-row">
                    <span className="status-text">{isDark ? t('settings.darkMode') : t('settings.lightMode')}</span>
                    <Toggle checked={isDark} onChange={toggleTheme} />
                </div>
            </div>

            {/* Language Cube */}
            <div className="bento-card bento-col-2 flex-between language-cube">
                <div>
                    <div className="cube-icon-wrapper icon-primary">
                        <Languages size={24} />
                    </div>
                    <h3>{t('settings.languageTitle')}</h3>
                    <p className="cube-desc">{t('settings.languageDesc')}</p>
                </div>
                <div className="language-cube-action">
                    <LanguageToggle />
                </div>
            </div>

            {/* Contract Chat Behavior */}
            <div className="bento-card bento-col-2 flex-between">
                <div>
                    <div className="cube-icon-wrapper icon-primary">
                        <MessageCircle size={24} />
                    </div>
                    <h3>{t('settings.chatBehaviorTitle')}</h3>
                    <p className="cube-desc">{t('settings.chatBehaviorDesc')}</p>
                </div>
                <div className="cube-action-row">
                    <span className="status-text">
                        {chatAutoOpenEnabled
                            ? t('settings.chatAutoOpenOn')
                            : t('settings.chatAutoOpenOff')}
                    </span>
                    <Toggle checked={chatAutoOpenEnabled} onChange={toggleChatAutoOpen} />
                </div>
            </div>

            {/* Mobile Navigation Density */}
            {isMobileViewport && (
                <div className="bento-card bento-col-2 flex-between">
                    <div>
                        <div className="cube-icon-wrapper icon-secondary">
                            <Smartphone size={24} />
                        </div>
                        <h3>{t('settings.mobileNavTitle')}</h3>
                        <p className="cube-desc">{t('settings.mobileNavDesc')}</p>
                    </div>
                    <div className="cube-action-row">
                        <span className="status-text">
                            {mobileNavCompactEnabled
                                ? t('settings.mobileNavCompactOn')
                                : t('settings.mobileNavCompactOff')}
                        </span>
                        <Toggle checked={mobileNavCompactEnabled} onChange={toggleMobileNavCompact} />
                    </div>
                </div>
            )}

            {/* Notifications Cube */}
            <div className="bento-card bento-col-2 flex-between">
                <div>
                    <div className="cube-icon-wrapper icon-tertiary">
                        <BellRing size={24} />
                    </div>
                    <h3>{t('settings.alertsTitle')}</h3>
                    <p className="cube-desc">{t('settings.alertsDesc')}</p>
                    
                    <div className="notification-tip-box">
                        <Lightbulb size={14} className="tip-icon" />
                        <span>{t('settings.alertsTip')}</span>
                    </div>
                </div>
                <div className="cube-tags">
                    <span className="tag">EMAIL</span>
                    <span className="tag active">SYSTEM</span>
                </div>
            </div>
        </>
    );
};

export default PreferencesGrid;
