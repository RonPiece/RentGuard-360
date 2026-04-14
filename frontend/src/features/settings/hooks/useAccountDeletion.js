/** Hook that handles the account deletion flow - shows modal, validates input, calls Cognito deleteUser. */
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext/LanguageContext';
import { deleteAllUserContracts } from '@/features/admin/services/adminApi';

export const useAccountDeletion = () => {
    const { deleteAccount, user } = useAuth();
    const { t } = useLanguage();
    const [isDeleting, setIsDeleting] = useState(false);
    const [deleteError, setDeleteError] = useState('');

    const handleDeleteAccount = async (deleteConfirmText, onSuccess) => {
        if (deleteConfirmText !== 'DELETE') {
            setDeleteError(t('account.typeDeleteToConfirmError'));
            return;
        }

        setIsDeleting(true);
        setDeleteError('');

        try {
            const userId = user?.username || user?.userId;
            if (userId) {
                // Cleanup orphaned backend assets before destroying the user in Cognito pool
                await deleteAllUserContracts(userId);
            }

            const result = await deleteAccount();

            if (!result.success) {
                setDeleteError(result.error || t('account.deleteAccountError'));
                setIsDeleting(false);
            } else {
                if (onSuccess) onSuccess();
            }
        } catch (error) {
            console.error('Delete account error:', error);
            setDeleteError(t('account.deleteAccountError'));
            setIsDeleting(false);
        }
    };

    return {
        isDeleting,
        deleteError,
        handleDeleteAccount,
        setDeleteError
    };
};
