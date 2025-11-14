
import React, { useState, useContext, useEffect } from 'react';
import { Project, MpesaSession } from '../types';
import { IconClose, IconPhone } from './icons';
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
    await handleContribute(project.id, amount, { phoneNumber });
    addNotification('Payment successful. Thank you for your contribution!');
  };

  const handlePaymentCancel = () => {
    setMpesaSession(null);
    setIsSubmitting(false);
    addNotification('Payment was cancelled.');
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-2xl p-8 max-w-md w-full relative transform transition-all duration-300 animate-scale-in">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
          <IconClose className="w-6 h-6" />
        </button>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Contribute to</h2>
        <p className="text-lg text-blue-600 font-semibold mb-6">{project.title}</p>
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-2">Amount (KES)</label>
            <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-gray-500 sm:text-sm"> KES </span>
                </div>
                <input
                    type="number"
                    name="amount"
                    id="amount"
                    value={amount}
                    onChange={handleAmountChange}
                    className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-12 pr-4 sm:text-sm border-gray-300 rounded-md py-3"
                    placeholder="0"
                    autoFocus
                />
            </div>
            {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
          </div>

          <div className="flex flex-wrap gap-2 mb-6">
            {presetAmounts.map(preset => (
              <button
                key={preset}
                type="button"
                onClick={() => { setAmount(preset); setError(''); }}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${amount === preset ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
              >
                {preset}
              </button>
            ))}
          </div>

          <div className="mb-6">
            <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 mb-2">M-Pesa Phone Number</label>
            <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <IconPhone className="w-4 h-4 text-gray-400" />
                </div>
                <input
                    type="tel"
                    name="phoneNumber"
                    id="phoneNumber"
                    value={phoneNumber}
                    onChange={(event) => setPhoneNumber(event.target.value)}
                    className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 pr-4 sm:text-sm border-gray-300 rounded-md py-3"
                    placeholder="2547XXXXXXXX"
                    required
                />
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Ensure the number is registered on M-Pesa. You will receive an STK prompt to confirm the payment.
            </p>
          </div>

          <div className="rounded-md bg-blue-50 border border-blue-100 p-4 mb-6">
            <p className="text-sm text-blue-700">
              Every active member is encouraged to contribute at least <span className="font-semibold">KES 100</span> each term to support UET JKUAT ministries. You can fulfil that commitment with this contribution.
            </p>
          </div>

          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 rounded-md text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2 rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors"
            >
              {isSubmitting ? 'Processing...' : 'Confirm Contribution'}
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-4 text-center">
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