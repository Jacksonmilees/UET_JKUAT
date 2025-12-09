
import React, { useState, useEffect } from 'react';
import { IconClose, IconPhone } from './icons';
import { useFinance } from '../contexts/FinanceContext';
import { useAuth } from '../contexts/AuthContext';
import MpesaPaymentStatus from './MpesaPaymentStatus';
import { MpesaSession } from '../types';
import { MANDATORY_CONTRIBUTION_AMOUNT } from '../constants';
import api from '../services/api';

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
  const [info, setInfo] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [mpesaSession, setMpesaSession] = useState<MpesaSession | null>(null);
  const { user } = useAuth();
  const { checkMpesaStatus, refreshMandatoryStatus } = useFinance();

  useEffect(() => {
    if (user?.phoneNumber) {
      setPhoneNumber(user.phoneNumber);
    }
  }, [user]);

  if (!isOpen) return null;

  const normalizePhone = (raw: string) => {
    const digits = raw.replace(/\D/g, '');
    if (digits.startsWith('0')) return `254${digits.slice(1)}`;
    if (!digits.startsWith('254')) return `254${digits}`;
    return digits;
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const digits = e.target.value.replace(/\D/g, '').slice(0, 12);
    setPhoneNumber(digits);
    setError('');
    setInfo('');
  };

  const handleInitiatePayment = async () => {
    const formattedPhone = normalizePhone(phoneNumber);
    if (!/^(2547\d{8})$/.test(formattedPhone)) {
      setError('Enter a valid Safaricom phone (e.g., 254712345678 or 0712345678).');
      return;
    }

    setSubmitting(true);
    setError('');
    setInfo('Sending STK push. Check your phone and enter your M-Pesa PIN to approve.');

    try {
      const response = await api.onboarding.initiate(formattedPhone);
      if (!response.success || !response.data) {
        setError(response.error || response.message || 'Failed to initiate payment.');
        setSubmitting(false);
        setInfo('');
        return;
      }

      const session: MpesaSession = {
        id: response.data.checkoutRequestId,
        amount: response.data.amount,
        phoneNumber: formattedPhone,
        projectId: 0,
        projectTitle: 'Mandatory Contribution',
        status: 'pending',
        initiatedAt: new Date().toISOString(),
        checkoutRequestId: response.data.checkoutRequestId,
        merchantRequestId: response.data.merchantRequestId,
      };
      setMpesaSession(session);
      setInfo('');
    } catch (err: any) {
      setError(err.message || 'Failed to initiate payment. Please try again.');
      setInfo('');
    } finally {
      setSubmitting(false);
    }
  };

  const handlePaymentComplete = async () => {
    setMpesaSession(null);
    await refreshMandatoryStatus();
    onSuccess();
  };

  const handlePaymentCancel = () => {
    setMpesaSession(null);
    setInfo('');
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
            disabled={!!mpesaSession || submitting}
            aria-label="Close"
          >
            <IconClose className="w-6 h-6" />
          </button>

          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              {isRegistration ? 'Complete Registration' : 'Mandatory Contribution Required'}
            </h2>
            <p className="text-gray-600">
              {isRegistration
                ? `Pay the mandatory contribution of KES ${MANDATORY_CONTRIBUTION_AMOUNT} to finish signing up.`
                : `Pay the mandatory contribution of KES ${MANDATORY_CONTRIBUTION_AMOUNT} to unlock the dashboard.`}
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
                disabled={!!mpesaSession || submitting}
                className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 pr-4 sm:text-sm border-gray-300 rounded-md py-3 disabled:bg-gray-100"
                placeholder="254712345678 or 0712345678"
                required
              />
            </div>
            {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
            {info && !error && <p className="text-blue-600 text-xs mt-1">{info}</p>}
            <p className="text-xs text-gray-500 mt-2">
              You'll get an STK prompt on this number. Confirm amount and enter your M-Pesa PIN.
            </p>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-blue-800 font-semibold mb-1">Amount: KES {MANDATORY_CONTRIBUTION_AMOUNT}</p>
            <p className="text-xs text-blue-700">
              One-time mandatory contribution for the term. If you don't see an STK, tap "Pay" again.
            </p>
          </div>

          <div className="flex justify-end space-x-4">
            {!isRegistration && (
              <button
                type="button"
                onClick={onClose}
                disabled={!!mpesaSession || submitting}
                className="px-6 py-2 rounded-md text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
            )}
            <button
              type="button"
              onClick={handleInitiatePayment}
              disabled={!!mpesaSession || submitting || !phoneNumber}
              className="px-6 py-2 rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors disabled:bg-blue-300"
            >
              {mpesaSession || submitting ? 'Processing...' : `Pay KES ${MANDATORY_CONTRIBUTION_AMOUNT}`}
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

