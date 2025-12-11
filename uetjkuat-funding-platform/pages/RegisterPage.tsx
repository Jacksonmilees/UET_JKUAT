import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../contexts/NotificationContext';
import MandatoryPaymentModal from '../components/MandatoryPaymentModal';
import { User, Mail, Phone, Lock, GraduationCap, Building, BookOpen, Home, Heart, ChevronRight, ChevronLeft, CheckCircle, Eye, EyeOff, Loader2, CreditCard, Smartphone } from 'lucide-react';
import { Route } from '../types';
import { API_BASE_URL } from '../constants';
import { mpesaApi } from '../services/api';

interface RegisterPageProps {
  setRoute: (route: Route) => void;
}

// Step configuration
const steps = [
  { id: 1, title: 'Personal Info', description: 'Your basic details' },
  { id: 2, title: 'Academic Info', description: 'University details' },
];

// Year options
const yearOptions = ['1st Year', '2nd Year', '3rd Year', '4th Year', '5th Year', '6th Year', 'Alumni'];

// Ministry options
const ministryOptions = [
  'Praise & Worship', 'Ushering', 'Media', 'Intercessory', 
  'Creative Arts', 'Hospitality', 'Evangelism', 'Not Sure Yet'
];

// College options
const collegeOptions = [
  'COHES', 'COED', 'COHRED', 'COPAS', 'COETEC', 'SODEL'
];

