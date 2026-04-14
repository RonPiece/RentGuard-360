/**
 * ============================================
 *  SettingsPage
 *  User Account & Application Settings
 * ============================================
 * 
 * STRUCTURE:
 * - Profile and logout
 * - Appearance toggle
 * - Billing shortcut
 * - Chat behavior settings
 * - Danger zone (Account deletion)
 * 
 * DEPENDENCIES:
 * - AuthContext, ThemeContext
 * ============================================
 */
import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext/LanguageContext';

import { useSettingsPreferences } from '@/features/settings/hooks/useSettingsPreferences';
import { useAccountDeletion } from '@/features/settings/hooks/useAccountDeletion';

import ProfileSettingsCube from '@/features/settings/components/ProfileSettingsCube';
import PreferencesGrid from '@/features/settings/components/PreferencesGrid';
import DangerZoneCube from '@/features/settings/components/DangerZoneCube';
import DeleteAccountModal from '@/features/settings/components/DeleteAccountModal';

import './SettingsPage.css';

const SettingsPage = () => {
    const { userAttributes, logout } = useAuth();
    const { t, isRTL } = useLanguage();
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    const {
        chatAutoOpenEnabled,
        toggleChatAutoOpen,
        mobileNavCompactEnabled,
        toggleMobileNavCompact,
        isMobileViewport
    } = useSettingsPreferences();

    const {
        isDeleting,
        deleteError,
        handleDeleteAccount,
        setDeleteError
    } = useAccountDeletion();

    const handleLogout = async () => {
        await logout();
    };

    const confirmDelete = async (confirmText) => {
        await handleDeleteAccount(confirmText, () => {
            setShowDeleteModal(false);
        });
    };

    return (
        <div className="settings-container" dir={isRTL ? 'rtl' : 'ltr'}>
            
            {/* Header Section */}
            <div className="settings-header">
                <h1 className="settings-title">{t('settings.title')}</h1>
                <p className="settings-subtitle">
                    {t('settings.subtitle')}
                </p>
            </div>

            {/* Bento Box Grid */}
            <div className="bento-grid">
                
                <ProfileSettingsCube 
                    userAttributes={userAttributes} 
                    onLogout={handleLogout} 
                />

                <PreferencesGrid 
                    chatAutoOpenEnabled={chatAutoOpenEnabled}
                    toggleChatAutoOpen={toggleChatAutoOpen}
                    isMobileViewport={isMobileViewport}
                    mobileNavCompactEnabled={mobileNavCompactEnabled}
                    toggleMobileNavCompact={toggleMobileNavCompact}
                />

                <DangerZoneCube 
                    onOpenDeleteModal={() => setShowDeleteModal(true)} 
                />

            </div>

            {/* Delete Account Modal */}
            <DeleteAccountModal
                isOpen={showDeleteModal}
                onClose={() => setShowDeleteModal(false)}
                onConfirm={confirmDelete}
                isDeleting={isDeleting}
                deleteError={deleteError}
                setDeleteError={setDeleteError}
            />
        </div>
    );
};

export default SettingsPage;
