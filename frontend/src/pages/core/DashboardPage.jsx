/**
 * ============================================
 *  DashboardPage
 *  User Dashboard with stats and quick actions
 * ============================================
 */
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext/LanguageContext';
import { useSubscription } from '@/contexts/SubscriptionContext';
import { getUserDisplayLabel } from '@/features/chat/utils/chatHelpers';

import { useDashboardStats } from '@/features/dashboard/hooks/useDashboardStats';
import { getGreeting } from '@/features/dashboard/utils/dashboardHelpers';
import DashboardHero from '@/features/dashboard/components/DashboardHero';
import DashboardQuickActions from '@/features/dashboard/components/DashboardQuickActions';
import DashboardMarketing from '@/features/dashboard/components/DashboardMarketing';

import './DashboardPage.css';

const DashboardPage = () => {
    const { userAttributes, user, isAdmin } = useAuth();
    const { t, isRTL } = useLanguage();
    const { packageName, scansRemaining, isUnlimited, hasSubscription } = useSubscription();

    const { stats, isLoading } = useDashboardStats(user);

    const userName = getUserDisplayLabel(userAttributes, user, t);
    const greeting = getGreeting(t);

    return (
        <div className="dashboard-new-container" dir={isRTL ? 'rtl' : 'ltr'}>
            <DashboardHero 
                userName={userName} 
                greeting={greeting} 
                stats={stats} 
                isLoading={isLoading} 
            />

            {/* Wave Divider 1 */}
            <div className="dp-wave-separator">
                <svg className="wave-svg" fill="none" viewBox="0 0 1440 120" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
                    <path d="M0 64L60 58.7C120 53 240 43 360 48C480 53 600 75 720 85.3C840 96 960 96 1080 85.3C1200 75 1320 53 1380 42.7L1440 32V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0V64Z" className="wave-path-base"></path>
                </svg>
            </div>

            <DashboardQuickActions 
                isAdmin={isAdmin}
                hasSubscription={hasSubscription}
                packageName={packageName}
                isUnlimited={isUnlimited}
                scansRemaining={scansRemaining}
            />

            {/* Wave Divider 2 */}
            <div className="dp-wave-separator reverse-wave">
                <svg className="wave-svg" fill="none" viewBox="0 0 1440 120" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
                    <path d="M0 64L60 58.7C120 53 240 43 360 48C480 53 600 75 720 85.3C840 96 960 96 1080 85.3C1200 75 1320 53 1380 42.7L1440 32V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0V64Z" className="wave-path-base"></path>
                </svg>
            </div>

            <DashboardMarketing />
        </div>
    );
};

export default DashboardPage;
