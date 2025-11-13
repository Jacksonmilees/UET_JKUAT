
import React, { useState, useEffect } from 'react';
import { IconClose, IconPhone } from './icons';
import { useFinance } from '../contexts/FinanceContext';
import { useAuth } from '../contexts/AuthContext';
import MpesaPaymentStatus from './MpesaPaymentStatus';
import { MpesaSession } from '../types';
import { MANDATORY_CONTRIBUTION_AMOUNT } from '../constants';

interface MandatoryPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  isRegistration?: boolean;
}

const MandatoryPaymentModal: React.FC<MandatoryPaymentModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  isRegistration = false,
}) => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [error, setError] = useState('');
  const [mpesaSession, setMpesaSession] = useState<MpesaSession | null>(null);
  const { user } = useAuth();
  const { initiateProjectContribution, checkMpesaStatus } = useFinance();

  useEffect(() => {
    if (user?.phoneNumber) {
      setPhoneNumber(user.phoneNumber);
    }
  }, [user]);

  if (!isOpen) return null;

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '');
    if (value.length <= 12) {
      setPhoneNumber(value);
      setError('');
    }
  };

  const formatPhoneNumber = (phone: string) => {
    if (phone.startsWith('0')) {
      return '254' + phone.substring(1);
    }
    if (!phone.startsWith('254')) {
      return '254' + phone;
    }
    return phone;
  };

  const handleInitiatePayment = async () => {
    if (!phoneNumber || !/^(0|254)[0-9]{9}$/.test(phoneNumber)) {
      setError('Please enter a valid Safaricom phone number (e.g., 254712345678 or 0712345678)');
      return;
    }

    setError('');
    const formattedPhone = formatPhoneNumber(phoneNumber);

    try {
      // Initiate mandatory contribution payment
      // Using a special project ID or account for mandatory contributions
      const result = await initiateProjectContribution({
        projectId: 0, // Special ID for mandatory contribution
        projectTitle: 'UET JKUAT Mandatory Term Contribution',
        amount: MANDATORY_CONTRIBUTION_AMOUNT,
        phoneNumber: formattedPhone,
        userId: user?.id,
        donorName: user?.name || 'New Member',
      });

      if (result.success && result.session) {
        setMpesaSession(result.session);
      } else {
        setError(result.message || 'Failed to initiate payment. Please try again.');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to initiate payment. Please try again.');
    }
  };

  const handlePaymentComplete = async () => {
    setMpesaSession(null);
    onSuccess();
  };

  const handlePaymentCancel = () => {
    setMpesaSession(null);
    if (!isRegistration) {
      onClose();
    }
  };

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
        <div className="bg-white rounded-lg shadow-2xl p-8 max-w-md w-full relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            disabled={!!mpesaSession}
          >
            <IconClose className="w-6 h-6" />
          </button>

          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              {isRegistration ? 'Complete Registration' : 'Mandatory Contribution Required'}
            </h2>
            <p className="text-gray-600">
              {isRegistration
                ? 'To complete your registration, please make the mandatory term contribution of KES 100.'
                : 'You need to complete your mandatory term contribution of KES 100 to access the platform.'}
            </p>
          </div>

          <div className="mb-6">
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
              M-Pesa Phone Number
            </label>
            <div className="mt-1 relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <IconPhone className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="tel"
                name="phone"
                id="phone"
                value={phoneNumber}
                onChange={handlePhoneChange}
                disabled={!!mpesaSession}
                className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 pr-4 sm:text-sm border-gray-300 rounded-md py-3 disabled:bg-gray-100"
                placeholder="254712345678 or 0712345678"
                required
              />
            </div>
            {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
            <p className="text-xs text-gray-500 mt-2">
              Enter the phone number registered with M-Pesa. You'll receive an STK prompt to approve the payment.
            </p>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-blue-800 font-semibold mb-1">Amount: KES {MANDATORY_CONTRIBUTION_AMOUNT}</p>
            <p className="text-xs text-blue-700">
              This is a one-time mandatory contribution required for all UET JKUAT members each term.
            </p>
          </div>

          <div className="flex justify-end space-x-4">
            {!isRegistration && (
              <button
                type="button"
                onClick={onClose}
                disabled={!!mpesaSession}
                className="px-6 py-2 rounded-md text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
            )}
            <button
              type="button"
              onClick={handleInitiatePayment}
              disabled={!!mpesaSession || !phoneNumber}
              className="px-6 py-2 rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors disabled:bg-blue-300"
            >
              {mpesaSession ? 'Processing...' : `Pay KES ${MANDATORY_CONTRIBUTION_AMOUNT}`}
            </button>
          </div>
        </div>
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
    </>
  );
};

export default MandatoryPaymentModal;

