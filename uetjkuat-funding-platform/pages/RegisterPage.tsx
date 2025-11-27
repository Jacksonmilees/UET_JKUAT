

import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Route, RegisterCredentials } from '../types';
import AuthLayout from '../components/common/AuthLayout';
import {
    Lock, Mail, User, Phone, Calendar,
    Book, Building, Hash, HeartHandshake, Home, Loader2
} from 'lucide-react';
import MandatoryPaymentModal from '../components/MandatoryPaymentModal';

interface RegisterPageProps {
    setRoute: (route: Route) => void;
}

const RegisterPage: React.FC<RegisterPageProps> = ({ setRoute }) => {
    const { register, isLoading, error } = useAuth();
    const [formData, setFormData] = useState<Omit<RegisterCredentials, 'password'>>({
        name: '', email: '', phoneNumber: '', yearOfStudy: 'First Year',
        course: '', college: '', admissionNumber: '', ministryInterest: '', residence: ''
    });
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [formError, setFormError] = useState('');
    const [showPaymentModal, setShowPaymentModal] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleFormSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setFormError('');

        if (Object.values(formData).some(val => val === '') || !password || !confirmPassword) {
            setFormError('Please fill in all fields.');
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

        // Register user first
        const success = await register({ ...formData, password });
        if (success) {
            // After successful registration, show payment modal
            setShowPaymentModal(true);
        }
    };

    const handlePaymentSuccess = async () => {
        // Payment successful, redirect to dashboard
        setShowPaymentModal(false);
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
                        className="block w-full pl-10 pr-3 py-2 border border-input rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary sm:text-sm transition-colors"
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
                        className="block w-full pl-10 pr-3 py-2 border border-input rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary sm:text-sm transition-colors"
                    />
                )}
            </div>
        </div>
    );

    return (
        <>
            <AuthLayout title="Create Account">
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
                                    className="block w-full pl-10 pr-3 py-2 border border-input rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary sm:text-sm transition-colors"
                                />
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
                                    className="block w-full pl-10 pr-3 py-2 border border-input rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary sm:text-sm transition-colors"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center justify-end pt-2">
                        <button type="button" onClick={() => setRoute({ page: 'login' })} className="text-sm font-medium text-primary hover:text-primary/80 transition-colors">Already have an account? Sign in</button>
                    </div>

                    <div>
                        <button type="submit" disabled={isLoading} className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-primary-foreground bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed transition-all">
                            {isLoading ? (
                                <span className="flex items-center gap-2">
                                    <Loader2 className="animate-spin h-4 w-4" />
                                    Processing...
                                </span>
                            ) : 'Create Account & Pay KES 100'}
                        </button>
                    </div>
                </form>
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