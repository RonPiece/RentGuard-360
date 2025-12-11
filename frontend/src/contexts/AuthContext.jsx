import React, { createContext, useContext, useState, useEffect } from 'react';
import {
    signIn,
    signUp,
    signOut,
    getCurrentUser,
    fetchUserAttributes,
    confirmSignUp,
    resetPassword,
    confirmResetPassword
} from 'aws-amplify/auth';

// Create the Auth Context
const AuthContext = createContext(null);

// Custom hook to use auth context
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

// Auth Provider Component
export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [userAttributes, setUserAttributes] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    // Check for existing session on mount
    useEffect(() => {
        checkAuthState();
    }, []);

    // Check current authentication state
    const checkAuthState = async () => {
        try {
            setIsLoading(true);
            const currentUser = await getCurrentUser();
            const attributes = await fetchUserAttributes();

            setUser(currentUser);
            setUserAttributes(attributes);
            setIsAuthenticated(true);
        } catch (error) {
            // No authenticated user
            setUser(null);
            setUserAttributes(null);
            setIsAuthenticated(false);
        } finally {
            setIsLoading(false);
        }
    };

    // Sign in function
    const login = async (email, password) => {
        try {
            // First, sign out any existing session to avoid conflicts
            try {
                await signOut();
            } catch (e) {
                // Ignore signOut errors - user might not be signed in
            }

            console.log('Attempting login for:', email);
            console.log('Password length:', password.length);

            // Use USER_PASSWORD_AUTH instead of USER_SRP_AUTH for web apps
            // Based on AWS lab best practices
            const signInResult = await signIn({
                username: email,
                password,
                options: {
                    authFlowType: 'USER_PASSWORD_AUTH'
                }
            });

            console.log('Login result:', JSON.stringify(signInResult, null, 2));

            const { isSignedIn, nextStep } = signInResult;

            if (isSignedIn) {
                await checkAuthState();
                return { success: true };
            }

            // Handle next step if not signed in
            console.log('Next step required:', nextStep);
            return { success: false, nextStep };
        } catch (error) {
            console.error('Login error:', error);
            console.error('Error name:', error.name);
            console.error('Error message:', error.message);
            console.error('Full error object:', JSON.stringify(error, null, 2));
            return {
                success: false,
                error: error.message || 'Failed to sign in'
            };
        }
    };

    // Sign up function
    const register = async (email, password, name) => {
        try {
            const { isSignUpComplete, userId, nextStep } = await signUp({
                username: email,
                password,
                options: {
                    userAttributes: {
                        email,
                        name: name,
                    },
                },
            });

            return {
                success: true,
                isSignUpComplete,
                userId,
                nextStep
            };
        } catch (error) {
            console.error('Signup error:', error);
            return {
                success: false,
                error: error.message || 'Failed to sign up'
            };
        }
    };

    // Confirm sign up with verification code
    const confirmRegistration = async (email, code) => {
        try {
            const { isSignUpComplete } = await confirmSignUp({
                username: email,
                confirmationCode: code,
            });

            return { success: true, isSignUpComplete };
        } catch (error) {
            console.error('Confirm signup error:', error);
            return {
                success: false,
                error: error.message || 'Failed to confirm sign up'
            };
        }
    };

    // Sign out function
    const logout = async () => {
        try {
            await signOut();
            setUser(null);
            setUserAttributes(null);
            setIsAuthenticated(false);
            return { success: true };
        } catch (error) {
            console.error('Logout error:', error);
            return {
                success: false,
                error: error.message || 'Failed to sign out'
            };
        }
    };

    // Request password reset
    const requestPasswordReset = async (email) => {
        try {
            const output = await resetPassword({ username: email });
            return { success: true, nextStep: output.nextStep };
        } catch (error) {
            console.error('Password reset error:', error);
            return {
                success: false,
                error: error.message || 'Failed to request password reset'
            };
        }
    };

    // Confirm password reset with code
    const confirmPasswordReset = async (email, code, newPassword) => {
        try {
            await confirmResetPassword({
                username: email,
                confirmationCode: code,
                newPassword,
            });
            return { success: true };
        } catch (error) {
            console.error('Confirm password reset error:', error);
            return {
                success: false,
                error: error.message || 'Failed to reset password'
            };
        }
    };

    // Context value
    const value = {
        user,
        userAttributes,
        isLoading,
        isAuthenticated,
        login,
        register,
        confirmRegistration,
        logout,
        requestPasswordReset,
        confirmPasswordReset,
        checkAuthState,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export default AuthContext;
