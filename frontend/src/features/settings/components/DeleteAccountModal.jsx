/** Confirmation modal for permanent account deletion - requires user to type DELETE to confirm. */
import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import { AlertTriangle, X } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext/LanguageContext';

const DeleteAccountModal = ({ isOpen, onClose, onConfirm, isDeleting, deleteError, setDeleteError }) => {
    const { t, isRTL } = useLanguage();
    const [deleteConfirmText, setDeleteConfirmText] = useState('');

    if (!isOpen) return null;

    const handleClose = () => {
        if (!isDeleting) {
            setDeleteConfirmText('');
            setDeleteError('');
            onClose();
        }
    };

    const handleConfirm = () => {
        onConfirm(deleteConfirmText);
    };

    return ReactDOM.createPortal(
        <div className="modal-backdrop" onClick={handleClose}>
            <div className="modal-content delete-modal" onClick={(e) => e.stopPropagation()} dir={isRTL ? 'rtl' : 'ltr'}>
                <button
                    className="modal-close"
                    onClick={handleClose}
                    disabled={isDeleting}
                >
                    <X size={20} strokeWidth={2.5} />
                </button>

                <div className="modal-icon danger-icon"><AlertTriangle size={28} /></div>
                <h2>{t('account.deleteConfirmTitle')}</h2>

                <div className="delete-warning">
                    <p><strong>{t('account.deleteConfirmMessage')}</strong></p>
                    <p className="warning-text"><strong>{t('account.deleteConfirmWarning')}</strong></p>
                </div>

                <div className="delete-confirm-input">
                    <label>{t('account.typeDeleteToConfirm')}</label>
                    <input
                        type="text"
                        value={deleteConfirmText}
                        onChange={(e) => setDeleteConfirmText(e.target.value)}
                        placeholder="DELETE"
                        disabled={isDeleting}
                        style={{ textAlign: isRTL ? 'right' : 'left' }}
                    />
                </div>

                {deleteError && <p className="error-message">{deleteError}</p>}

                <div className="modal-actions">
                    <button className="btn-secondary" onClick={handleClose} disabled={isDeleting}>
                        {t('common.cancel')}
                    </button>
                    <button 
                        className="btn-danger" 
                        onClick={handleConfirm} 
                        disabled={isDeleting || deleteConfirmText !== 'DELETE'}
                    >
                        {isDeleting ? t('account.deletingAccount') : t('account.deleteAccount')}
                    </button>
                </div>
            </div>
        </div>,
        document.body
    );
};

export default DeleteAccountModal;
