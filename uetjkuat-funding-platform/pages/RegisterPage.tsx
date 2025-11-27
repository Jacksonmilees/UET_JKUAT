

import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Route, RegisterCredentials } from '../types';
import AuthLayout from '../components/common/AuthLayout';
import { 
    IconLock, IconMail, IconUser, IconPhone, IconCalendar, 
    IconBook, IconBuilding, IconHash, IconHeartHand, IconHome 
} from '../components/icons';
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
            <label htmlFor={id} className="block text-sm font-medium text-gray-700">{label}</label>
            <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">{icon}</div>
                {type === 'select' ? (
                    <select id={id} name={id} required value={formData[id]} onChange={handleChange} className="appearance-none block w-full px-3 py-2 pl-10 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm">
                        {options?.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                    </select>
                ) : (
                    <input id={id} name={id} type={type} required value={formData[id]} onChange={handleChange} className="appearance-none block w-full px-3 py-2 pl-10 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
                )}
            </div>
        </div>
    );
    
    return (
        <>
            <AuthLayout title="Create a new account">
                <form className="space-y-4" onSubmit={handleFormSubmit}>
                    {(error || formError) && (
                        <div className="rounded-md bg-red-50 p-4">
                            <p className="text-sm font-medium text-red-800">{error || formError}</p>
                        </div>
                    )}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {renderInput('name', 'Full Name', 'text', <IconUser className="h-5 w-5 text-gray-400" />)}
                        {renderInput('email', 'Email Address', 'email', <IconMail className="h-5 w-5 text-gray-400" />)}
                        {renderInput('phoneNumber', 'Phone Number', 'tel', <IconPhone className="h-5 w-5 text-gray-400" />)}
                        {renderInput('yearOfStudy', 'Year of Study', 'select', <IconCalendar className="h-5 w-5 text-gray-400" />, ['First Year', 'Second Year', 'Third Year', 'Fourth Year', 'Fifth Year+', 'Alumni'])}
                        {renderInput('course', 'Course', 'text', <IconBook className="h-5 w-5 text-gray-400" />)}
                        {renderInput('college', 'College/School', 'text', <IconBuilding className="h-5 w-5 text-gray-400" />)}
                        {renderInput('admissionNumber', 'Admission Number', 'text', <IconHash className="h-5 w-5 text-gray-400" />)}
                        {renderInput('ministryInterest', 'Area of Interest in Ministry', 'text', <IconHeartHand className="h-5 w-5 text-gray-400" />)}
                        <div className="md:col-span-2">{renderInput('residence', 'Homestay/Residence', 'text', <IconHome className="h-5 w-5 text-gray-400" />)}</div>
                        
                        <div className="md:col-span-2"><hr/></div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">Password</label>
                            <div className="mt-1 relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><IconLock className="h-5 w-5 text-gray-400" /></div>
                                <input id="password" name="password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="appearance-none block w-full px-3 py-2 pl-10 border border-gray-300 rounded-md shadow-sm" />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Confirm Password</label>
                            <div className="mt-1 relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><IconLock className="h-5 w-5 text-gray-400" /></div>
                                <input id="confirm-password" name="confirm-password" type="password" required value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="appearance-none block w-full px-3 py-2 pl-10 border border-gray-300 rounded-md shadow-sm" />
                            </div>
                        </div>
                    </div>
                    
                    <div className="flex items-center justify-between pt-2">
                        <div className="text-sm">
                            <button type="button" onClick={() => setRoute({ page: 'login' })} className="font-medium text-blue-600 hover:text-blue-500">Already have an account? Sign in</button>
                        </div>
                    </div>

                    <div>
                        <button type="submit" disabled={isLoading} className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-lg text-base font-bold text-white bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] transition-all">
                            {isLoading ? (
                                <span className="flex items-center gap-2">
                                    <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Processing...
                                </span>
                            ) : 'Create Account & Pay KES 100 →'}
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