import React, { Suspense, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { showAppToast } from '../../utils/toast';
import Navigation from './Navigation';
import Footer from './Footer';
const ContractChatWidget = React.lazy(() => import('../domain/ContractChatWidget'));

const MainLayout = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const { isRTL } = useLanguage();
  const location = useLocation();
  const navigate = useNavigate();

  const isAdminRoute = location.pathname.startsWith('/admin');
  const isContractChatRoute =
    location.pathname === '/dashboard' ||
    location.pathname === '/contracts' ||
    location.pathname.startsWith('/analysis/');
  
  const showPublicFooter = location.pathname === '/pricing' || location.pathname === '/contact' || location.pathname === '/';
  const navVisible = !isAdminRoute && (isAuthenticated || location.pathname !== '/');

  useEffect(() => {
    const handleToast = (event) => {
      const nextToast = event?.detail;
      if (!nextToast) return;
      showAppToast(nextToast);
    };

    window.addEventListener('rg:toast', handleToast);
    return () => window.removeEventListener('rg:toast', handleToast);
  }, []);

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem('rg_toast');
      if (!raw) return;
      const parsed = JSON.parse(raw);
      if (parsed?.createdAt && parsed?.ttlMs) {
        const remaining = (parsed.createdAt + parsed.ttlMs) - Date.now();
        if (remaining <= 0) {
          sessionStorage.removeItem('rg_toast');
        } else {
          showAppToast(parsed);
          sessionStorage.removeItem('rg_toast');
        }
      }
    } catch {
      // ignore
    }
  }, []);

  if (isLoading) {
    return (
      <div className="app-loading">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  return (
    <div className="app-container">
      <Toaster
        position={isRTL ? 'top-left' : 'top-right'}
        reverseOrder={false}
        gutter={10}
        containerStyle={{ top: 16 }}
        toastOptions={{ style: { pointerEvents: 'auto' } }}
      />
      
      {navVisible && (
        <Navigation 
          showAuthControls={!isAuthenticated} 
          onAuthClick={(type) => { if (!isAuthenticated) navigate(`/?auth=${type}`); }} 
        />
      )}

      <main className={`app-main ${isAdminRoute ? 'admin-page' : ''} ${navVisible ? 'with-nav' : ''}`}>
        <Suspense fallback={<div className="app-loading"><div className="loading-spinner"></div></div>}>
          <Outlet />
        </Suspense>
      </main>

      {!isAdminRoute && (isAuthenticated || showPublicFooter) && <Footer />}

      {isAuthenticated && !isAdminRoute && isContractChatRoute && (
        <Suspense fallback={null}>
          <ContractChatWidget />
        </Suspense>
      )}
    </div>
  );
};

export default MainLayout;