

import React, { useState, useEffect } from 'react';
import { IconCheck, IconClose } from '../icons';

interface PaymentSimulationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const PaymentSimulationModal: React.FC<PaymentSimulationModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [status, setStatus] = useState<'pending' | 'processing' | 'success'>('pending');

  useEffect(() => {
    let processTimeout: number;
    let successTimeout: number;

    if (isOpen) {
      setStatus('processing');
      processTimeout = window.setTimeout(() => {
        setStatus('success');
      }, 3000); // Simulate 3s processing time

      successTimeout = window.setTimeout(() => {
        onSuccess();
        onClose();
      }, 5000); // Wait 2s on success screen then close
    }

    return () => {
      clearTimeout(processTimeout);
      clearTimeout(successTimeout);
      setStatus('pending');
    };
  }, [isOpen, onSuccess, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-2xl p-6 max-w-sm w-full relative transform transition-all duration-300 animate-scale-in">
        {status !== 'success' && (
             <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
                <IconClose className="w-6 h-6" />
            </button>
        )}
       
        <div className="flex flex-col items-center text-center">
          {status === 'processing' && (
            <>
              <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-600 mb-4"></div>
              <h2 className="text-xl font-bold text-gray-800 mb-2">Processing Payment</h2>
              <p className="text-gray-600">Awaiting M-Pesa STK push confirmation for <span className="font-bold">KES 100</span>. Please check your phone and enter your PIN.</p>
            </>
          )}

          {status === 'success' && (
            <>
              <div className="bg-green-100 p-4 rounded-full mb-4">
                <IconCheck className="w-12 h-12 text-green-600" />
              </div>
              <h2 className="text-xl font-bold text-green-800 mb-2">Payment Successful!</h2>
              <p className="text-gray-600">Your registration is complete. Redirecting you to the dashboard...</p>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default PaymentSimulationModal;