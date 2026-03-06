import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../contexts/NotificationContext';
import MandatoryPaymentModal from '../components/MandatoryPaymentModal';
import { User, Mail, Phone, Lock, GraduationCap, Building, BookOpen, Home, Heart, ChevronRight, ChevronLeft, CheckCircle, Eye, EyeOff, Loader2 } from 'lucide-react';
import { Route } from '../types';
import { MANDATORY_CONTRIBUTION_AMOUNT } from '../constants';

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
  const [showMandatoryPayment, setShowMandatoryPayment] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Password visibility
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
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

  const normalizePhone = (phone: string): string => {
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.startsWith('0')) return `254${cleaned.slice(1)}`;
    if (cleaned.startsWith('254')) return cleaned;
    if (cleaned.startsWith('7') || cleaned.startsWith('1')) return `254${cleaned}`;
    return cleaned;
  };

  // Handle form submission (no OTP)
  const handleSubmit = async () => {
    if (!validateStep2()) return;
    setIsSubmitting(true);

    try {
      const success = await register({
        name: formData.name.trim(),
        email: formData.email.trim(),
        password: formData.password,
        phoneNumber: normalizePhone(formData.phone),
        yearOfStudy: formData.year_of_study,
        course: formData.course.trim(),
        college: formData.college,
        admissionNumber: formData.admission_number.trim(),
        ministryInterest: formData.ministry_interest.trim() || 'Not specified',
        residence: formData.residence.trim() || 'Not specified',
      });

      if (success) {
        showSuccess('Registration successful. Complete mandatory payment to continue.');
      } else {
        showError('Registration failed. Please check your details and try again.');
      }
    } catch (error: any) {
      showError('Registration failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Registration fee amount
  const REGISTRATION_FEE = MANDATORY_CONTRIBUTION_AMOUNT;

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
          amount={REGISTRATION_FEE}
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
            {currentStep === 1 && (
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
            {currentStep === 2 && (
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
                        Creating Account...
                      </>
                    ) : (
                      'Create Account'
                    )}
                  </button>
                </div>
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
