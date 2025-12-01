import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useFinance } from '../contexts/FinanceContext';
import { Route } from '../types';
import AuthLayout from '../components/common/AuthLayout';
import { Lock, Mail, Info, Loader2, Smartphone, KeyRound } from 'lucide-react';
import MandatoryPaymentModal from '../components/MandatoryPaymentModal';
import { API_BASE_URL } from '../constants';

interface LoginPageProps {
    setRoute: (route: Route) => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ setRoute }) => {
    const { login, isLoading, error, user, setUser } = useAuth();
    const { getMandatoryStatus, refreshTransactions } = useFinance();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [formError, setFormError] = useState('');
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [justLoggedIn, setJustLoggedIn] = useState(false);
    const hasCheckedPayment = useRef(false);
    
    // OTP authentication states
    const [loginMethod, setLoginMethod] = useState<'password' | 'otp'>('password');
    const [identifier, setIdentifier] = useState(''); // Email or phone
    const [otpSent, setOtpSent] = useState(false);
    const [otp, setOtp] = useState('');
    const [otpLoading, setOtpLoading] = useState(false);
    const [otpError, setOtpError] = useState('');
    const [otpUser, setOtpUser] = useState<any>(null);
    const [resendTimer, setResendTimer] = useState(0);

    // Check mandatory contribution after login
    useEffect(() => {
        const checkMandatoryPayment = async () => {
            if (justLoggedIn && user && !hasCheckedPayment.current) {
                hasCheckedPayment.current = true;
                await refreshTransactions();
                const mandatoryStatus = await getMandatoryStatus(user.id);

                if (!mandatoryStatus.isCleared && user.role !== 'admin') {
                    setShowPaymentModal(true);
                } else {
                    setRoute({ page: 'dashboard' });
                }
                setJustLoggedIn(false);
            }
        };
        checkMandatoryPayment();
    }, [justLoggedIn, user, getMandatoryStatus, refreshTransactions, setRoute]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setFormError('');
        hasCheckedPayment.current = false;
        if (!email || !password) {
            setFormError('Please fill in all fields.');
            return;
        }

        const success = await login({ email, password });
        if (success) {
            // Route immediately, then run mandatory check in background
            if (email.toLowerCase() === 'admin@uetjkuat.com') {
                setRoute({ page: 'admin' });
            } else {
                setRoute({ page: 'dashboard' });
            }
            setJustLoggedIn(true);
        }
    };

    const handlePaymentSuccess = async () => {
        setShowPaymentModal(false);
        await refreshTransactions();
        setRoute({ page: 'dashboard' });
    };

    // OTP timer countdown
    useEffect(() => {
        if (resendTimer > 0) {
            const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
            return () => clearTimeout(timer);
        }
    }, [resendTimer]);

    // Request OTP
    const handleRequestOTP = async (e: React.FormEvent) => {
        e.preventDefault();
        setOtpError('');
        setFormError('');
        
        if (!identifier) {
            setOtpError('Please enter your email or phone number');
            return;
        }
        
        setOtpLoading(true);
        
        try {
            const response = await fetch(`${API_BASE_URL}/auth/otp/request`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ identifier })
            });
            
            const data = await response.json();
            
            if (data.success) {
                setOtpSent(true);
                setOtpUser(data.user);
                setResendTimer(60); // 60 seconds cooldown
                setOtpError('');
            } else {
                setOtpError(data.message || 'Failed to send OTP');
            }
        } catch (err) {
            setOtpError('Failed to send OTP. Please try again.');
        } finally {
            setOtpLoading(false);
        }
    };

    // Verify OTP and login
    const handleVerifyOTP = async (e: React.FormEvent) => {
        e.preventDefault();
        setOtpError('');
        
        if (!otp || otp.length !== 6) {
            setOtpError('Please enter a valid 6-digit OTP');
            return;
        }
        
        setOtpLoading(true);
        
        try {
            const response = await fetch(`${API_BASE_URL}/auth/otp/verify`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ identifier, otp })
            });
            
            const data = await response.json();
            
            if (data.success && data.user) {
                // Login successful
                setUser(data.user);
                localStorage.setItem('user', JSON.stringify(data.user));
                
                // Check admin role
                if (data.user.role === 'admin') {
                    setRoute({ page: 'admin' });
                } else {
                    setRoute({ page: 'dashboard' });
                }
                setJustLoggedIn(true);
            } else {
                setOtpError(data.message || 'Invalid OTP');
            }
        } catch (err) {
            setOtpError('Verification failed. Please try again.');
        } finally {
            setOtpLoading(false);
        }
    };

    // Resend OTP
    const handleResendOTP = () => {
        setOtp('');
        setOtpSent(false);
        setResendTimer(0);
    };

    // Switch login method
    const switchLoginMethod = () => {
        setLoginMethod(loginMethod === 'password' ? 'otp' : 'password');
        setFormError('');
        setOtpError('');
        setOtpSent(false);
        setOtp('');
        setIdentifier('');
        setEmail('');
        setPassword('');
    };

    return (
        <AuthLayout title={loginMethod === 'otp' ? 'Login with OTP' : 'Welcome Back'}>
            <div className="rounded-lg bg-secondary/50 border border-border p-4 mb-6">
                <h3 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
                    <Info className="w-4 h-4 text-primary" />
                    Member Reminder
                </h3>
                <ul className="space-y-1 text-xs text-muted-foreground list-disc list-inside">
                    <li>Mandatory term contribution: <span className="font-medium text-foreground">KES 100</span>.</li>
                    <li>One-time payment per term.</li>
                    <li>Additional contributions welcome.</li>
                </ul>
            </div>
            {/* Login Method Toggle */}
            <div className="flex gap-2 mb-6">
                <button
                    type="button"
                    onClick={() => setLoginMethod('password')}
                    className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all ${
                        loginMethod === 'password'
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-secondary text-muted-foreground hover:bg-secondary/80'
                    }`}
                >
                    <Lock className="w-4 h-4 inline mr-2" />
                    Password
                </button>
                <button
                    type="button"
                    onClick={() => setLoginMethod('otp')}
                    className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all ${
                        loginMethod === 'otp'
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-secondary text-muted-foreground hover:bg-secondary/80'
                    }`}
                >
                    <Smartphone className="w-4 h-4 inline mr-2" />
                    OTP
                </button>
            </div>

            {loginMethod === 'password' ? (
                <form className="space-y-4" onSubmit={handleSubmit}>
                {(error || formError) && (
                    <div className="rounded-lg bg-destructive/10 p-3">
                        <p className="text-sm font-medium text-destructive">{error || formError}</p>
                    </div>
                )}
                <div>
                    <label htmlFor="email" className="block text-sm font-medium text-foreground mb-1">
                        Email
                    </label>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Mail className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <input
                            id="email"
                            name="email"
                            type="email"
                            autoComplete="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="block w-full pl-10 pr-3 py-2 border border-input rounded-lg bg-background text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary sm:text-sm transition-colors"
                            placeholder="Enter your email"
                        />
                    </div>
                </div>

                <div>
                    <label htmlFor="password" className="block text-sm font-medium text-foreground mb-1">
                        Password
                    </label>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Lock className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <input
                            id="password"
                            name="password"
                            type="password"
                            autoComplete="current-password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="block w-full pl-10 pr-3 py-2 border border-input rounded-lg bg-background text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary sm:text-sm transition-colors"
                            placeholder="Enter your password"
                        />
                    </div>
                </div>

                <div className="flex items-center justify-between">
                    <button
                        type="button"
                        onClick={() => setRoute({ page: 'forgot-password' })}
                        className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                    >
                        Forgot password?
                    </button>
                    <button
                        type="button"
                        onClick={() => setRoute({ page: 'register' })}
                        className="text-sm font-medium text-primary hover:text-primary/80 transition-colors"
                    >
                        Create account
                    </button>
                </div>

                <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-primary-foreground bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                    {isLoading ? (
                        <span className="flex items-center gap-2">
                            <Loader2 className="animate-spin h-4 w-4" />
                            Signing in...
                        </span>
                    ) : 'Sign In'}
                </button>
            </form>
            ) : (
                <form className="space-y-4" onSubmit={otpSent ? handleVerifyOTP : handleRequestOTP}>
                    {otpError && (
                        <div className="rounded-lg bg-destructive/10 p-3">
                            <p className="text-sm font-medium text-destructive">{otpError}</p>
                        </div>
                    )}
                    
                    {!otpSent ? (
                        <>
                            <div>
                                <label htmlFor="identifier" className="block text-sm font-medium text-foreground mb-1">
                                    Email or Phone Number
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Mail className="h-4 w-4 text-muted-foreground" />
                                    </div>
                                    <input
                                        id="identifier"
                                        name="identifier"
                                        type="text"
                                        required
                                        value={identifier}
                                        onChange={(e) => setIdentifier(e.target.value)}
                                        className="block w-full pl-10 pr-3 py-2 border border-input rounded-lg bg-background text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary sm:text-sm transition-colors"
                                        placeholder="Enter email or phone number"
                                    />
                                </div>
                                <p className="mt-1 text-xs text-muted-foreground">
                                    We'll send a 6-digit code to your WhatsApp
                                </p>
                            </div>

                            <button
                                type="submit"
                                disabled={otpLoading}
                                className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-primary-foreground bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                            >
                                {otpLoading ? (
                                    <span className="flex items-center gap-2">
                                        <Loader2 className="animate-spin h-4 w-4" />
                                        Sending OTP...
                                    </span>
                                ) : (
                                    <span className="flex items-center gap-2">
                                        <Smartphone className="h-4 w-4" />
                                        Send OTP
                                    </span>
                                )}
                            </button>
                        </>
                    ) : (
                        <>
                            <div className="rounded-lg bg-primary/10 border border-primary/20 p-4 mb-4">
                                <p className="text-sm text-foreground">
                                    OTP sent to <span className="font-semibold">{otpUser?.phoneNumber || identifier}</span>
                                </p>
                                <p className="text-xs text-muted-foreground mt-1">
                                    Check your WhatsApp for the verification code
                                </p>
                            </div>

                            <div>
                                <label htmlFor="otp" className="block text-sm font-medium text-foreground mb-1">
                                    Enter OTP Code
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <KeyRound className="h-4 w-4 text-muted-foreground" />
                                    </div>
                                    <input
                                        id="otp"
                                        name="otp"
                                        type="text"
                                        inputMode="numeric"
                                        maxLength={6}
                                        required
                                        value={otp}
                                        onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                                        className="block w-full pl-10 pr-3 py-2 border border-input rounded-lg bg-background text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary sm:text-sm transition-colors text-center text-2xl tracking-widest font-mono"
                                        placeholder="000000"
                                        autoComplete="one-time-code"
                                    />
                                </div>
                            </div>

                            <div className="flex items-center justify-between text-sm">
                                <button
                                    type="button"
                                    onClick={handleResendOTP}
                                    disabled={resendTimer > 0}
                                    className="text-primary hover:text-primary/80 disabled:text-muted-foreground disabled:cursor-not-allowed transition-colors"
                                >
                                    {resendTimer > 0 ? `Resend in ${resendTimer}s` : 'Resend OTP'}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setOtpSent(false)}
                                    className="text-muted-foreground hover:text-foreground transition-colors"
                                >
                                    Change number
                                </button>
                            </div>

                            <button
                                type="submit"
                                disabled={otpLoading || otp.length !== 6}
                                className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-primary-foreground bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                            >
                                {otpLoading ? (
                                    <span className="flex items-center gap-2">
                                        <Loader2 className="animate-spin h-4 w-4" />
                                        Verifying...
                                    </span>
                                ) : 'Verify & Login'}
                            </button>
                        </>
                    )}
                </form>
            )}

            <MandatoryPaymentModal
                isOpen={showPaymentModal}
                onClose={() => {
                    setShowPaymentModal(false);
                }}
                onSuccess={handlePaymentSuccess}
                isRegistration={false}
            />
        </AuthLayout>
    );
};

export default LoginPage;