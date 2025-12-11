import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Card from '../components/Card';
import Button from '../components/Button';
import './DashboardPage.css';

const DashboardPage = () => {
    const { userAttributes } = useAuth();

    // Get user's first name or email username
    const getUserName = () => {
        if (userAttributes?.name) return userAttributes.name;
        if (userAttributes?.email) return userAttributes.email.split('@')[0];
        return 'User';
    };

    // Get greeting based on time of day
    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Good morning';
        if (hour < 18) return 'Good afternoon';
        return 'Good evening';
    };

    // Mock stats - will be replaced with real DynamoDB data
    const stats = [
        {
            label: 'Total Contracts',
            value: '0',
            icon: '📄',
            color: '#3b82f6',
            description: 'Upload your first contract'
        },
        {
            label: 'Analyzed',
            value: '0',
            icon: '✅',
            color: '#10b981',
            description: 'AI-analyzed documents'
        },
        {
            label: 'Pending',
            value: '0',
            icon: '⏳',
            color: '#f59e0b',
            description: 'Awaiting analysis'
        },
        {
            label: 'Issues Found',
            value: '0',
            icon: '⚠️',
            color: '#ef4444',
            description: 'Items requiring attention'
        },
    ];

    return (
        <div className="dashboard-page">
            {/* Welcome Section */}
            <section className="welcome-section">
                <div className="welcome-content">
                    <h1 className="welcome-title animate-fadeIn">
                        {getGreeting()}, {getUserName()}! 👋
                    </h1>
                    <p className="welcome-subtitle animate-fadeIn" style={{ animationDelay: '100ms' }}>
                        Welcome to your RentGuard 360 dashboard. Upload and analyze rental contracts with AI.
                    </p>
                </div>
            </section>

            {/* Stats Grid */}
            <section className="stats-section">
                <div className="stats-grid">
                    {stats.map((stat, index) => (
                        <Card
                            key={stat.label}
                            variant="glass"
                            padding="md"
                            className="stat-card animate-slideUp"
                            style={{ animationDelay: `${index * 100}ms` }}
                        >
                            <div className="stat-icon" style={{ background: `${stat.color}20`, color: stat.color }}>
                                {stat.icon}
                            </div>
                            <div className="stat-content">
                                <p className="stat-value">{stat.value}</p>
                                <p className="stat-label">{stat.label}</p>
                                <p className="stat-description">{stat.description}</p>
                            </div>
                        </Card>
                    ))}
                </div>
            </section>

            {/* Quick Actions */}
            <section className="actions-section">
                <h2 className="section-title">Quick Actions</h2>
                <div className="actions-grid">
                    <Card variant="elevated" padding="lg" className="action-card animate-slideUp" style={{ animationDelay: '400ms' }}>
                        <div className="action-icon">📤</div>
                        <h3>Upload Contract</h3>
                        <p>Upload a new rental contract for AI analysis</p>
                        <Link to="/upload">
                            <Button variant="primary" fullWidth>
                                Upload PDF
                            </Button>
                        </Link>
                    </Card>

                    <Card variant="elevated" padding="lg" className="action-card animate-slideUp" style={{ animationDelay: '500ms' }}>
                        <div className="action-icon">📋</div>
                        <h3>View Contracts</h3>
                        <p>Browse all your uploaded contracts</p>
                        <Link to="/contracts">
                            <Button variant="secondary" fullWidth>
                                View All
                            </Button>
                        </Link>
                    </Card>

                    <Card variant="elevated" padding="lg" className="action-card animate-slideUp" style={{ animationDelay: '600ms' }}>
                        <div className="action-icon">🎓</div>
                        <h3>Learn More</h3>
                        <p>Tips for understanding rental agreements</p>
                        <Button variant="outline" fullWidth disabled>
                            Coming Soon
                        </Button>
                    </Card>
                </div>
            </section>

            {/* Recent Activity - Placeholder */}
            <section className="activity-section">
                <h2 className="section-title">Recent Activity</h2>
                <Card variant="glass" padding="lg" className="activity-card animate-fadeIn" style={{ animationDelay: '700ms' }}>
                    <div className="empty-state">
                        <div className="empty-icon">📭</div>
                        <h3>No activity yet</h3>
                        <p>Upload your first contract to get started</p>
                        <Link to="/upload">
                            <Button variant="primary">
                                Upload Your First Contract
                            </Button>
                        </Link>
                    </div>
                </Card>
            </section>

            {/* Getting Started Guide */}
            <section className="guide-section animate-fadeIn" style={{ animationDelay: '800ms' }}>
                <Card variant="glass" padding="lg" className="guide-card">
                    <h2>Getting Started</h2>
                    <div className="guide-steps">
                        <div className="guide-step">
                            <div className="guide-number">1</div>
                            <div className="guide-content">
                                <h4>Upload a Contract</h4>
                                <p>Drag and drop your rental agreement PDF</p>
                            </div>
                        </div>
                        <div className="guide-step">
                            <div className="guide-number">2</div>
                            <div className="guide-content">
                                <h4>AI Analysis</h4>
                                <p>Our AI will analyze the contract terms</p>
                            </div>
                        </div>
                        <div className="guide-step">
                            <div className="guide-number">3</div>
                            <div className="guide-content">
                                <h4>Get Insights</h4>
                                <p>Review risks and negotiation suggestions</p>
                            </div>
                        </div>
                    </div>
                </Card>
            </section>
        </div>
    );
};

export default DashboardPage;
