import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import AdminSidebar from '../components/AdminSidebar';
import { useLanguage } from '../contexts/LanguageContext';
import { useTheme } from '../contexts/ThemeContext';
import { Menu, X, Shield } from 'lucide-react';
import './AdminLayout.css';

/**
 * AdminLayout - Wrapper component for admin pages
 * Provides sidebar navigation and main content area
 * Sidebar is toggleable at ALL screen sizes via hamburger button
 */
const AdminLayout = () => {
    const { isRTL } = useLanguage();
    const { isDark } = useTheme();

    // Sidebar state - default open on desktop (>1024px), closed on mobile
    const [sidebarOpen, setSidebarOpen] = useState(() => {
        return window.innerWidth > 1024;
    });

    // Update sidebar state on resize
    useEffect(() => {
        const handleResize = () => {
            // Auto-open on desktop, auto-close on mobile when resizing
            if (window.innerWidth > 1024 && !sidebarOpen) {
                setSidebarOpen(true);
            }
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [sidebarOpen]);

    const toggleSidebar = () => {
        setSidebarOpen(!sidebarOpen);
    };

    const closeSidebarOnMobile = () => {
        // Only auto-close on mobile after navigation
        if (window.innerWidth <= 1024) {
            setSidebarOpen(false);
        }
    };

    return (
        <div
            className={`admin-layout ${isDark ? 'dark' : 'light'} ${sidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}
            dir={isRTL ? 'rtl' : 'ltr'}
        >
            {/* Top Bar - ALWAYS visible with hamburger toggle */}
            <header className="admin-top-bar">
                <div className="top-bar-left">
                    <button
                        className="hamburger-btn"
                        onClick={toggleSidebar}
                        aria-label={sidebarOpen ? 'Close sidebar' : 'Open sidebar'}
                    >
                        {sidebarOpen ? <X size={22} /> : <Menu size={22} />}
                    </button>
                    <div className="top-bar-logo">
                        <Shield size={22} />
                        <span>RentGuard Admin</span>
                    </div>
                </div>
            </header>

            {/* Mobile Overlay - only on small screens when sidebar is open */}
            <div
                className={`sidebar-overlay ${sidebarOpen ? 'visible' : ''}`}
                onClick={closeSidebarOnMobile}
            />

            {/* Sidebar */}
            <aside className={`admin-sidebar-wrapper ${sidebarOpen ? 'open' : 'closed'}`}>
                <AdminSidebar onNavigate={closeSidebarOnMobile} />
            </aside>

            {/* Main Content */}
            <main className="admin-main-content">
                <Outlet />
            </main>
        </div>
    );
};

export default AdminLayout;
