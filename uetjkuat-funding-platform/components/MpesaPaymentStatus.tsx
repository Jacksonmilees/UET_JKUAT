
import React, { useEffect, useState } from 'react';
import { MpesaSession } from '../types';
import { IconCheck, IconX, IconClock, IconPhone } from './icons';

interface MpesaPaymentStatusProps {
  session: MpesaSession | null;
  onComplete?: () => void;
  onCancel?: () => void;
  checkStatus?: (checkoutRequestId: string) => Promise<MpesaSession>;
}

const MpesaPaymentStatus: React.FC<MpesaPaymentStatusProps> = ({
  session,
  onComplete,
  onCancel,
  checkStatus,
}) => {
  const [currentSession, setCurrentSession] = useState<MpesaSession | null>(session);
  const [isPolling, setIsPolling] = useState(false);

  useEffect(() => {
    if (session) {
      setCurrentSession(session);
    }
  }, [session]);

  useEffect(() => {
    if (!currentSession || currentSession.status !== 'pending' || !checkStatus) {
      return;
    }

    setIsPolling(true);
    const interval = setInterval(async () => {
      try {
        const updated = await checkStatus(currentSession.checkoutRequestId);
        setCurrentSession(updated);

        if (updated.status !== 'pending') {
          setIsPolling(false);
          clearInterval(interval);
          if (updated.status === 'completed' && onComplete) {
            setTimeout(() => onComplete(), 2000);
          }
        }
      } catch (error) {
        console.error('Error checking payment status:', error);
      }
    }, 3000); // Poll every 3 seconds

    return () => {
      clearInterval(interval);
      setIsPolling(false);
    };
  }, [currentSession, checkStatus, onComplete]);

  if (!currentSession) {
    return null;
  }

  const getStatusConfig = () => {
    switch (currentSession.status) {
      case 'completed':
        return {
          icon: <IconCheck className="w-12 h-12 text-green-600" />,
          title: 'Payment Successful!',
          message: 'Your payment has been processed successfully.',
          bgColor: 'bg-green-50',
          borderColor: 'border-green-600',
        };
      case 'failed':
      case 'cancelled':
        return {
          icon: <IconX className="w-12 h-12 text-red-600" />,
          title: 'Payment Failed',
          message: currentSession.errorMessage || 'Your payment could not be processed. Please try again.',
          bgColor: 'bg-red-50',
          borderColor: 'border-red-600',
        };
      case 'pending':
      default:
        return {
          icon: <IconClock className="w-12 h-12 text-yellow-600 animate-spin" />,
          title: 'Waiting for Payment',
          message: 'Please complete the payment on your phone. Enter your M-Pesa PIN when prompted.',
          bgColor: 'bg-yellow-50',
          borderColor: 'border-yellow-600',
        };
    }
  };

  const config = getStatusConfig();

  return (
    <div className={`fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4`}>
      <div className={`bg-white rounded-lg shadow-2xl p-8 max-w-md w-full border-2 ${config.borderColor}`}>
        <div className={`${config.bgColor} rounded-lg p-6 mb-6 flex flex-col items-center`}>
          {config.icon}
          <h3 className="text-xl font-bold text-gray-800 mt-4">{config.title}</h3>
          <p className="text-gray-600 text-center mt-2">{config.message}</p>
        </div>

        {currentSession.status === 'pending' && (
          <div className="mb-6">
            <div className="flex items-center justify-center gap-2 text-sm text-gray-600 mb-4">
              <IconPhone className="w-5 h-5" />
              <span>Phone: {currentSession.phoneNumber}</span>
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800 font-semibold mb-2">Instructions:</p>
              <ol className="text-sm text-blue-700 space-y-1 list-decimal list-inside">
                <li>Check your phone for an M-Pesa prompt</li>
                <li>Enter your M-Pesa PIN</li>
                <li>Wait for confirmation</li>
              </ol>
            </div>
          </div>
        )}

        {currentSession.status === 'completed' && currentSession.mpesaReceiptNumber && (
          <div className="mb-6 bg-gray-50 rounded-lg p-4">
            <p className="text-sm text-gray-600 mb-1">Receipt Number:</p>
            <p className="text-lg font-mono font-semibold text-gray-800">
              {currentSession.mpesaReceiptNumber}
            </p>
          </div>
        )}

        <div className="flex justify-end space-x-4">
          {currentSession.status === 'pending' && (
            <button
              onClick={onCancel}
              className="px-6 py-2 rounded-md text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
          )}
          {currentSession.status === 'completed' && (
            <button
              onClick={onComplete}
              className="px-6 py-2 rounded-md text-white bg-green-600 hover:bg-green-700 transition-colors"
            >
              Done
            </button>
          )}
          {(currentSession.status === 'failed' || currentSession.status === 'cancelled') && (
            <button
              onClick={onCancel}
              className="px-6 py-2 rounded-md text-white bg-red-600 hover:bg-red-700 transition-colors"
            >
              Close
            </button>
          )}
        </div>

        {isPolling && currentSession.status === 'pending' && (
          <p className="text-xs text-gray-500 text-center mt-4">
            Checking payment status...
          </p>
        )}
      </div>
    </div>
  );
};

export default MpesaPaymentStatus;






