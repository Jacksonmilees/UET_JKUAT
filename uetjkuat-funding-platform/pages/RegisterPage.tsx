

import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useFinance } from '../contexts/FinanceContext';
import { Route, RegisterCredentials } from '../types';
import AuthLayout from '../components/common/AuthLayout';
import {
    Lock, Mail, User, Phone, Calendar,
    Book, Building, Hash, HeartHandshake, Home, Loader2, KeyRound, Smartphone, ShieldCheck
} from 'lucide-react';
import { API_BASE_URL } from '../constants';
import MandatoryPaymentModal from '../components/MandatoryPaymentModal';

interface RegisterPageProps {
    setRoute: (route: Route) => void;
}

const RegisterPage: React.FC<RegisterPageProps> = ({ setRoute }) => {
    const { register, isLoading, error, refreshUser } = useAuth();
    const { refreshMandatoryStatus } = useFinance();
    const [formData, setFormData] = useState<Omit<RegisterCredentials, 'password'>>({
        name: '', email: '', phoneNumber: '', yearOfStudy: 'First Year',
        course: '', college: '', admissionNumber: '', ministryInterest: '', residence: ''
    });
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [formError, setFormError] = useState('');
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    
    // OTP states
    const [step, setStep] = useState<'form' | 'otp'>('form');
    const [otp, setOtp] = useState('');
    const [otpLoading, setOtpLoading] = useState(false);
    const [otpError, setOtpError] = useState('');
    const [resendTimer, setResendTimer] = useState(0);

    // Resend timer
    useEffect(() => {
        if (resendTimer > 0) {
            const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
            return () => clearTimeout(timer);
        }
    }, [resendTimer]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleFormSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setFormError('');
        setOtpError('');

        const trimmedPhone = formData.phoneNumber.trim();
        const isValidPhone = /^(0|254)\d{9}$/.test(trimmedPhone.replace(/\s|\+/g, ''));

        if (Object.values(formData).some(val => val === '') || !password || !confirmPassword) {
            setFormError('Please fill in all fields.');
            return;
        }
        if (!isValidPhone) {
            setFormError('Enter a valid Safaricom number (2547XXXXXXXX or 07XXXXXXXX).');
            return;
        }
        if (password !== confirmPassword) {
            setFormError('Passwords do not match.');
            return;
        }
        if (password.length < 6) {
            setFormError('Password must be at least 6 characters long.');
            return;
        }

        // Send OTP to phone number
        setOtpLoading(true);
        try {
            const response = await fetch(`${API_BASE_URL}/auth/otp/request`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ identifier: trimmedPhone })
            });

            const data = await response.json();

            if (data.success) {
                setStep('otp');
                setResendTimer(60);
            } else {
                setFormError(data.message || 'Failed to send OTP. Please check your phone number.');
            }
        } catch (err) {
            setFormError('Network error. Please try again.');
        } finally {
            setOtpLoading(false);
        }
    };

    const handleVerifyOTP = async (e: React.FormEvent) => {
        e.preventDefault();
        setOtpError('');
        setOtpLoading(true);

        try {
            // Verify OTP
            const verifyResponse = await fetch(`${API_BASE_URL}/auth/otp/verify`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ identifier: formData.phoneNumber, otp })
            });

            const verifyData = await verifyResponse.json();

            if (verifyData.success) {
                // OTP verified, now register user
                console.log('Registering with data:', { ...formData, password: '***' });
                const success = await register({ ...formData, password });
                if (success) {
                    await refreshUser();
                    await refreshMandatoryStatus();
                    setShowPaymentModal(true);
                } else {
                    // Registration failed, show error from AuthContext
                    setOtpError('Registration failed. Please check the form and try again.');
                }
            } else {
                setOtpError(verifyData.message || 'Invalid OTP');
            }
        } catch (err) {
            setOtpError('Network error. Please try again.');
        } finally {
            setOtpLoading(false);
        }
    };

    const handleResendOTP = async () => {
        setOtpError('');
        setOtpLoading(true);

        try {
            const response = await fetch(`${API_BASE_URL}/auth/otp/request`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ identifier: formData.phoneNumber })
            });

            const data = await response.json();

            if (data.success) {
                setResendTimer(60);
                setOtpError('');
            } else {
                setOtpError(data.message || 'Failed to resend OTP');
            }
        } catch (err) {
            setOtpError('Network error. Please try again.');
        } finally {
            setOtpLoading(false);
        }
    };

    const handlePaymentSuccess = async () => {
        // Payment successful, redirect to dashboard
        setShowPaymentModal(false);
        await refreshUser();
        await refreshMandatoryStatus();
        setRoute({ page: 'dashboard' });
    };

    const renderInput = (id: keyof Omit<RegisterCredentials, 'password'>, label: string, type: string, icon: React.ReactNode, options?: string[]) => (
        <div>
            <label htmlFor={id} className="block text-sm font-medium text-foreground mb-1">{label}</label>
            <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">{icon}</div>
                {type === 'select' ? (
                    <select
                        id={id}
                        name={id}
                        required
                        value={formData[id]}
                        onChange={handleChange}
                        className="block w-full pl-10 pr-3 py-2 border border-input rounded-lg bg-background text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary sm:text-sm transition-colors"
                    >
                        {options?.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                    </select>
                ) : (
                    <input
                        id={id}
                        name={id}
                        type={type}
                        required
                        value={formData[id]}
                        onChange={handleChange}
                        className="block w-full pl-10 pr-3 py-2 border border-input rounded-lg bg-background text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary sm:text-sm transition-colors"
                    />
                )}
            </div>
        </div>
    );

    return (
        <>
            <AuthLayout title="Create Account">
                <div className="rounded-lg bg-secondary/50 border border-border p-4 mb-6">
                    <h3 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
                        <ShieldCheck className="w-4 h-4 text-primary" />
                        Quick checklist
                    </h3>
                    <ul className="space-y-1 text-xs text-muted-foreground list-disc list-inside">
                        <li>Use your WhatsApp Safaricom number (2547XXXXXXXX or 07XXXXXXXX).</li>
                        <li>Mandatory term contribution of KES 100 will be requested after account creation.</li>
                        <li>Keep your admission details handy; they are required for verification.</li>
                    </ul>
                </div>
                {step === 'form' ? (
                <form className="space-y-4" onSubmit={handleFormSubmit}>
                    {(error || formError) && (
                        <div className="rounded-lg bg-destructive/10 p-3">
                            <p className="text-sm font-medium text-destructive">{error || formError}</p>
                        </div>
                    )}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {renderInput('name', 'Full Name', 'text', <User className="h-4 w-4 text-muted-foreground" />)}
                        {renderInput('email', 'Email Address', 'email', <Mail className="h-4 w-4 text-muted-foreground" />)}
                        {renderInput('phoneNumber', 'Phone Number', 'tel', <Phone className="h-4 w-4 text-muted-foreground" />)}
                        {renderInput('yearOfStudy', 'Year of Study', 'select', <Calendar className="h-4 w-4 text-muted-foreground" />, ['First Year', 'Second Year', 'Third Year', 'Fourth Year', 'Fifth Year+', 'Alumni'])}
                        {renderInput('course', 'Course', 'text', <Book className="h-4 w-4 text-muted-foreground" />)}
                        {renderInput('college', 'College/School', 'text', <Building className="h-4 w-4 text-muted-foreground" />)}
                        {renderInput('admissionNumber', 'Admission Number', 'text', <Hash className="h-4 w-4 text-muted-foreground" />)}
                        {renderInput('ministryInterest', 'Ministry Interest', 'text', <HeartHandshake className="h-4 w-4 text-muted-foreground" />)}
                        <div className="md:col-span-2">{renderInput('residence', 'Residence', 'text', <Home className="h-4 w-4 text-muted-foreground" />)}</div>

                        <div className="md:col-span-2 border-t border-border my-2"></div>

                        <div>
                            <label className="block text-sm font-medium text-foreground mb-1">Password</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><Lock className="h-4 w-4 text-muted-foreground" /></div>
                                <input
                                    id="password"
                                    name="password"
                                    type="password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="block w-full pl-10 pr-3 py-2 border border-input rounded-lg bg-background text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary sm:text-sm transition-colors"
                                />
                                <p className="text-xs text-muted-foreground mt-1">Minimum 6 characters; include numbers for stronger security.</p>
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-foreground mb-1">Confirm Password</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><Lock className="h-4 w-4 text-muted-foreground" /></div>
                                <input
                                    id="confirm-password"
                                    name="confirm-password"
                                    type="password"
                                    required
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    className="block w-full pl-10 pr-3 py-2 border border-input rounded-lg bg-background text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary sm:text-sm transition-colors"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center justify-end pt-2">
                        <button type="button" onClick={() => setRoute({ page: 'login' })} className="text-sm font-medium text-primary hover:text-primary/80 transition-colors">Already have an account? Sign in</button>
                    </div>

                    <div>
                        <button type="submit" disabled={otpLoading} className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-primary-foreground bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed transition-all">
                            {otpLoading ? (
                                <span className="flex items-center gap-2">
                                    <Loader2 className="animate-spin h-4 w-4" />
                                    Sending OTP...
                                </span>
                            ) : (
                                <span className="flex items-center gap-2">
                                    <Smartphone className="h-4 w-4" />
                                    Continue with WhatsApp OTP
                                </span>
                            )}
                        </button>
                    </div>
                </form>
                ) : (
                <form className="space-y-4" onSubmit={handleVerifyOTP}>
                    {(otpError || error) && (
                        <div className="rounded-lg bg-destructive/10 p-3">
                            <p className="text-sm font-medium text-destructive">{otpError || error}</p>
                        </div>
                    )}

                    <div className="rounded-lg bg-green-500/10 p-3">
                        <p className="text-sm font-medium text-green-600">
                            OTP sent to {formData.phoneNumber} via WhatsApp
                        </p>
                    </div>

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
                                disabled={otpLoading}
                            />
                        </div>
                        <p className="text-xs text-muted-foreground text-center">
                            Check your WhatsApp for the 6-digit code
                        </p>
                    </div>

                    <button
                        type="submit"
                        disabled={otpLoading || otp.length !== 6}
                        className="w-full rounded-lg bg-primary px-4 py-2 font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {otpLoading || isLoading ? (
                            <>
                                <Loader2 className="h-5 w-5 animate-spin" />
                                {isLoading ? 'Creating Account...' : 'Verifying...'}
                            </>
                        ) : (
                            'Verify & Create Account'
                        )}
                    </button>

                    <button
                        type="button"
                        onClick={handleResendOTP}
                        disabled={resendTimer > 0 || otpLoading}
                        className="w-full text-sm text-muted-foreground hover:text-foreground disabled:opacity-50"
                    >
                        {resendTimer > 0 ? `Resend OTP in ${resendTimer}s` : 'Resend OTP'}
                    </button>

                    <button
                        type="button"
                        onClick={() => setStep('form')}
                        className="w-full text-sm text-muted-foreground hover:text-foreground"
                    >
                        ← Back to form
                    </button>
                </form>
                )}
            </AuthLayout>

            <MandatoryPaymentModal
                isOpen={showPaymentModal}
                onClose={() => setShowPaymentModal(false)}
                onSuccess={handlePaymentSuccess}
                isRegistration={true}
            />
        </>
    );
};

export default RegisterPage;