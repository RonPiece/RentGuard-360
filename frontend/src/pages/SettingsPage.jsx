import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import Card from '../components/Card';
import Button from '../components/Button';
import Toggle from '../components/Toggle';
import './SettingsPage.css';

const SettingsPage = () => {
    const { userAttributes, logout } = useAuth();
    const { isDark, toggleTheme } = useTheme();

    const handleLogout = async () => {
        await logout();
    };

    return (
        <div className="settings-page">
            <h1 className="settings-title animate-fadeIn">Settings</h1>

            {/* Profile Section */}
            <section className="settings-section animate-slideUp">
                <h2 className="section-title">👤 Profile</h2>
                <Card variant="glass" padding="lg">
                    <div className="profile-info-grid">
                        <div className="profile-avatar-large">
                            {(userAttributes?.name || userAttributes?.email || 'U').charAt(0).toUpperCase()}
                        </div>
                        <div className="profile-details">
                            <div className="info-row">
                                <span className="info-label">Name</span>
                                <span className="info-value">{userAttributes?.name || 'Not set'}</span>
                            </div>
                            <div className="info-row">
                                <span className="info-label">Email</span>
                                <span className="info-value">{userAttributes?.email}</span>
                            </div>
                        </div>
                    </div>
                </Card>
            </section>

            {/* Appearance Section */}
            <section className="settings-section animate-slideUp" style={{ animationDelay: '100ms' }}>
                <h2 className="section-title">🎨 Appearance</h2>
                <Card variant="elevated" padding="lg">
                    <div className="setting-row">
                        <div className="setting-info">
                            <h3>Dark Mode</h3>
                            <p>Switch between light and dark themes</p>
                        </div>
                        <Toggle
                            checked={isDark}
                            onChange={toggleTheme}
                        />
                    </div>
                    <div className="theme-preview">
                        <div className={`preview-card ${isDark ? 'dark' : 'light'}`}>
                            <div className="preview-header"></div>
                            <div className="preview-content">
                                <div className="preview-line"></div>
                                <div className="preview-line short"></div>
                            </div>
                        </div>
                        <span className="preview-label">{isDark ? 'Dark Mode' : 'Light Mode'}</span>
                    </div>
                </Card>
            </section>

            {/* Notifications Section */}
            <section className="settings-section animate-slideUp" style={{ animationDelay: '200ms' }}>
                <h2 className="section-title">🔔 Notifications</h2>
                <Card variant="elevated" padding="lg">
                    <div className="setting-row">
                        <div className="setting-info">
                            <h3>Email Notifications</h3>
                            <p>Get notified when analysis is complete</p>
                        </div>
                        <Toggle checked={true} onChange={() => { }} />
                    </div>
                </Card>
            </section>

            {/* About Section */}
            <section className="settings-section animate-slideUp" style={{ animationDelay: '300ms' }}>
                <h2 className="section-title">ℹ️ About</h2>
                <Card variant="elevated" padding="lg">
                    <div className="about-info">
                        <div className="about-row">
                            <span>Version</span>
                            <span className="about-value">1.0.0</span>
                        </div>
                        <div className="about-row">
                            <span>Built by</span>
                            <span className="about-value">Ron & Moti</span>
                        </div>
                        <div className="about-row">
                            <span>Project</span>
                            <span className="about-value">Cloud Computing Final</span>
                        </div>
                    </div>
                </Card>
            </section>

            {/* Danger Zone */}
            <section className="settings-section animate-slideUp" style={{ animationDelay: '400ms' }}>
                <h2 className="section-title danger">⚠️ Account</h2>
                <Card variant="elevated" padding="lg" className="danger-card">
                    <div className="setting-row">
                        <div className="setting-info">
                            <h3>Sign Out</h3>
                            <p>Sign out from your account</p>
                        </div>
                        <Button variant="danger" onClick={handleLogout}>
                            Logout
                        </Button>
                    </div>
                </Card>
            </section>
        </div>
    );
};

export default SettingsPage;
