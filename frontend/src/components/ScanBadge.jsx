import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useSubscription } from '../contexts/SubscriptionContext';
import { useLanguage } from '../contexts/LanguageContext';

const ScanBadge = () => {
  const { isAdmin } = useAuth();
  const { scansRemaining, isUnlimited, hasSubscription } = useSubscription();
  const { t } = useLanguage();
  const navigate = useNavigate();

  if (!hasSubscription && !isAdmin) {
    return null;
  }

  return (
    <button
      className="scan-badge"
      onClick={() => navigate(isAdmin ? '/admin/stripe' : '/pricing')}
      title={(isAdmin || isUnlimited) ? t('nav.unlimited') : `${scansRemaining} ${t('nav.scansLeft')}`}
    >
      <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
        {(isAdmin || isUnlimited) ? 'all_inclusive' : 'database'}
      </span>

      {(isAdmin || isUnlimited) ? (
        <span className="scan-badge-unlimited">
        </span>
      ) : (
        <span>{scansRemaining}</span>
      )}
    </button>
  );
};

export default ScanBadge;
