import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { ThemeToggle } from '../components/Toggle';
import Button from '../components/Button';
import Card from '../components/Card';
import Input from '../components/Input';
import SignupModal from '../components/SignupModal';
import './LandingPage.css';

const LandingPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { login, isAuthenticated, isLoading: authLoading } = useAuth();

    // Form state
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [showSignupModal, setShowSignupModal] = useState(false);

    // Redirect if already authenticated
    React.useEffect(() => {
        if (isAuthenticated && !authLoading) {
            const from = location.state?.from?.pathname || '/dashboard';
            navigate(from, { replace: true });
        }
    }, [isAuthenticated, authLoading, navigate, location]);

    // Handle login submit
    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        const result = await login(email, password);

        if (result.success) {
            const from = location.state?.from?.pathname || '/dashboard';
            navigate(from, { replace: true });
        } else {
            setError(result.error || 'Invalid email or password');
        }

        setIsLoading(false);
    };

    // Handle successful signup
    const handleSignupSuccess = () => {
        setShowSignupModal(false);
        // User is now logged in, redirect to dashboard
        navigate('/dashboard');
    };

    return (
        <div className="landing-page">
            {/* Header */}
            <header className="landing-header">
                <div className="header-left">
                    <div className="logo-container">
                        <span className="logo-icon">🛡️</span>
                        <h1 className="logo-text">RentGuard 360</h1>
                    </div>
                </div>
                <div className="header-right">
                    <ThemeToggle />
                </div>
            </header>

            {/* Main Content */}
            <main className="landing-main">
                {/* Left Side - Features */}
                <section className="features-section">
                    <div className="hero-content animate-fadeIn">
                        <h2 className="hero-title">AI-Powered Lease Analysis</h2>
                        <p className="hero-subtitle">
                            Your smart guardian for rental contracts. Upload your lease agreement
                            and get instant AI-powered analysis, risk assessment, and negotiation suggestions.
                        </p>
                    </div>

                    <div className="features-grid">
                        <Card variant="glass" padding="md" className="feature-card animate-slideUp">
                            <div className="feature-icon">📄</div>
                            <h3>Upload Contracts</h3>
                            <p>Drag and drop your PDF lease agreements for instant processing</p>
                        </Card>

                        <Card variant="glass" padding="md" className="feature-card animate-slideUp" style={{ animationDelay: '100ms' }}>
                            <div className="feature-icon">🤖</div>
                            <h3>AI Analysis</h3>
                            <p>Powered by Amazon Bedrock (Claude) for deep contract understanding</p>
                        </Card>

                        <Card variant="glass" padding="md" className="feature-card animate-slideUp" style={{ animationDelay: '200ms' }}>
                            <div className="feature-icon">⚠️</div>
                            <h3>Risk Detection</h3>
                            <p>Identify problematic clauses and potential issues before you sign</p>
                        </Card>

                        <Card variant="glass" padding="md" className="feature-card animate-slideUp" style={{ animationDelay: '300ms' }}>
                            <div className="feature-icon">💡</div>
                            <h3>Negotiation Coach</h3>
                            <p>Get AI-generated suggestions for better contract terms</p>
                        </Card>
                    </div>

                    {/* How It Works */}
                    <div className="how-it-works animate-fadeIn" style={{ animationDelay: '400ms' }}>
                        <h3>How It Works</h3>
                        <div className="steps">
                            <div className="step">
                                <span className="step-number">1</span>
                                <span className="step-text">Upload your lease PDF</span>
                            </div>
                            <div className="step-arrow">→</div>
                            <div className="step">
                                <span className="step-number">2</span>
                                <span className="step-text">AI analyzes the contract</span>
                            </div>
                            <div className="step-arrow">→</div>
                            <div className="step">
                                <span className="step-number">3</span>
                                <span className="step-text">Get actionable insights</span>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Right Side - Login Form */}
                <section className="auth-section">
                    <Card variant="glass" padding="lg" className="auth-card animate-slideUp">
                        <h2 className="auth-title">Welcome Back</h2>
                        <p className="auth-subtitle">Sign in to analyze your contracts</p>

                        <form onSubmit={handleLogin} className="auth-form">
                            {error && (
                                <div className="error-message">
                                    {error}
                                </div>
                            )}

                            <Input
                                type="email"
                                label="Email Address"
                                placeholder="your@email.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                autoComplete="email"
                            />

                            <Input
                                type="password"
                                label="Password"
                                placeholder="Enter your password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                autoComplete="current-password"
                            />

                            <Button
                                type="submit"
                                variant="primary"
                                fullWidth
                                loading={isLoading}
                                disabled={isLoading || !email || !password}
                            >
                                {isLoading ? 'Signing in...' : 'Sign In'}
                            </Button>
                        </form>

                        <div className="auth-divider">
                            <span>or</span>
                        </div>

                        <Button
                            variant="secondary"
                            fullWidth
                            onClick={() => setShowSignupModal(true)}
                        >
                            Create Account
                        </Button>

                        <p className="auth-footer">
                            By signing in, you agree to our Terms of Service and Privacy Policy
                        </p>
                    </Card>
                </section>
            </main>

            {/* Footer */}
            <footer className="landing-footer">
                <p>Built with ❤️ by AI-Lawyers Team</p>
                <p className="credits-names">Ron & Moti | Cloud Computing Project</p>
            </footer>

            {/* Signup Modal */}
            {showSignupModal && (
                <SignupModal
                    onClose={() => setShowSignupModal(false)}
                    onSuccess={handleSignupSuccess}
                />
            )}
        </div>
    );
};

export default LandingPage;
