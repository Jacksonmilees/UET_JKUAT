import React, { useState, useEffect } from 'react';
import { Route } from '../types';
import AuthLayout from '../components/common/AuthLayout';
import { Mail, Smartphone, KeyRound, ArrowLeft, Loader2 } from 'lucide-react';
import { API_BASE_URL } from '../constants';

interface ForgotPasswordPageProps {
    setRoute: (route: Route) => void;
}

const ForgotPasswordPage: React.FC<ForgotPasswordPageProps> = ({ setRoute }) => {
    const [step, setStep] = useState<'request' | 'verify' | 'reset'>('request');
    const [identifier, setIdentifier] = useState('');
    const [otp, setOtp] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [resendTimer, setResendTimer] = useState(0);
    const [userId, setUserId] = useState<number | null>(null);

    // Resend timer
    useEffect(() => {
        if (resendTimer > 0) {
            const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
            return () => clearTimeout(timer);
        }
    }, [resendTimer]);

    const handleRequestOTP = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setLoading(true);

        try {
            const response = await fetch(`${API_BASE_URL}/auth/otp/request`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ identifier })
            });

            const data = await response.json();

            if (data.success) {
                setUserId(data.user.id);
                setStep('verify');
                setSuccess(`OTP sent to your WhatsApp (${data.user.phoneNumber})`);
                setResendTimer(60);
            } else {
                setError(data.message || 'Failed to send OTP');
            }
        } catch (err) {
            setError('Network error. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOTP = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setLoading(true);

        try {
            const response = await fetch(`${API_BASE_URL}/auth/otp/verify`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ identifier, otp })
            });

            const data = await response.json();

            if (data.success) {
                setStep('reset');
                setSuccess('OTP verified! Set your new password.');
            } else {
                setError(data.message || 'Invalid OTP');
            }
        } catch (err) {
            setError('Network error. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (newPassword !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        if (newPassword.length < 6) {
            setError('Password must be at least 6 characters');
            return;
        }

        setLoading(true);

        try {
            const response = await fetch(`${API_BASE_URL}/auth/reset-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    identifier,
                    otp,
                    newPassword
                })
            });

            const data = await response.json();

            if (data.success) {
                setSuccess('Password reset successful! Redirecting to login...');
                setTimeout(() => setRoute({ page: 'login' }), 2000);
            } else {
                setError(data.message || 'Failed to reset password');
            }
        } catch (err) {
            setError('Network error. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <AuthLayout title="Reset Password">
            <div className="w-full max-w-md space-y-6">
                <div className="text-center">
                    <h1 className="text-3xl font-bold text-foreground">Reset Password</h1>
                    <p className="mt-2 text-muted-foreground">
                        {step === 'request' && 'Enter your email or phone number'}
                        {step === 'verify' && 'Enter the OTP sent to your WhatsApp'}
                        {step === 'reset' && 'Create a new password'}
                    </p>
                </div>

                {/* Step 1: Request OTP */}
                {step === 'request' && (
                    <form className="space-y-4" onSubmit={handleRequestOTP}>
                        {error && (
                            <div className="rounded-lg bg-destructive/10 p-3">
                                <p className="text-sm font-medium text-destructive">{error}</p>
                            </div>
                        )}

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-foreground">
                                Email or Phone Number
                            </label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                                <input
                                    type="text"
                                    value={identifier}
                                    onChange={(e) => setIdentifier(e.target.value)}
                                    className="w-full rounded-lg border border-input bg-background pl-10 pr-4 py-2 text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                                    placeholder="email@example.com or 254712345678"
                                    required
                                    disabled={loading}
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading || !identifier}
                            className="w-full rounded-lg bg-primary px-4 py-2 font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="h-5 w-5 animate-spin" />
                                    Sending OTP...
                                </>
                            ) : (
                                <>
                                    <Smartphone className="h-5 w-5" />
                                    Send OTP via WhatsApp
                                </>
                            )}
                        </button>

                        <button
                            type="button"
                            onClick={() => setRoute({ page: 'login' })}
                            className="w-full flex items-center justify-center gap-2 text-sm text-muted-foreground hover:text-foreground"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            Back to Login
                        </button>
                    </form>
                )}

                {/* Step 2: Verify OTP */}
                {step === 'verify' && (
                    <form className="space-y-4" onSubmit={handleVerifyOTP}>
                        {error && (
                            <div className="rounded-lg bg-destructive/10 p-3">
                                <p className="text-sm font-medium text-destructive">{error}</p>
                            </div>
                        )}

                        {success && (
                            <div className="rounded-lg bg-green-500/10 p-3">
                                <p className="text-sm font-medium text-green-600">{success}</p>
                            </div>
                        )}

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-foreground">
                                Enter OTP Code
                            </label>
                            <div className="relative">
                                <KeyRound className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                                <input
                                    type="text"
                                    value={otp}
                                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                    className="w-full rounded-lg border border-input bg-background pl-10 pr-4 py-2 text-foreground text-center text-2xl tracking-widest font-mono placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                                    placeholder="000000"
                                    maxLength={6}
                                    required
                                    disabled={loading}
                                />
                            </div>
                            <p className="text-xs text-muted-foreground text-center">
                                Check your WhatsApp for the 6-digit code
                            </p>
                        </div>

                        <button
                            type="submit"
                            disabled={loading || otp.length !== 6}
                            className="w-full rounded-lg bg-primary px-4 py-2 font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="h-5 w-5 animate-spin" />
                                    Verifying...
                                </>
                            ) : (
                                'Verify OTP'
                            )}
                        </button>

                        <button
                            type="button"
                            onClick={handleRequestOTP}
                            disabled={resendTimer > 0 || loading}
                            className="w-full text-sm text-muted-foreground hover:text-foreground disabled:opacity-50"
                        >
                            {resendTimer > 0 ? `Resend OTP in ${resendTimer}s` : 'Resend OTP'}
                        </button>
                    </form>
                )}

                {/* Step 3: Reset Password */}
                {step === 'reset' && (
                    <form className="space-y-4" onSubmit={handleResetPassword}>
                        {error && (
                            <div className="rounded-lg bg-destructive/10 p-3">
                                <p className="text-sm font-medium text-destructive">{error}</p>
                            </div>
                        )}

                        {success && (
                            <div className="rounded-lg bg-green-500/10 p-3">
                                <p className="text-sm font-medium text-green-600">{success}</p>
                            </div>
                        )}

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-foreground">
                                New Password
                            </label>
                            <input
                                type="password"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                className="w-full rounded-lg border border-input bg-background px-4 py-2 text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                                placeholder="Enter new password"
                                required
                                disabled={loading}
                                minLength={6}
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-foreground">
                                Confirm Password
                            </label>
                            <input
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="w-full rounded-lg border border-input bg-background px-4 py-2 text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                                placeholder="Confirm new password"
                                required
                                disabled={loading}
                                minLength={6}
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading || !newPassword || !confirmPassword}
                            className="w-full rounded-lg bg-primary px-4 py-2 font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="h-5 w-5 animate-spin" />
                                    Resetting Password...
                                </>
                            ) : (
                                'Reset Password'
                            )}
                        </button>
                    </form>
                )}
            </div>
        </AuthLayout>
    );
};

export default ForgotPasswordPage;
