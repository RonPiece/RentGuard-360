import React, { useState, useRef, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { ThemeToggle } from './Toggle';
import './Navigation.css';

const Navigation = () => {
    const { user, userAttributes, logout } = useAuth();
    const navigate = useNavigate();
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const profileRef = useRef(null);

    // Close profile dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (profileRef.current && !profileRef.current.contains(event.target)) {
                setIsProfileOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Handle logout
    const handleLogout = async () => {
        await logout();
        navigate('/');
    };

    // Get user display name
    const getUserDisplayName = () => {
        if (userAttributes?.name) return userAttributes.name;
        if (userAttributes?.email) return userAttributes.email.split('@')[0];
        return 'User';
    };

    // Get user email
    const getUserEmail = () => {
        return userAttributes?.email || user?.signInDetails?.loginId || 'No email';
    };

    // Get user initials for avatar
    const getUserInitials = () => {
        const name = getUserDisplayName();
        return name.substring(0, 2).toUpperCase();
    };

    return (
        <nav className="navigation">
            <div className="nav-content">
                {/* Logo */}
                <NavLink to="/dashboard" className="nav-logo">
                    <span className="logo-icon">🛡️</span>
                    <span className="logo-text">RentGuard 360</span>
                </NavLink>

                {/* Mobile Menu Toggle */}
                <button
                    className="mobile-menu-toggle"
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    aria-label="Toggle menu"
                >
                    <span className={`hamburger ${isMobileMenuOpen ? 'open' : ''}`}></span>
                </button>

                {/* Navigation Links */}
                <div className={`nav-links ${isMobileMenuOpen ? 'open' : ''}`}>
                    <NavLink
                        to="/dashboard"
                        className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                        onClick={() => setIsMobileMenuOpen(false)}
                    >
                        <span className="nav-icon">📊</span>
                        <span>Dashboard</span>
                    </NavLink>

                    <NavLink
                        to="/upload"
                        className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                        onClick={() => setIsMobileMenuOpen(false)}
                    >
                        <span className="nav-icon">📤</span>
                        <span>Upload</span>
                    </NavLink>

                    <NavLink
                        to="/contracts"
                        className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                        onClick={() => setIsMobileMenuOpen(false)}
                    >
                        <span className="nav-icon">📄</span>
                        <span>Contracts</span>
                    </NavLink>
                </div>

                {/* Right Side - Theme Toggle & Profile */}
                <div className="nav-actions">
                    <ThemeToggle />

                    {/* Profile Dropdown */}
                    <div className="profile-container" ref={profileRef}>
                        <button
                            className="profile-button"
                            onClick={() => setIsProfileOpen(!isProfileOpen)}
                            aria-expanded={isProfileOpen}
                        >
                            <div className="profile-avatar">
                                {getUserInitials()}
                            </div>
                            <span className="profile-chevron">{isProfileOpen ? '▲' : '▼'}</span>
                        </button>

                        {/* Dropdown Menu */}
                        {isProfileOpen && (
                            <div className="profile-dropdown">
                                <div className="dropdown-header">
                                    <div className="dropdown-avatar">
                                        {getUserInitials()}
                                    </div>
                                    <div className="dropdown-info">
                                        <p className="dropdown-name">{getUserDisplayName()}</p>
                                        <p className="dropdown-email">{getUserEmail()}</p>
                                    </div>
                                </div>

                                <div className="dropdown-divider"></div>

                                <button className="dropdown-item" disabled>
                                    <span className="dropdown-icon">⚙️</span>
                                    <span>Settings</span>
                                    <span className="coming-soon">Soon</span>
                                </button>

                                <div className="dropdown-divider"></div>

                                <button className="dropdown-item logout" onClick={handleLogout}>
                                    <span className="dropdown-icon">🚪</span>
                                    <span>Logout</span>
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navigation;