const RegisterPage: React.FC<RegisterPageProps> = ({ setRoute }) => {
  const { register, isLoading: authLoading, error: authError, user } = useAuth();
  const { showSuccess, showError } = useNotification();
  
  // Multi-step form state
  const [currentStep, setCurrentStep] = useState(1);
  const [showOtpVerification, setShowOtpVerification] = useState(false);
  const [showPaymentStep, setShowPaymentStep] = useState(false);
  const [showMandatoryPayment, setShowMandatoryPayment] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Password visibility
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  // OTP state
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [otpLoading, setOtpLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  
  // Payment state
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [paymentPhone, setPaymentPhone] = useState('');
  const [checkoutRequestId, setCheckoutRequestId] = useState('');
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'pending' | 'checking' | 'success' | 'failed'>('idle');
  const [registeredUser, setRegisteredUser] = useState<any>(null);
  const [registeredToken, setRegisteredToken] = useState<string>('');
  
  // Form data
  const [formData, setFormData] = useState({
    // Step 1 - Personal
    name: '',
    email: '',
    phone: '',
    password: '',
    password_confirmation: '',
    // Step 2 - Academic
    year_of_study: '',
    course: '',
    college: '',
    admission_number: '',
    ministry_interest: '',
    residence: '',
  });
  
  // Validation errors per field
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Resend timer countdown
  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendTimer]);

  // Show mandatory payment after successful registration
  useEffect(() => {
    if (user && !authLoading) {
      setShowMandatoryPayment(true);
    }
  }, [user, authLoading]);

  // Update form field
  const updateField = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user types
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  // Validate Step 1
  const validateStep1 = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Full name is required';
    } else if (formData.name.trim().split(' ').length < 2) {
      newErrors.name = 'Please enter your full name (first & last)';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }
    
    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^(07|01|254)\d{8,9}$/.test(formData.phone.replace(/\s/g, ''))) {
      newErrors.phone = 'Enter a valid Kenyan phone number';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    
    if (!formData.password_confirmation) {
      newErrors.password_confirmation = 'Please confirm your password';
    } else if (formData.password !== formData.password_confirmation) {
      newErrors.password_confirmation = 'Passwords do not match';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Validate Step 2
  const validateStep2 = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.year_of_study) {
      newErrors.year_of_study = 'Please select your year of study';
    }
    
    if (!formData.course.trim()) {
      newErrors.course = 'Course is required';
    }
    
    if (!formData.college) {
      newErrors.college = 'Please select your college';
    }
    
    if (!formData.admission_number.trim()) {
      newErrors.admission_number = 'Admission number is required';
    }
    
    // Ministry and residence are optional
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Go to next step
  const handleNextStep = () => {
    if (currentStep === 1 && validateStep1()) {
      setCurrentStep(2);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Go to previous step
  const handlePrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Handle form submission
  const handleSubmit = async () => {
    if (!validateStep2()) return;
    
    setIsSubmitting(true);
    
    try {
      // Request OTP for registration - normalize phone number
      const normalizedPhone = formData.phone.replace(/\s/g, '').replace(/^0/, '254');
      
      const response = await fetch(`${API_BASE_URL}/auth/register/otp/request`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          phone: normalizedPhone,
          email: formData.email,
          name: formData.name
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        showSuccess('Verification code sent to your WhatsApp');
        setShowOtpVerification(true);
        setResendTimer(60);
      } else {
        showError(data.message || 'Failed to send verification code');
      }
    } catch (error: any) {
      showError('Failed to send verification code');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle OTP input
  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);
    
    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      nextInput?.focus();
    }
  };

  // Handle OTP paste
  const handleOtpPaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    const newOtp = [...otp];
    for (let i = 0; i < pastedData.length; i++) {
      newOtp[i] = pastedData[i];
    }
    setOtp(newOtp);
  };

  // Handle OTP key down (backspace navigation)
  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`);
      prevInput?.focus();
    }
  };

  // Verify OTP and show payment step
  const handleVerifyOtp = async () => {
    const otpCode = otp.join('');
    
    if (otpCode.length !== 6) {
      showError('Please enter the complete 6-digit code');
      return;
    }
    
    setOtpLoading(true);
    
    try {
      const normalizedPhone = formData.phone.replace(/\s/g, '').replace(/^0/, '254');
      
      // Verify OTP and create user with pending_payment status
      const verifyResponse = await fetch(`${API_BASE_URL}/auth/register/otp/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          phone: normalizedPhone,
          email: formData.email,
          otp: otpCode,
          name: formData.name,
          password: formData.password,
          phoneNumber: normalizedPhone,
          yearOfStudy: formData.yearOfStudy,
          course: formData.course,
          college: formData.college,
          admissionNumber: formData.admissionNumber,
          ministryInterest: formData.ministryInterest,
          residence: formData.residence,
        })
      });
      
      const verifyData = await verifyResponse.json();
      
      if (!verifyData.success) {
        showError(verifyData.message || 'Invalid verification code');
        setOtpLoading(false);
        return;
      }
      
      // Store user data and token temporarily
      setRegisteredUser(verifyData.data?.user);
      setRegisteredToken(verifyData.data?.token || '');
      setPaymentPhone(normalizedPhone);
      
      showSuccess('Phone verified! Complete payment to activate your account.');
      
      // Show payment step
      setShowOtpVerification(false);
      setShowPaymentStep(true);
    } catch (error: any) {
      showError('Verification failed. Please try again.');
    } finally {
      setOtpLoading(false);
    }
  };
  
  // Registration fee amount
  const REGISTRATION_FEE = 100;
  
  // Handle M-Pesa payment
  const handleInitiatePayment = async () => {
    if (!paymentPhone) {
      showError('Phone number is required');
      return;
    }
    
    setPaymentLoading(true);
    setPaymentStatus('pending');
    
    try {
      const response = await mpesaApi.initiateSTKPush({
        phone_number: paymentPhone,
        amount: REGISTRATION_FEE,
        account_reference: `REG-${registeredUser?.member_id || 'NEW'}`,
        transaction_desc: 'UET JKUAT Registration Fee',
      });
      
      if (response.success && response.data?.CheckoutRequestID) {
        setCheckoutRequestId(response.data.CheckoutRequestID);
        showSuccess('Check your phone for M-Pesa prompt. Enter PIN to complete.');
        
        // Start polling for payment status
        pollPaymentStatus(response.data.CheckoutRequestID);
      } else {
        showError(response.message || 'Failed to initiate payment');
        setPaymentStatus('failed');
      }
    } catch (error: any) {
      showError(error.message || 'Payment failed. Please try again.');
      setPaymentStatus('failed');
    } finally {
      setPaymentLoading(false);
    }
  };
  
  // Poll for payment status
  const pollPaymentStatus = async (checkoutId: string) => {
    setPaymentStatus('checking');
    
    let attempts = 0;
    const maxAttempts = 30; // 30 seconds max
    
    const checkStatus = async () => {
      attempts++;
      
      try {
        const response = await mpesaApi.checkStatus(checkoutId);
        
        if (response.success && response.data) {
          const status = response.data.ResultCode;
          
          if (status === 0 || status === '0') {
            // Payment successful
            setPaymentStatus('success');
            
            // Store auth token and complete registration
            if (registeredToken) {
              localStorage.setItem('auth_token', registeredToken);
            }
            if (registeredUser) {
              localStorage.setItem('user', JSON.stringify(registeredUser));
            }
            
            showSuccess('Payment successful! Welcome to UET JKUAT.');
            
            // Redirect to login after short delay
            setTimeout(() => {
              setRoute({ page: 'login' });
            }, 2000);
            return;
          } else if (status === 1032 || status === '1032') {
            // User cancelled
            setPaymentStatus('failed');
            showError('Payment was cancelled. Please try again.');
            return;
          }
        }
        
        // Continue polling if not done
        if (attempts < maxAttempts) {
          setTimeout(checkStatus, 1000);
        } else {
          setPaymentStatus('idle');
          showError('Payment verification timed out. If you paid, please contact support.');
        }
      } catch (error) {
        if (attempts < maxAttempts) {
          setTimeout(checkStatus, 1000);
        } else {
          setPaymentStatus('idle');
        }
      }
    };
    
    // Start checking after 5 seconds (give user time to enter PIN)
    setTimeout(checkStatus, 5000);
  };

  // Resend OTP
  const handleResendOtp = async () => {
    if (resendTimer > 0) return;
    
    try {
      const normalizedPhone = formData.phone.replace(/\s/g, '').replace(/^0/, '254');
      
      const response = await fetch(`${API_BASE_URL}/auth/register/otp/request`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          phone: normalizedPhone,
          email: formData.email,
          name: formData.name
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        showSuccess('New verification code sent to WhatsApp');
        setResendTimer(60);
        setOtp(['', '', '', '', '', '']);
      } else {
        showError(data.message || 'Failed to resend code');
      }
    } catch (error) {
      showError('Failed to resend verification code');
    }
  };

  // Render step indicator
  const renderStepIndicator = () => (
    <div className="flex items-center justify-center mb-8">
      {steps.map((step, index) => (
        <div key={step.id} className="flex items-center">
          <div className="flex flex-col items-center">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-300 ${
                currentStep > step.id
                  ? 'bg-primary text-primary-foreground'
                  : currentStep === step.id
                  ? 'bg-primary text-primary-foreground ring-4 ring-primary/20'
                  : 'bg-secondary text-muted-foreground'
              }`}
            >
              {currentStep > step.id ? (
                <CheckCircle className="w-5 h-5" />
              ) : (
                step.id
              )}
            </div>
            <div className="mt-2 text-center">
              <p className={`text-sm font-medium ${currentStep >= step.id ? 'text-foreground' : 'text-muted-foreground'}`}>
                {step.title}
              </p>
              <p className="text-xs text-muted-foreground hidden sm:block">{step.description}</p>
            </div>
          </div>
          {index < steps.length - 1 && (
            <div
              className={`w-16 sm:w-24 h-1 mx-2 rounded transition-all duration-300 ${
                currentStep > step.id ? 'bg-primary' : 'bg-secondary'
              }`}
            />
          )}
        </div>
      ))}
    </div>
  );

  // Render input field
  const renderInput = (
    field: string,
    label: string,
    icon: React.ReactNode,
    type: string = 'text',
    placeholder: string = '',
    isPassword: boolean = false,
    showPasswordState?: boolean,
    togglePassword?: () => void
  ) => (
    <div className="space-y-1.5">
      <label className="block text-sm font-medium text-foreground">{label}</label>
      <div className="relative">
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
          {icon}
        </div>
        <input
          type={isPassword ? (showPasswordState ? 'text' : 'password') : type}
          value={(formData as any)[field]}
          onChange={(e) => updateField(field, e.target.value)}
          placeholder={placeholder}
          className={`w-full pl-10 ${isPassword ? 'pr-10' : 'pr-4'} py-3 border rounded-xl bg-secondary/50 focus:bg-background text-foreground placeholder:text-muted-foreground transition-colors focus:ring-2 focus:ring-primary focus:border-transparent ${
            errors[field] ? 'border-destructive bg-destructive/10' : 'border-border'
          }`}
        />
        {isPassword && togglePassword && (
          <button
            type="button"
            onClick={togglePassword}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            {showPasswordState ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>
        )}
      </div>
      {errors[field] && (
        <p className="text-sm text-destructive flex items-center gap-1">
          <span className="inline-block w-1 h-1 bg-destructive rounded-full"></span>
          {errors[field]}
        </p>
      )}
    </div>
  );

  // Render select field
  const renderSelect = (
    field: string,
    label: string,
    icon: React.ReactNode,
    options: string[],
    placeholder: string = 'Select...'
  ) => (
    <div className="space-y-1.5">
      <label className="block text-sm font-medium text-foreground">{label}</label>
      <div className="relative">
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
          {icon}
        </div>
        <select
          value={(formData as any)[field]}
          onChange={(e) => updateField(field, e.target.value)}
          className={`w-full pl-10 pr-4 py-3 border rounded-xl bg-secondary/50 focus:bg-background text-foreground transition-colors focus:ring-2 focus:ring-primary focus:border-transparent appearance-none cursor-pointer ${
            errors[field] ? 'border-destructive bg-destructive/10' : 'border-border'
          }`}
        >
          <option value="">{placeholder}</option>
          {options.map(option => (
            <option key={option} value={option}>{option}</option>
          ))}
        </select>
        <ChevronRight className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground rotate-90 pointer-events-none" />
      </div>
      {errors[field] && (
        <p className="text-sm text-destructive flex items-center gap-1">
          <span className="inline-block w-1 h-1 bg-destructive rounded-full"></span>
          {errors[field]}
        </p>
      )}
    </div>
  );

  // Render OTP verification
  if (showOtpVerification) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-secondary/30 px-4 py-12">
        <div className="w-full max-w-md">
          <div className="bg-card rounded-2xl shadow-xl p-8 border border-border">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Phone className="w-8 h-8 text-primary" />
              </div>
              <h2 className="text-2xl font-bold text-foreground">Verify Your Phone</h2>
              <p className="text-muted-foreground mt-2">
                Enter the 6-digit code sent to <br />
                <span className="font-medium text-foreground">{formData.phone}</span>
              </p>
            </div>

            {/* OTP Input */}
            <div className="flex justify-center gap-2 mb-6">
              {otp.map((digit, index) => (
                <input
                  key={index}
                  id={`otp-${index}`}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOtpChange(index, e.target.value)}
                  onKeyDown={(e) => handleOtpKeyDown(index, e)}
                  onPaste={index === 0 ? handleOtpPaste : undefined}
                  className="w-12 h-14 text-center text-xl font-bold border-2 rounded-xl bg-secondary/50 text-foreground focus:bg-background focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                />
              ))}
            </div>

            {/* Verify Button */}
            <button
              onClick={handleVerifyOtp}
              disabled={otpLoading || otp.join('').length !== 6}
              className="w-full py-3.5 bg-primary text-primary-foreground rounded-xl font-semibold hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
            >
              {otpLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Verifying...
                </>
              ) : (
                'Verify & Create Account'
              )}
            </button>

            {/* Resend */}
            <div className="text-center mt-6">
              {resendTimer > 0 ? (
                <p className="text-muted-foreground">
                  Resend code in <span className="font-semibold text-primary">{resendTimer}s</span>
                </p>
              ) : (
                <button
                  onClick={handleResendOtp}
                  className="text-primary hover:text-primary/80 font-medium"
                >
                  Resend verification code
                </button>
              )}
            </div>

            {/* Back button */}
            <button
              onClick={() => setShowOtpVerification(false)}
              className="w-full mt-4 py-2.5 text-muted-foreground hover:text-foreground font-medium flex items-center justify-center gap-2"
            >
              <ChevronLeft className="w-4 h-4" />
              Back to registration
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Render Payment step
  if (showPaymentStep) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-secondary/30 px-4 py-12">
        <div className="w-full max-w-md">
          <div className="bg-card rounded-2xl shadow-xl p-8 border border-border">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                {paymentStatus === 'success' ? (
                  <CheckCircle className="w-8 h-8 text-green-500" />
                ) : (
                  <CreditCard className="w-8 h-8 text-foreground" />
                )}
              </div>
              <h2 className="text-2xl font-bold text-foreground">
                {paymentStatus === 'success' ? 'Payment Successful!' : 'Complete Registration'}
              </h2>
              <p className="text-muted-foreground mt-2">
                {paymentStatus === 'success' 
                  ? 'Your account is now active. Redirecting...'
                  : 'Pay the registration fee to activate your account'
                }
              </p>
            </div>

            {paymentStatus !== 'success' && (
              <>
                {/* Payment Amount */}
                <div className="bg-secondary/50 rounded-xl p-6 mb-6 text-center">
                  <p className="text-sm text-muted-foreground mb-1">Registration Fee</p>
                  <p className="text-4xl font-bold text-foreground">KES {REGISTRATION_FEE}</p>
                  <p className="text-sm text-muted-foreground mt-2">One-time payment</p>
                </div>

                {/* Phone Number */}
                <div className="space-y-1.5 mb-6">
                  <label className="block text-sm font-medium text-foreground">M-Pesa Phone Number</label>
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                      <Smartphone className="w-5 h-5" />
                    </div>
                    <input
                      type="tel"
                      value={paymentPhone}
                      onChange={(e) => setPaymentPhone(e.target.value.replace(/[^0-9]/g, ''))}
                      placeholder="254700000000"
                      className="w-full pl-10 pr-4 py-3 border border-border rounded-xl bg-secondary/50 focus:bg-background text-foreground transition-colors focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                  </div>
                </div>

                {/* Pay Button */}
                <button
                  onClick={handleInitiatePayment}
                  disabled={paymentLoading || paymentStatus === 'checking' || !paymentPhone}
                  className="w-full py-3.5 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                >
                  {paymentLoading || paymentStatus === 'checking' ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      {paymentStatus === 'checking' ? 'Confirming Payment...' : 'Initiating...'}
                    </>
                  ) : paymentStatus === 'pending' ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Waiting for payment...
                    </>
                  ) : (
                    <>
                      <CreditCard className="w-5 h-5" />
                      Pay with M-Pesa
                    </>
                  )}
                </button>

                {/* Status message */}
                {paymentStatus === 'pending' && (
                  <div className="mt-4 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-xl">
                    <p className="text-sm text-yellow-600 dark:text-yellow-400 text-center">
                      📱 Check your phone for M-Pesa prompt and enter your PIN to complete payment
                    </p>
                  </div>
                )}

                {paymentStatus === 'failed' && (
                  <div className="mt-4 p-4 bg-destructive/10 border border-destructive/30 rounded-xl">
                    <p className="text-sm text-destructive text-center">
                      Payment failed. Please try again.
                    </p>
                  </div>
                )}

                {/* Info */}
                <p className="text-xs text-muted-foreground text-center mt-6">
                  You'll receive an M-Pesa prompt on your phone. Enter your PIN to complete payment.
                </p>
              </>
            )}

            {paymentStatus === 'success' && (
              <div className="flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Main registration form
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-secondary/30 px-4 py-8">
      {/* Mandatory Payment Modal */}
      {showMandatoryPayment && user && (
        <MandatoryPaymentModal
          isOpen={showMandatoryPayment}
          onClose={() => {
            setShowMandatoryPayment(false);
            setRoute({ page: 'dashboard' });
          }}
          amount={100}
          phone={formData.phone}
          onSuccess={() => {
            setShowMandatoryPayment(false);
            showSuccess('Registration fee paid successfully!');
            setRoute({ page: 'dashboard' });
          }}
        />
      )}

      <div className="w-full max-w-lg">
        {/* Logo */}
        <div className="text-center mb-6">
          <button onClick={() => setRoute({ page: 'home' })} className="inline-flex items-center gap-2">
            <img src="/logo.svg" alt="UET JKUAT" className="h-12 w-auto" />
          </button>
        </div>

        {/* Card */}
        <div className="bg-card rounded-2xl shadow-xl overflow-hidden border border-border">
          {/* Header */}
          <div className="bg-gradient-to-r from-foreground to-foreground/90 px-6 py-5 text-center">
            <h1 className="text-xl font-bold text-background">Create Your Account</h1>
            <p className="text-background/70 text-sm mt-1">Join the UET JKUAT community</p>
          </div>

          {/* Step Indicator */}
          <div className="px-6 pt-6">
            {renderStepIndicator()}
          </div>

          {/* Form */}
          <div className="px-6 pb-6">

            {/* Step 1: Personal Info */}
            {currentStep === 1 && !showOtpVerification && !showPaymentStep && (
              <div className="space-y-4 animate-in fade-in duration-300">
                {renderInput('name', 'Full Name', <User className="w-5 h-5" />, 'text', 'John Doe')}
                {renderInput('email', 'Email Address', <Mail className="w-5 h-5" />, 'email', 'john@example.com')}
                {renderInput('phone', 'Phone Number', <Phone className="w-5 h-5" />, 'tel', '0712345678')}
                {renderInput('password', 'Password', <Lock className="w-5 h-5" />, 'password', '••••••••', true, showPassword, () => setShowPassword(!showPassword))}
                {renderInput('password_confirmation', 'Confirm Password', <Lock className="w-5 h-5" />, 'password', '••••••••', true, showConfirmPassword, () => setShowConfirmPassword(!showConfirmPassword))}

                <button
                  onClick={handleNextStep}
                  className="w-full py-3.5 bg-primary text-primary-foreground rounded-xl font-semibold hover:bg-primary/90 transition-colors flex items-center justify-center gap-2 mt-6"
                >
                  Continue to Academic Info
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            )}

            {/* Step 2: Academic Info */}
            {currentStep === 2 && !showOtpVerification && !showPaymentStep && (
              <div className="space-y-4 animate-in fade-in duration-300">
                {renderSelect('year_of_study', 'Year of Study', <GraduationCap className="w-5 h-5" />, yearOptions, 'Select your year')}
                {renderInput('course', 'Course / Program', <BookOpen className="w-5 h-5" />, 'text', 'BSc. Computer Science')}
                {renderSelect('college', 'College', <Building className="w-5 h-5" />, collegeOptions, 'Select your college')}
                {renderInput('admission_number', 'Admission Number', <User className="w-5 h-5" />, 'text', 'SCT/211-12345/2020')}
                {renderSelect('ministry_interest', 'Ministry Interest (Optional)', <Heart className="w-5 h-5" />, ministryOptions, 'Select a ministry')}
                {renderInput('residence', 'Residence (Optional)', <Home className="w-5 h-5" />, 'text', 'Gate C, Juja')}

                <div className="flex gap-3 mt-6">
                  <button
                    onClick={handlePrevStep}
                    className="flex-1 py-3.5 border-2 border-border text-foreground rounded-xl font-semibold hover:bg-secondary transition-colors flex items-center justify-center gap-2"
                  >
                    <ChevronLeft className="w-5 h-5" />
                    Back
                  </button>
                  <button
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className="flex-1 py-3.5 bg-primary text-primary-foreground rounded-xl font-semibold hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Sending OTP...
                      </>
                    ) : (
                      'Create Account'
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* OTP Verification Step */}
            {showOtpVerification && !showPaymentStep && (
              <div className="space-y-4 animate-in fade-in duration-300">
                <h2 className="text-lg font-semibold text-center">Enter the 6-digit OTP sent to your WhatsApp</h2>
                <div className="flex gap-2 justify-center">
                  {otp.map((digit, idx) => (
                    <input
                      key={idx}
                      id={`otp-${idx}`}
                      type="text"
                      maxLength={1}
                      value={digit}
                      onChange={e => handleOtpChange(idx, e.target.value)}
                      onKeyDown={e => handleOtpKeyDown(idx, e)}
                      className="w-10 h-10 text-center border rounded text-lg"
                    />
                  ))}
                </div>
                <button
                  onClick={handleVerifyOtp}
                  disabled={otpLoading}
                  className="w-full py-3.5 bg-primary text-primary-foreground rounded-xl font-semibold hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                >
                  {otpLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Verifying...
                    </>
                  ) : (
                    'Verify OTP'
                  )}
                </button>
                <button
                  onClick={handleResendOtp}
                  disabled={resendTimer > 0}
                  className="w-full py-2 mt-2 border border-primary text-primary rounded-xl font-semibold hover:bg-primary/10 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {resendTimer > 0 ? `Resend in ${resendTimer}s` : 'Resend OTP'}
                </button>
              </div>
            )}

            {/* Auth Error */}
            {authError && (
              <div className="mt-4 p-3 bg-destructive/10 border border-destructive/20 rounded-xl text-destructive text-sm text-center">
                {authError}
              </div>
            )}

            {/* Login Link */}
            <p className="text-center mt-6 text-muted-foreground">
              Already have an account?{' '}
              <button 
                onClick={() => setRoute({ page: 'login' })} 
                className="text-primary hover:text-primary/80 font-semibold"
              >
                Sign In
              </button>
            </p>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-muted-foreground text-sm mt-6">
          By creating an account, you agree to our Terms of Service
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;
