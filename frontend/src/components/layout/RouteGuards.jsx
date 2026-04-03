import React from 'react';
import { Route, Navigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useSubscription } from '../../contexts/SubscriptionContext';

export const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  if (isLoading) return <div className="app-loading"><div className="loading-spinner"></div></div>;
  return isAuthenticated ? children : <Navigate to="/" replace />;
};

export const RequireActivePlanRoute = ({ children }) => {
  const { isAdmin } = useAuth();
  const { hasSubscription, isLoading: isSubscriptionLoading, isEntitlementKnown, error, refreshSubscription } = useSubscription();
  const location = useLocation();

  if (isAdmin) return children;

  if (isSubscriptionLoading || !isEntitlementKnown) {
    return (
      <div className="app-loading">
        <div className="loading-spinner"></div>
        <p>Checking your plan...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="app-error" style={{ textAlign: 'center', padding: '50px 20px', maxWidth: '600px', margin: '0 auto' }}>
        <h2 style={{ color: '#d32f2f' }}>Connection Error</h2>
        <p style={{ margin: '20px 0' }}>We could not verify your subscription status due to a network or server error ({error}). Please make sure you are connected to the internet and try again.</p>
        <button 
          onClick={() => refreshSubscription()} 
          style={{ padding: '10px 20px', background: '#1976d2', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
        >
          Try Again
        </button>
      </div>
    );
  }

  if (!hasSubscription) {
    return <Navigate to="/pricing" replace state={{ from: location.pathname }} />;
  }

  return children;
};
