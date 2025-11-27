import React, { useEffect, useState } from 'react';
import { MpesaSession } from '../types';
import { CheckCircle, XCircle, Clock, Smartphone, Receipt } from 'lucide-react';

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
            onComplete();
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
          icon: <CheckCircle className="w-16 h-16 text-green-500" />,
          title: 'Payment Successful!',
          message: 'Your payment has been processed successfully.',
          bgColor: 'bg-green-500/10',
          borderColor: 'border-green-500/50',
          textColor: 'text-green-400'
        };
      case 'failed':
      case 'cancelled':
        return {
          icon: <XCircle className="w-16 h-16 text-red-500" />,
          title: 'Payment Failed',
          message: currentSession.errorMessage || 'Your payment could not be processed. Please try again.',
          bgColor: 'bg-red-500/10',
          borderColor: 'border-red-500/50',
          textColor: 'text-red-400'
        };
      case 'pending':
      default:
        return {
          icon: <Clock className="w-16 h-16 text-primary-500 animate-spin-slow" />,
          title: 'Waiting for Payment',
          message: 'Please complete the payment on your phone. Enter your M-Pesa PIN when prompted.',
          bgColor: 'bg-primary-500/10',
          borderColor: 'border-primary-500/50',
          textColor: 'text-primary-400'
        };
    }
  };

  const config = getStatusConfig();

  return (
    <div className={`fixed inset-0 bg-secondary-950/90 backdrop-blur-sm flex justify-center items-center z-50 p-4 animate-fade-in`}>
      <div className={`bg-secondary-900 rounded-3xl shadow-2xl p-8 max-w-md w-full border ${config.borderColor} relative overflow-hidden`}>
        {/* Background Glow */}
        <div className={`absolute top-0 left-0 w-full h-2 ${config.bgColor.replace('/10', '')}`}></div>

        <div className={`${config.bgColor} rounded-2xl p-8 mb-8 flex flex-col items-center text-center`}>
          <div className="mb-4 drop-shadow-lg">
            {config.icon}
          </div>
          <h3 className="text-2xl font-bold text-white mt-2">{config.title}</h3>
          <p className="text-secondary-300 mt-2 leading-relaxed">{config.message}</p>
        </div>

        {currentSession.status === 'pending' && (
          <div className="mb-8 space-y-4">
            <div className="flex items-center justify-center gap-3 text-sm text-secondary-400 bg-secondary-800 p-3 rounded-xl border border-secondary-700">
              <Smartphone className="w-5 h-5 text-primary-500" />
              <span className="font-mono">{currentSession.phoneNumber}</span>
            </div>

            <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-5">
              <p className="text-sm text-blue-400 font-bold mb-3 uppercase tracking-wider">Instructions</p>
              <ol className="text-sm text-blue-300 space-y-2 list-decimal list-inside">
                <li>Check your phone for an M-Pesa prompt</li>
                <li>Enter your M-Pesa PIN</li>
                <li>Wait for confirmation</li>
              </ol>
            </div>
          </div>
        )}

        {currentSession.status === 'completed' && currentSession.mpesaReceiptNumber && (
          <div className="mb-8 bg-secondary-800 rounded-xl p-5 border border-secondary-700 flex items-center gap-4">
            <div className="p-3 bg-secondary-700 rounded-lg">
              <Receipt className="w-6 h-6 text-secondary-400" />
            </div>
            <div>
              <p className="text-xs text-secondary-500 uppercase tracking-wider font-bold">Receipt Number</p>
              <p className="text-lg font-mono font-bold text-white tracking-widest">
                {currentSession.mpesaReceiptNumber}
              </p>
            </div>
          </div>
        )}

        <div className="flex justify-end space-x-4">
          {currentSession.status === 'pending' && (
            <button
              onClick={onCancel}
              className="w-full px-6 py-3 rounded-xl text-secondary-300 bg-secondary-800 hover:bg-secondary-700 transition-colors font-bold border border-secondary-700"
            >
              Cancel
            </button>
          )}
          {currentSession.status === 'completed' && (
            <button
              onClick={onComplete}
              className="w-full px-6 py-3 rounded-xl text-primary-950 bg-primary-500 hover:bg-primary-400 transition-all duration-300 font-bold shadow-glow hover:shadow-glow-lg"
            >
              Done
            </button>
          )}
          {(currentSession.status === 'failed' || currentSession.status === 'cancelled') && (
            <button
              onClick={onCancel}
              className="w-full px-6 py-3 rounded-xl text-white bg-red-600 hover:bg-red-500 transition-colors font-bold shadow-lg"
            >
              Close
            </button>
          )}
        </div>

        {isPolling && currentSession.status === 'pending' && (
          <p className="text-xs text-secondary-500 text-center mt-6 animate-pulse">
            Checking payment status...
          </p>
        )}
      </div>
    </div>
  );
};

export default MpesaPaymentStatus;






