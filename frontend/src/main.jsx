/**
 * File: main.jsx
 * Purpose: The main entry point of the React application.
 * Logic: It renders the root App component and wraps it in a hierarchy of global Context Providers (Theme, Language, Auth, Subscription) to avoid prop-drilling.
 * Note: Uses StrictMode for development checks and GlobalErrorBoundary for catching unhandled crashes.
 */
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { LanguageProvider } from './contexts/LanguageContext/LanguageContext';
import { SubscriptionProvider } from './contexts/SubscriptionContext';
import GlobalErrorBoundary from './components/ui/GlobalErrorBoundary';
import './styles/design-system.css';
import App from './App.jsx';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <GlobalErrorBoundary>
      <ThemeProvider>
        <LanguageProvider>
          <AuthProvider>
            <SubscriptionProvider>
              <App />
            </SubscriptionProvider>
          </AuthProvider>
        </LanguageProvider>
      </ThemeProvider>
    </GlobalErrorBoundary>
  </StrictMode>,
);
