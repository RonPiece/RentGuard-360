/** Profile settings card - displays user name, email, and plan info (read-only from Cognito). */
import React from 'react';
import { LogOut } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext/LanguageContext';

const ProfileSettingsCube = ({ userAttributes, onLogout }) => {
    const { t } = useLanguage();
    const userInitial = (userAttributes?.name || userAttributes?.email || 'U').charAt(0).toUpperCase();

    return (
        <div className="bento-card bento-col-2 profile-cube">
            <div className="profile-avatar-wrapper">
                <div className="profile-avatar-giant">{userInitial}</div>
            </div>
            <div className="profile-info-block">
                <span className="premium-badge">{t('settings.activeAccount')}</span>
                <h2>{userAttributes?.name || t('settings.profileFallbackUser')}</h2>
                <p className="profile-email">{userAttributes?.email}</p>
                
                <div className="profile-actions">
                    <button className="btn-secondary" onClick={onLogout}>
                        <LogOut size={16} />
                        {t('nav.logout')}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ProfileSettingsCube;
