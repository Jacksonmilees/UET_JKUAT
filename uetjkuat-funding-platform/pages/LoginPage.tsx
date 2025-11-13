
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
                const mandatoryStatus = getMandatoryStatus(user.id);
                
                if (!mandatoryStatus.isCleared) {
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
            setJustLoggedIn(true);
        }
    };

    const handlePaymentSuccess = async () => {
        setShowPaymentModal(false);
        await refreshTransactions();
        setRoute({ page: 'dashboard' });
    };

    return (
        <AuthLayout title="Sign in to your account">
            <div className="rounded-lg bg-blue-50 border border-blue-100 p-4 mb-6">
                <h3 className="text-sm font-semibold text-blue-800 mb-2">UET JKUAT Member Reminder</h3>
                <ul className="list-disc list-inside text-xs text-blue-700 space-y-1">
                    <li>If you haven't completed your mandatory <span className="font-semibold">KES 100</span> term contribution, you'll be prompted to pay after signing in.</li>
                    <li>This is a one-time payment per term required for all members.</li>
                    <li>Additional contributions to projects are always welcome and appreciated.</li>
                    <li>Need help? Reach the finance team via <a href="mailto:finance@uetjkuat.org" className="underline">finance@uetjkuat.org</a>.</li>
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
                        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-300"
                    >
                        {isLoading ? 'Signing in...' : 'Sign in'}
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