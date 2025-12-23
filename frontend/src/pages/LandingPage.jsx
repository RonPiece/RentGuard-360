import React, { useState, useEffect, useRef } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { ThemeToggle } from '../components/Toggle';
import LanguageToggle from '../components/LanguageToggle';
import Button from '../components/Button';
import Input from '../components/Input';
import './LandingPage.css';

const LandingPage = () => {
    const { login, register, confirmRegistration, isAuthenticated, resendCode } = useAuth();
    const { t, isRTL } = useLanguage();

    // Auth form state
    const [authDropdown, setAuthDropdown] = useState(null); // null | 'login' | 'register' | 'confirm'
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [code, setCode] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [tempEmail, setTempEmail] = useState('');

    // Resend code state
    const [resendLoading, setResendLoading] = useState(false);
    const [resendCooldown, setResendCooldown] = useState(0);
    const [resendSuccess, setResendSuccess] = useState(false);

    // Carousel state
    const [currentSlide, setCurrentSlide] = useState(0);
    const [isPaused, setIsPaused] = useState(false);

    const dropdownRef = useRef(null);

    const benefits = [
        { key: 'benefitCloud', icon: '☁' },
        { key: 'benefitAI', icon: '◈' },
        { key: 'benefitSecurity', icon: '⛊' },
        { key: 'benefitFast', icon: '↯' },
    ];

    // Resume pending verification
    useEffect(() => {
        const pendingEmail = localStorage.getItem('rentguard_pending_verification');
        if (pendingEmail && !isAuthenticated) {
            setTempEmail(pendingEmail);
            setAuthDropdown('confirm');
        }
    }, [isAuthenticated]);

    // Close dropdown on outside click
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                if (!e.target.closest('.auth-btn')) {
                    setAuthDropdown(null);
                }
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Resend cooldown timer
    useEffect(() => {
        if (resendCooldown > 0) {
            const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
            return () => clearTimeout(timer);
        }
    }, [resendCooldown]);

    // Carousel auto-advance
    useEffect(() => {
        if (isPaused) return;
        const timer = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % benefits.length);
        }, 4000);
        return () => clearInterval(timer);
    }, [isPaused]);

    if (isAuthenticated) {
        localStorage.removeItem('rentguard_pending_verification');
        return <Navigate to="/dashboard" replace />;
    }

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        const result = await login(email, password);
        if (!result.success) {
            setError(result.error || 'התחברות נכשלה');
        }
        setLoading(false);
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        const result = await register(email, password, name);
        if (result.success) {
            setTempEmail(email);
            localStorage.setItem('rentguard_pending_verification', email);
            setAuthDropdown('confirm');
        } else {
            setError(result.error || 'הרשמה נכשלה');
        }
        setLoading(false);
    };

    const handleConfirm = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        const result = await confirmRegistration(tempEmail, code);
        if (result.success) {
            localStorage.removeItem('rentguard_pending_verification');
            setAuthDropdown('login');
            setEmail(tempEmail);
            setError('');
        } else {
            setError(result.error || 'אימות נכשל');
        }
        setLoading(false);
    };

    const handleResendCode = async () => {
        if (resendCooldown > 0 || !tempEmail) return;
        setResendLoading(true);
        setResendSuccess(false);
        try {
            if (resendCode) await resendCode(tempEmail);
            setResendSuccess(true);
            setResendCooldown(60);
        } catch (err) {
            setError(err.message || 'שליחה נכשלה');
        } finally {
            setResendLoading(false);
        }
    };

    const handleCancelVerification = () => {
        localStorage.removeItem('rentguard_pending_verification');
        setTempEmail('');
        setCode('');
        setAuthDropdown('register');
    };

    const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % benefits.length);
    const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + benefits.length) % benefits.length);

    const toggleAuth = (type) => {
        setError('');
        setAuthDropdown(authDropdown === type ? null : type);
    };

    return (
        <div className="landing-page-v2" dir={isRTL ? 'rtl' : 'ltr'}>
            {/* Navbar */}
            <nav className="landing-nav">
                <div className="landing-nav-inner">
                    <a href="/" className="landing-logo">
                        <span className="logo-icon">🛡️</span>
                        <span className="logo-text">RentGuard 360</span>
                    </a>
                    <div className="landing-nav-right">
                        <LanguageToggle />
                        <ThemeToggle />
                        <div className="auth-buttons">
                            <button
                                className={`auth-btn ${authDropdown === 'login' ? 'active' : ''}`}
                                onClick={() => toggleAuth('login')}
                            >
                                {t('auth.login')}
                            </button>
                            <button
                                className={`auth-btn primary ${authDropdown === 'register' ? 'active' : ''}`}
                                onClick={() => toggleAuth('register')}
                            >
                                {t('auth.register')}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Auth Dropdown */}
                {authDropdown && (
                    <div className="auth-dropdown" ref={dropdownRef}>
                        <div className="auth-dropdown-inner">
                            {/* Login Form */}
                            {authDropdown === 'login' && (
                                <form onSubmit={handleLogin} className="auth-form">
                                    <h3>{t('auth.login')}</h3>
                                    <Input
                                        type="email"
                                        label={t('auth.email')}
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                    />
                                    <Input
                                        type="password"
                                        label={t('auth.password')}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                    />
                                    {error && <p className="auth-error">{error}</p>}
                                    <Button variant="primary" fullWidth loading={loading} type="submit">
                                        {t('auth.loginButton')}
                                    </Button>
                                    <p className="auth-switch">
                                        {t('auth.noAccount')}{' '}
                                        <button type="button" onClick={() => toggleAuth('register')}>
                                            {t('auth.register')}
                                        </button>
                                    </p>
                                </form>
                            )}

                            {/* Register Form */}
                            {authDropdown === 'register' && (
                                <form onSubmit={handleRegister} className="auth-form">
                                    <h3>{t('auth.register')}</h3>
                                    <Input
                                        label={t('auth.fullName')}
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        required
                                    />
                                    <Input
                                        type="email"
                                        label={t('auth.email')}
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                    />
                                    <Input
                                        type="password"
                                        label={t('auth.password')}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                        helperText={t('auth.passwordHint')}
                                    />
                                    {error && <p className="auth-error">{error}</p>}
                                    <Button variant="primary" fullWidth loading={loading} type="submit">
                                        {t('auth.registerButton')}
                                    </Button>
                                    <p className="auth-switch">
                                        {t('auth.hasAccount')}{' '}
                                        <button type="button" onClick={() => toggleAuth('login')}>
                                            {t('auth.login')}
                                        </button>
                                    </p>
                                </form>
                            )}

                            {/* Confirm Form */}
                            {authDropdown === 'confirm' && (
                                <form onSubmit={handleConfirm} className="auth-form">
                                    <div className="confirm-header">
                                        <h3>{t('auth.confirmTitle')}</h3>
                                        <p>{t('auth.confirmMessage')} <strong>{tempEmail}</strong></p>
                                    </div>

                                    <div className="spam-hint">
                                        <span>✉</span>
                                        <span>{isRTL ? 'לא מצאת? בדוק את תיקיית הספאם' : 'Not found? Check your spam folder'}</span>
                                    </div>

                                    <Input
                                        label={t('auth.confirmCode')}
                                        value={code}
                                        onChange={(e) => setCode(e.target.value)}
                                        required
                                        placeholder="123456"
                                    />

                                    {error && <p className="auth-error">{error}</p>}
                                    {resendSuccess && <p className="auth-success">{isRTL ? 'קוד נשלח שוב בהצלחה!' : 'Code resent successfully!'}</p>}

                                    <Button variant="primary" fullWidth loading={loading} type="submit">
                                        {t('auth.confirmButton')}
                                    </Button>

                                    <div className="confirm-actions">
                                        <button
                                            type="button"
                                            className="link-btn"
                                            onClick={handleResendCode}
                                            disabled={resendCooldown > 0 || resendLoading}
                                        >
                                            {resendLoading ? (isRTL ? 'שולח...' : 'Sending...') :
                                                resendCooldown > 0 ? `${isRTL ? 'שלח שוב' : 'Resend'} (${resendCooldown}s)` :
                                                    (isRTL ? 'שלח קוד שוב' : 'Resend code')}
                                        </button>
                                        <button
                                            type="button"
                                            className="link-btn secondary"
                                            onClick={handleCancelVerification}
                                        >
                                            {isRTL ? 'חזרה להרשמה' : 'Back to registration'}
                                        </button>
                                    </div>
                                </form>
                            )}
                        </div>
                    </div>
                )}
            </nav>

            {/* Main Content - Full Width */}
            <main className="landing-main-full">
                <div className="landing-content">
                    {/* Hero Section */}
                    <div className="hero-section">
                        <h1>{t('auth.heroTitle')}</h1>
                        <p className="hero-subtitle">{t('auth.heroSubtitle')}</p>

                        <div className="hero-benefits">
                            <div className="benefit-item">
                                <span className="benefit-check">✓</span>
                                <span>{t('auth.heroBenefit1')}</span>
                            </div>
                            <div className="benefit-item">
                                <span className="benefit-check">✓</span>
                                <span>{t('auth.heroBenefit2')}</span>
                            </div>
                            <div className="benefit-item">
                                <span className="benefit-check">✓</span>
                                <span>{t('auth.heroBenefit3')}</span>
                            </div>
                        </div>

                        <div className="hero-cta">
                            <Button
                                variant="primary"
                                size="large"
                                onClick={() => toggleAuth('register')}
                            >
                                {isRTL ? 'התחל עכשיו - חינם' : 'Get Started - Free'}
                            </Button>
                        </div>
                    </div>

                    {/* Benefits Carousel */}
                    <div
                        className="benefits-carousel"
                        onMouseEnter={() => setIsPaused(true)}
                        onMouseLeave={() => setIsPaused(false)}
                    >
                        {isPaused && <span className="carousel-paused">⏸</span>}
                        <button className="carousel-arrow" onClick={prevSlide} aria-label="Previous">
                            {isRTL ? '›' : '‹'}
                        </button>
                        <div className="carousel-content" key={currentSlide}>
                            <div className="carousel-icon">{benefits[currentSlide].icon}</div>
                            <h4>{t(`auth.${benefits[currentSlide].key}`)}</h4>
                            <p>{t(`auth.${benefits[currentSlide].key}Desc`)}</p>
                        </div>
                        <button className="carousel-arrow" onClick={nextSlide} aria-label="Next">
                            {isRTL ? '‹' : '›'}
                        </button>
                    </div>
                    <div className="carousel-dots">
                        {benefits.map((_, idx) => (
                            <button
                                key={idx}
                                className={`carousel-dot ${idx === currentSlide ? 'active' : ''}`}
                                onClick={() => setCurrentSlide(idx)}
                                aria-label={`Slide ${idx + 1}`}
                            />
                        ))}
                    </div>

                    {/* How It Works */}
                    <div className="demo-section">
                        <h3>{t('auth.demoTitle')}</h3>
                        <div className="demo-steps">
                            <div className="demo-step">
                                <span className="step-number">1</span>
                                <div className="step-icon">▲</div>
                                <h4>{t('auth.demoStep1')}</h4>
                                <p>{t('auth.demoStep1Desc')}</p>
                            </div>
                            <div className="demo-step">
                                <span className="step-number">2</span>
                                <div className="step-icon">◇</div>
                                <h4>{t('auth.demoStep2')}</h4>
                                <p>{t('auth.demoStep2Desc')}</p>
                            </div>
                            <div className="demo-step">
                                <span className="step-number">3</span>
                                <div className="step-icon">✓</div>
                                <h4>{t('auth.demoStep3')}</h4>
                                <p>{t('auth.demoStep3Desc')}</p>
                            </div>
                        </div>
                    </div>

                    {/* Features */}
                    <div className="features-section">
                        <div className="card">
                            <h4>{t('auth.featureAI')}</h4>
                            <p>{t('auth.featureAIDesc')}</p>
                        </div>
                        <div className="card">
                            <h4>{t('auth.featurePrivacy')}</h4>
                            <p>{t('auth.featurePrivacyDesc')}</p>
                        </div>
                        <div className="card">
                            <h4>{t('auth.featureTips')}</h4>
                            <p>{t('auth.featureTipsDesc')}</p>
                        </div>
                    </div>

                    {/* Footer */}
                    <footer className="landing-footer">
                        <p>
                            {t('auth.builtBy')}{' '}
                            <a href="https://github.com/RonPiece" target="_blank" rel="noopener noreferrer">Ron</a>
                            {' & '}
                            <a href="https://github.com/MoTy" target="_blank" rel="noopener noreferrer">Moty</a>
                            {' | '}{t('auth.projectName')}
                        </p>
                    </footer>
                </div>
            </main>
        </div>
    );
};

export default LandingPage;
