import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import Button from './Button';
import Card from './Card';
import Input from './Input';
import './SignupModal.css';

const SignupModal = ({ onClose, onSuccess }) => {
    const { register, confirmRegistration, login } = useAuth();

    // Form state
    const [step, setStep] = useState('signup'); // 'signup', 'verify', 'success'
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [verificationCode, setVerificationCode] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    // Password validation
    const hasMinLength = password.length >= 8;
    const hasUppercase = /[A-Z]/.test(password);
    const hasLowercase = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSymbol = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    const isPasswordValid = hasMinLength && hasUppercase && hasLowercase && hasNumber && hasSymbol;

    // Handle signup submit
    const handleSignup = async (e) => {
        e.preventDefault();
        setError('');

        // Validate passwords match
        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        // Validate password strength
        if (!isPasswordValid) {
            setError('Password must meet all requirements (including a symbol)');
            return;
        }

        setIsLoading(true);
        const result = await register(email, password, fullName);
        setIsLoading(false);

        if (result.success) {
            if (result.nextStep?.signUpStep === 'CONFIRM_SIGN_UP') {
                setStep('verify');
            } else if (result.isSignUpComplete) {
                // Auto-login and redirect
                await handleAutoLogin();
            }
        } else {
            setError(result.error || 'Failed to create account');
        }
    };

    // Handle verification code submit
    const handleVerify = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        const result = await confirmRegistration(email, verificationCode);

        if (result.success) {
            // Try auto-login after verification
            await handleAutoLogin();
        } else {
            setError(result.error || 'Invalid verification code');
            setIsLoading(false);
        }
    };

    // Auto-login after successful verification
    const handleAutoLogin = async () => {
        console.log('Attempting auto-login with:', email, password);
        const loginResult = await login(email, password);
        setIsLoading(false);

        if (loginResult.success) {
            console.log('Auto-login successful!');
            setStep('success');
            setTimeout(() => {
                onSuccess?.();
            }, 1500);
        } else {
            console.error('Auto-login failed:', loginResult.error);
            // If auto-login fails, still show success but with manual login option
            setError('Account created! Auto-login failed - please log in manually.');
            setStep('success');
        }
    };

    // Handle going to login after successful signup (fallback)
    const handleGoToLogin = () => {
        onClose(); // Close modal so they can use the login form on landing page
    };

    // Handle backdrop click
    const handleBackdropClick = (e) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    // Prevent modal close during loading
    const handleClose = () => {
        if (!isLoading) {
            onClose();
        }
    };

    return (
        <div className="modal-backdrop" onClick={handleBackdropClick}>
            <Card variant="elevated" padding="lg" className="signup-modal animate-scaleIn">
                {/* Close Button */}
                <button className="modal-close" onClick={handleClose} disabled={isLoading}>
                    ✕
                </button>

                {/* Signup Step */}
                {step === 'signup' && (
                    <>
                        <h2 className="modal-title">Create Account</h2>
                        <p className="modal-subtitle">Join RentGuard 360 today</p>

                        <form onSubmit={handleSignup} className="signup-form">
                            {error && <div className="error-message">{error}</div>}

                            <Input
                                type="text"
                                label="Full Name"
                                placeholder="John Doe"
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                                required
                                autoComplete="name"
                            />

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
                                placeholder="At least 8 characters"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                autoComplete="new-password"
                            />

                            <Input
                                type="password"
                                label="Confirm Password"
                                placeholder="Repeat your password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
                                autoComplete="new-password"
                            />

                            <div className="password-requirements">
                                <p>Password must contain:</p>
                                <ul>
                                    <li className={hasMinLength ? 'met' : ''}>At least 8 characters</li>
                                    <li className={hasUppercase ? 'met' : ''}>One uppercase letter</li>
                                    <li className={hasLowercase ? 'met' : ''}>One lowercase letter</li>
                                    <li className={hasNumber ? 'met' : ''}>One number</li>
                                    <li className={hasSymbol ? 'met' : ''}>One symbol (!@#$%^&* etc.)</li>
                                </ul>
                            </div>

                            <Button
                                type="submit"
                                variant="primary"
                                fullWidth
                                loading={isLoading}
                                disabled={isLoading || !fullName || !email || !password || !confirmPassword || !isPasswordValid}
                            >
                                {isLoading ? 'Creating account...' : 'Create Account'}
                            </Button>
                        </form>

                        <p className="modal-footer">
                            Already have an account?{' '}
                            <button type="button" className="link-button" onClick={onClose}>
                                Sign in
                            </button>
                        </p>
                    </>
                )}

                {/* Verification Step */}
                {step === 'verify' && (
                    <>
                        <h2 className="modal-title">Verify Your Email</h2>
                        <p className="modal-subtitle">
                            We sent a verification code to<br />
                            <strong>{email}</strong>
                        </p>

                        <form onSubmit={handleVerify} className="signup-form">
                            {error && <div className="error-message">{error}</div>}

                            <Input
                                type="text"
                                label="Verification Code"
                                placeholder="Enter 6-digit code"
                                value={verificationCode}
                                onChange={(e) => setVerificationCode(e.target.value)}
                                required
                                maxLength={6}
                                autoComplete="one-time-code"
                            />

                            <Button
                                type="submit"
                                variant="primary"
                                fullWidth
                                loading={isLoading}
                                disabled={isLoading || verificationCode.length < 6}
                            >
                                {isLoading ? 'Verifying...' : 'Verify Email'}
                            </Button>
                        </form>

                        <p className="modal-footer">
                            Didn't receive the code?{' '}
                            <button type="button" className="link-button" onClick={() => setStep('signup')}>
                                Try again
                            </button>
                        </p>
                    </>
                )}

                {/* Success Step */}
                {step === 'success' && (
                    <div className="success-content">
                        <div className="success-icon">✓</div>
                        <h2 className="modal-title">Welcome to RentGuard!</h2>
                        <p className="modal-subtitle">Your account has been created successfully.</p>

                        {error ? (
                            <>
                                <p className="success-hint" style={{ color: 'var(--text-secondary)' }}>
                                    {error}
                                </p>
                                <Button
                                    variant="primary"
                                    fullWidth
                                    onClick={handleGoToLogin}
                                    style={{ marginTop: '16px' }}
                                >
                                    Go to Login
                                </Button>
                            </>
                        ) : (
                            <p className="redirect-text">Redirecting to dashboard...</p>
                        )}
                    </div>
                )}
            </Card>
        </div>
    );
};

export default SignupModal;
