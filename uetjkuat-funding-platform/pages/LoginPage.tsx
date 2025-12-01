import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useFinance } from '../contexts/FinanceContext';
import { Route } from '../types';
import AuthLayout from '../components/common/AuthLayout';
import { Lock, Mail, Info, Loader2 } from 'lucide-react';
import MandatoryPaymentModal from '../components/MandatoryPaymentModal';

interface LoginPageProps {
    setRoute: (route: Route) => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ setRoute }) => {
    const { login, isLoading, error, user } = useAuth();
    const { getMandatoryStatus, refreshTransactions } = useFinance();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [formError, setFormError] = useState('');
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [justLoggedIn, setJustLoggedIn] = useState(false);
    const hasCheckedPayment = useRef(false);

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

    return (
        <AuthLayout title="Welcome Back">
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

                <div className="flex items-center justify-end">
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