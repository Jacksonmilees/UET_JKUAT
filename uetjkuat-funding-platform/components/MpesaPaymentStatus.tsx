import React, { useEffect, useState } from 'react';
import { MpesaSession } from '../types';
import { CheckCircle, XCircle, Clock, Smartphone, Receipt, Loader2, AlertTriangle, Timer } from 'lucide-react';

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
  const [timeElapsed, setTimeElapsed] = useState(0);

  useEffect(() => {
    if (session) {
      setCurrentSession(session);
      setTimeElapsed(0);
    }
  }, [session]);

  // Timer for pending state
  useEffect(() => {
    if (currentSession?.status === 'pending') {
      const timer = setInterval(() => {
        setTimeElapsed(prev => prev + 1);
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [currentSession?.status]);

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

  const isTimeout = timeElapsed >= 60;

  const getStatusConfig = () => {
    if (isTimeout && currentSession.status === 'pending') {
      return {
        icon: <AlertTriangle className="w-16 h-16 text-yellow-500" />,
        title: 'Taking Too Long?',
        message: 'The payment seems to be taking longer than expected. Please check your phone or try again.',
        bgColor: 'bg-yellow-500/10',
        borderColor: 'border-yellow-500/30',
        accentColor: 'from-yellow-500 to-orange-500'
      };
    }
    
    switch (currentSession.status) {
      case 'completed':
        return {
          icon: <CheckCircle className="w-16 h-16 text-green-500" />,
          title: 'Payment Successful!',
          message: 'Your payment has been processed successfully.',
          bgColor: 'bg-green-500/10',
          borderColor: 'border-green-500/30',
          accentColor: 'from-green-500 to-emerald-500'
        };
      case 'failed':
      case 'cancelled':
        return {
          icon: <XCircle className="w-16 h-16 text-red-500" />,
          title: currentSession.status === 'cancelled' ? 'Payment Cancelled' : 'Payment Failed',
          message: currentSession.errorMessage || 'Your payment could not be processed. Please try again.',
          bgColor: 'bg-red-500/10',
          borderColor: 'border-red-500/30',
          accentColor: 'from-red-500 to-rose-500'
        };
      case 'pending':
      default:
        return {
          icon: <Loader2 className="w-16 h-16 text-primary animate-spin" />,
          title: 'Waiting for Payment',
          message: 'Please complete the payment on your phone. Enter your M-Pesa PIN when prompted.',
          bgColor: 'bg-primary/10',
          borderColor: 'border-primary/30',
          accentColor: 'from-primary to-orange-500'
        };
    }
  };

  const config = getStatusConfig();

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex justify-center items-center z-50 p-4 animate-in fade-in duration-300">
      <div className="bg-card rounded-3xl shadow-2xl max-w-md w-full overflow-hidden border border-border">
        {/* Top gradient accent */}
        <div className={`h-1.5 bg-gradient-to-r ${config.accentColor}`} />

        <div className="p-6 sm:p-8">
          {/* Status Icon & Message */}
          <div className={`${config.bgColor} rounded-2xl p-6 mb-6 flex flex-col items-center text-center border ${config.borderColor}`}>
            <div className="mb-4">
              {config.icon}
            </div>
            <h3 className="text-xl font-bold text-foreground mb-2">{config.title}</h3>
            <p className="text-muted-foreground text-sm leading-relaxed">{config.message}</p>
          </div>

          {/* Pending State Details */}
          {currentSession.status === 'pending' && (
            <div className="space-y-4 mb-6">
              {/* Phone Number Display */}
              <div className="flex items-center justify-center gap-3 text-sm bg-secondary rounded-xl p-3 border border-border">
                <Smartphone className="w-5 h-5 text-primary" />
                <span className="font-mono font-medium">{currentSession.phoneNumber}</span>
              </div>

              {/* Timer */}
              <div className="flex items-center justify-center gap-2 text-muted-foreground">
                <Timer className="w-4 h-4" />
                <span className="text-sm">Time elapsed: {formatTime(timeElapsed)}</span>
              </div>

              {/* Instructions */}
              <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
                <p className="text-xs font-semibold text-blue-400 mb-2 uppercase tracking-wider">Instructions</p>
                <ol className="text-sm text-blue-300/80 space-y-1.5">
                  <li className="flex items-start gap-2">
                    <span className="w-5 h-5 rounded-full bg-blue-500/20 flex items-center justify-center text-xs font-bold text-blue-400 flex-shrink-0 mt-0.5">1</span>
                    <span>Check your phone for an M-Pesa prompt</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-5 h-5 rounded-full bg-blue-500/20 flex items-center justify-center text-xs font-bold text-blue-400 flex-shrink-0 mt-0.5">2</span>
                    <span>Enter your M-Pesa PIN to authorize</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-5 h-5 rounded-full bg-blue-500/20 flex items-center justify-center text-xs font-bold text-blue-400 flex-shrink-0 mt-0.5">3</span>
                    <span>Wait for confirmation message</span>
                  </li>
                </ol>
              </div>
            </div>
          )}

          {/* Success Receipt */}
          {currentSession.status === 'completed' && currentSession.mpesaReceiptNumber && (
            <div className="mb-6 bg-secondary rounded-xl p-4 border border-border flex items-center gap-4">
              <div className="p-3 bg-green-500/10 rounded-xl">
                <Receipt className="w-6 h-6 text-green-500" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium">Receipt Number</p>
                <p className="text-lg font-mono font-bold text-foreground tracking-widest">
                  {currentSession.mpesaReceiptNumber}
                </p>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3">
            {currentSession.status === 'pending' && (
              <button
                onClick={onCancel}
                className="flex-1 px-6 py-3 rounded-xl text-foreground bg-secondary hover:bg-secondary/80 transition-colors font-semibold border border-border"
              >
                Cancel
              </button>
            )}
            {currentSession.status === 'completed' && (
              <button
                onClick={onComplete}
                className={`flex-1 px-6 py-3 rounded-xl text-white bg-gradient-to-r ${config.accentColor} hover:opacity-90 transition-all font-semibold shadow-lg`}
              >
                Continue
              </button>
            )}
            {(currentSession.status === 'failed' || currentSession.status === 'cancelled') && (
              <button
                onClick={onCancel}
                className="flex-1 px-6 py-3 rounded-xl text-white bg-gradient-to-r from-red-500 to-rose-500 hover:opacity-90 transition-colors font-semibold shadow-lg"
              >
                Close
              </button>
            )}
          </div>

          {/* Polling indicator */}
          {isPolling && currentSession.status === 'pending' && (
            <p className="text-xs text-muted-foreground text-center mt-4 flex items-center justify-center gap-2">
              <span className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse" />
              Checking payment status...
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default MpesaPaymentStatus;






