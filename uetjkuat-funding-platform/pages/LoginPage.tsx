
import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useFinance } from '../contexts/FinanceContext';
import { Route } from '../types';
import AuthLayout from '../components/common/AuthLayout';
import { IconLock, IconMail } from '../components/icons';
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
        <AuthLayout title="Welcome Back! 👋">
            <div className="rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 p-6 mb-6 shadow-sm">
                <h3 className="text-base font-bold text-blue-900 mb-3 flex items-center gap-2">
                    <span className="text-2xl">💡</span>
                    UET JKUAT Member Reminder
                </h3>
                <ul className="space-y-2 text-sm text-blue-800">
                    <li className="flex items-start gap-2">
                        <span className="text-blue-600 mt-0.5">•</span>
                        <span>If you haven't completed your mandatory <span className="font-bold bg-blue-200 px-2 py-0.5 rounded">KES 100</span> term contribution, you'll be prompted to pay after signing in.</span>
                    </li>
                    <li className="flex items-start gap-2">
                        <span className="text-blue-600 mt-0.5">•</span>
                        <span>This is a one-time payment per term required for all members.</span>
                    </li>
                    <li className="flex items-start gap-2">
                        <span className="text-blue-600 mt-0.5">•</span>
                        <span>Additional contributions to projects are always welcome and appreciated! 🙏</span>
                    </li>
                    <li className="flex items-start gap-2">
                        <span className="text-blue-600 mt-0.5">•</span>
                        <span>Need help? Reach the finance team via <a href="mailto:finance@uetjkuat.org" className="underline font-semibold hover:text-blue-600">finance@uetjkuat.org</a></span>
                    </li>
                </ul>
            </div>
            <form className="space-y-6" onSubmit={handleSubmit}>
                {(error || formError) && (
                    <div className="rounded-md bg-red-50 p-4">
                        <p className="text-sm font-medium text-red-800">{error || formError}</p>
                    </div>
                )}
                <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                        Email address
                    </label>
                    <div className="mt-1 relative rounded-md shadow-sm">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <IconMail className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                            id="email"
                            name="email"
                            type="email"
                            autoComplete="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="appearance-none block w-full px-3 py-2 pl-10 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        />
                    </div>
                </div>

                <div>
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                        Password
                    </label>
                    <div className="mt-1 relative rounded-md shadow-sm">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <IconLock className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                            id="password"
                            name="password"
                            type="password"
                            autoComplete="current-password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="appearance-none block w-full px-3 py-2 pl-10 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        />
                    </div>
                </div>

                <div className="flex items-center justify-between">
                    <div className="text-sm">
                        <button
                            type="button"
                            onClick={() => setRoute({ page: 'register' })}
                            className="font-medium text-blue-600 hover:text-blue-500"
                        >
                            Don't have an account? Register
                        </button>
                    </div>
                </div>

                <div>
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-lg text-base font-bold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] transition-all"
                    >
                        {isLoading ? (
                            <span className="flex items-center gap-2">
                                <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Signing in...
                            </span>
                        ) : 'Sign in to Dashboard →'}
                    </button>
                </div>
            </form>

            <MandatoryPaymentModal
                isOpen={showPaymentModal}
                onClose={() => {
                    setShowPaymentModal(false);
                    // Don't allow closing without payment - user must pay to access
                }}
                onSuccess={handlePaymentSuccess}
                isRegistration={false}
            />
        </AuthLayout>
    );
};

export default LoginPage;