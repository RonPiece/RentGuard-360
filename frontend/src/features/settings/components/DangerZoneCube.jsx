/** Danger zone settings card - contains the Delete Account button with confirmation flow. */
import React from 'react';
import { ShieldAlert, Trash2 } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext/LanguageContext';

const DangerZoneCube = ({ onOpenDeleteModal }) => {
    const { t } = useLanguage();

    return (
        <div className="bento-card bento-col-6 danger-cube">
            <div className="danger-info">
                <div className="cube-icon-wrapper icon-danger">
                    <ShieldAlert size={32} />
                </div>
                <div>
                    <h3 className="danger-title">{t('settings.deleteAccountTitle')}</h3>
                    <p className="danger-desc">{t('settings.deleteAccountDesc')}</p>
                </div>
            </div>
            <div className="danger-actions">
                <button className="btn-danger" onClick={onOpenDeleteModal}>
                    <Trash2 size={16} />
                    {t('account.deleteAccount')}
                </button>
            </div>
        </div>
    );
};

export default DangerZoneCube;
