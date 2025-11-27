import React, { useState, useContext, useEffect } from 'react';
import { Project, MpesaSession } from '../types';
import { X, Phone, Check, AlertCircle, Banknote } from 'lucide-react';
import { ProjectContext } from '../contexts/ProjectContext';
import { NotificationContext } from '../contexts/NotificationContext';
import { useAuth } from '../contexts/AuthContext';
import { useFinance } from '../contexts/FinanceContext';
import MpesaPaymentStatus from './MpesaPaymentStatus';

interface ContributionModalProps {
  project: Project | null;
  isOpen: boolean;
  onClose: () => void;
}

const ContributionModal: React.FC<ContributionModalProps> = ({ project, isOpen, onClose }) => {
  const [amount, setAmount] = useState<number | ''>('');
  const [error, setError] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mpesaSession, setMpesaSession] = useState<MpesaSession | null>(null);
  const { handleContribute } = useContext(ProjectContext);
  const { addNotification } = useContext(NotificationContext);
  const { user } = useAuth();
  const { initiateProjectContribution, checkMpesaStatus } = useFinance();

  if (!isOpen || !project) return null;

  useEffect(() => {
    if (user?.phoneNumber) {
      setPhoneNumber(user.phoneNumber);
    }
  }, [user]);

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError('');
    const value = e.target.value;
    if (value === '' || (/^\d+$/.test(value) && parseInt(value) >= 0)) {
      setAmount(value === '' ? '' : parseInt(value));
    }
  };

  const presetAmounts = [50, 100, 250, 500, 1000];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (amount === '' || amount <= 0) {
      setError('Please enter a valid amount.');
      return;
    }
    if (!phoneNumber || !/^254[0-9]{9}$/.test(phoneNumber)) {
      setError('Please enter a valid Safaricom number e.g. 2547XXXXXXXX.');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      // Initiate MPesa payment
      const result = await initiateProjectContribution({
        projectId: project.id,
        projectTitle: project.title,
        amount,
        phoneNumber,
        userId: user?.id,
        donorName: user?.name,
      });

      if (result.success && result.session) {
        setMpesaSession(result.session);
      } else {
        setError(result.message || 'Failed to initiate payment. Please try again.');
        setIsSubmitting(false);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to initiate payment. Please try again.');
      setIsSubmitting(false);
    }
  };

  const handlePaymentComplete = async () => {
    setMpesaSession(null);
    setAmount('');
    onClose();
    // Refresh project data
    if (typeof amount === 'number') {
      await handleContribute(project.id, amount, { phoneNumber });
    }
    addNotification('Payment successful. Thank you for your contribution!');
  };

  const handlePaymentCancel = () => {
    setMpesaSession(null);
    setIsSubmitting(false);
    addNotification('Payment was cancelled.');
  };

  return (
    <div className="fixed inset-0 bg-secondary-950/80 backdrop-blur-sm flex justify-center items-center z-50 p-4 animate-fade-in">
      <div className="bg-secondary-900 rounded-3xl shadow-2xl border border-secondary-800 p-8 max-w-md w-full relative transform transition-all duration-300 animate-scale-in">
        <button onClick={onClose} className="absolute top-4 right-4 text-secondary-400 hover:text-white transition-colors p-2 rounded-full hover:bg-secondary-800">
          <X className="w-6 h-6" />
        </button>

        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-white mb-2">Contribute to</h2>
          <p className="text-lg text-primary-400 font-semibold">{project.title}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="amount" className="block text-sm font-medium text-secondary-300 mb-2">Amount (KES)</label>
            <div className="relative rounded-xl shadow-sm group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <span className="text-secondary-500 font-bold group-focus-within:text-primary-500 transition-colors">KES</span>
              </div>
              <input
                type="number"
                name="amount"
                id="amount"
                value={amount}
                onChange={handleAmountChange}
                className="block w-full pl-14 pr-4 py-4 bg-secondary-800 border border-secondary-700 rounded-xl text-white placeholder-secondary-600 focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 transition-all outline-none font-bold text-lg"
                placeholder="0"
                autoFocus
              />
            </div>
            {error && (
              <div className="flex items-center gap-2 mt-2 text-red-400 text-sm animate-slide-down">
                <AlertCircle className="w-4 h-4" />
                <p>{error}</p>
              </div>
            )}
          </div>

          <div className="flex flex-wrap gap-2">
            {presetAmounts.map(preset => (
              <button
                key={preset}
                type="button"
                onClick={() => { setAmount(preset); setError(''); }}
                className={`px-4 py-2 rounded-xl text-sm font-bold transition-all duration-300 border ${amount === preset
                  ? 'bg-primary-500 text-primary-950 border-primary-500 shadow-glow'
                  : 'bg-secondary-800 text-secondary-400 border-secondary-700 hover:border-primary-500/50 hover:text-primary-400'
                  }`}
              >
                {preset}
              </button>
            ))}
          </div>

          <div>
            <label htmlFor="phoneNumber" className="block text-sm font-medium text-secondary-300 mb-2">M-Pesa Phone Number</label>
            <div className="relative rounded-xl shadow-sm group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Phone className="w-5 h-5 text-secondary-500 group-focus-within:text-primary-500 transition-colors" />
              </div>
              <input
                type="tel"
                name="phoneNumber"
                id="phoneNumber"
                value={phoneNumber}
                onChange={(event) => setPhoneNumber(event.target.value)}
                className="block w-full pl-12 pr-4 py-4 bg-secondary-800 border border-secondary-700 rounded-xl text-white placeholder-secondary-600 focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 transition-all outline-none font-medium"
                placeholder="2547XXXXXXXX"
                required
              />
            </div>
            <p className="text-xs text-secondary-500 mt-2 flex items-center gap-1">
              <Banknote className="w-3 h-3" />
              Ensure the number is registered on M-Pesa.
            </p>
          </div>

          <div className="rounded-xl bg-primary-900/20 border border-primary-500/20 p-4">
            <p className="text-sm text-primary-200">
              Every active member is encouraged to contribute at least <span className="font-bold text-primary-400">KES 100</span> each term to support UET JKUAT ministries.
            </p>
          </div>

          <div className="flex gap-4 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 rounded-xl text-secondary-300 bg-secondary-800 hover:bg-secondary-700 transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 px-6 py-3 rounded-xl text-primary-950 bg-primary-500 hover:bg-primary-400 transition-all duration-300 font-bold shadow-glow hover:shadow-glow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>Processing...</>
              ) : (
                <>Confirm <Check className="w-5 h-5" /></>
              )}
            </button>
          </div>
          <p className="text-xs text-secondary-600 text-center">
            A confirmation SMS will be sent after M-Pesa acknowledges the payment.
          </p>
        </form>
      </div>

      {/* MPesa Payment Status Modal */}
      {mpesaSession && (
        <MpesaPaymentStatus
          session={mpesaSession}
          onComplete={handlePaymentComplete}
          onCancel={handlePaymentCancel}
          checkStatus={checkMpesaStatus}
        />
      )}
    </div>
  );
};

export default ContributionModal;