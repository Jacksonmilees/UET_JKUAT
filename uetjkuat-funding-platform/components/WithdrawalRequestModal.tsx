
import React, { useState } from 'react';
import { IconClose, IconPhone } from './icons';
import { Account } from '../types';

interface WithdrawalRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  account: Account | null;
  onSubmit: (amount: number, phoneNumber: string, reason: string) => Promise<void>;
}

const WithdrawalRequestModal: React.FC<WithdrawalRequestModalProps> = ({
  isOpen,
  onClose,
  account,
  onSubmit,
}) => {
  const [amount, setAmount] = useState<number | ''>('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError('');
    const value = e.target.value;
    if (value === '' || (/^\d+$/.test(value) && parseFloat(value) >= 0)) {
      setAmount(value === '' ? '' : parseFloat(value));
    }
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '');
    if (value.length <= 12) {
      setPhoneNumber(value);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (amount === '' || amount <= 0) {
      setError('Please enter a valid amount.');
      return;
    }

    if (!account || account.balance < amount) {
      setError('Insufficient balance in your account.');
      return;
    }

    if (phoneNumber.length < 9) {
      setError('Please enter a valid phone number.');
      return;
    }

    if (!reason.trim()) {
      setError('Please provide a reason for the withdrawal.');
      return;
    }

    setIsSubmitting(true);
    try {
      const formattedPhone = formatPhoneNumber(phoneNumber);
      await onSubmit(amount, formattedPhone, reason);
      setAmount('');
      setPhoneNumber('');
      setReason('');
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to process withdrawal request.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const availableBalance = account?.balance || 0;
  const maxAmount = Math.min(amount || 0, availableBalance);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-2xl p-8 max-w-md w-full relative transform transition-all duration-300">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
        >
          <IconClose className="w-6 h-6" />
        </button>

        <h2 className="text-2xl font-bold text-gray-800 mb-2">Request Withdrawal</h2>
        <p className="text-sm text-gray-600 mb-6">
          Available Balance: <span className="font-semibold text-blue-600">KES {availableBalance.toLocaleString()}</span>
        </p>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-2">
              Amount (KES)
            </label>
            <div className="mt-1 relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="text-gray-500 sm:text-sm">KES</span>
              </div>
              <input
                type="number"
                name="amount"
                id="amount"
                value={amount}
                onChange={handleAmountChange}
                max={availableBalance}
                className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-12 pr-4 sm:text-sm border-gray-300 rounded-md py-3"
                placeholder="0"
                required
              />
            </div>
            {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
          </div>

          <div className="mb-4">
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
                className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 pr-4 sm:text-sm border-gray-300 rounded-md py-3"
                placeholder="254712345678"
                required
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">Enter phone number (e.g., 254712345678 or 0712345678)</p>
          </div>

          <div className="mb-6">
            <label htmlFor="reason" className="block text-sm font-medium text-gray-700 mb-2">
              Reason for Withdrawal
            </label>
            <textarea
              name="reason"
              id="reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={3}
              className="focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md py-2 px-3"
              placeholder="Please provide a reason for this withdrawal..."
              required
            />
          </div>

          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 rounded-md text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors disabled:bg-blue-300"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Processing...' : 'Submit Request'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default WithdrawalRequestModal;







