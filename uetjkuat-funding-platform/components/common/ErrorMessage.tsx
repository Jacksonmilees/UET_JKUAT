import React from 'react';
import { IconAlertCircle, IconRefresh } from '../icons';

interface ErrorMessageProps {
  error: Error | string;
  retry?: () => void;
  onDismiss?: () => void;
  variant?: 'error' | 'warning' | 'info';
}

const ErrorMessage: React.FC<ErrorMessageProps> = ({ 
  error, 
  retry, 
  onDismiss,
  variant = 'error' 
}) => {
  const errorMessage = typeof error === 'string' ? error : error.message;

  const variantStyles = {
    error: {
      bg: 'bg-red-50',
      border: 'border-red-200',
      text: 'text-red-800',
      icon: 'text-red-500',
    },
    warning: {
      bg: 'bg-yellow-50',
      border: 'border-yellow-200',
      text: 'text-yellow-800',
      icon: 'text-yellow-500',
    },
    info: {
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      text: 'text-blue-800',
      icon: 'text-blue-500',
    },
  };

  const styles = variantStyles[variant];

  return (
    <div className={`${styles.bg} border ${styles.border} rounded-xl p-6 shadow-lg`}>
      <div className="flex items-start gap-4">
        <IconAlertCircle className={`w-6 h-6 ${styles.icon} flex-shrink-0 mt-0.5`} />
        
        <div className="flex-1">
          <h3 className={`font-bold ${styles.text} mb-2`}>
            {variant === 'error' ? 'Error' : variant === 'warning' ? 'Warning' : 'Information'}
          </h3>
          <p className={`${styles.text} text-sm`}>{errorMessage}</p>
          
          {(retry || onDismiss) && (
            <div className="flex gap-3 mt-4">
              {retry && (
                <button
                  onClick={retry}
                  className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-all font-semibold text-sm shadow-sm"
                >
                  <IconRefresh className="w-4 h-4" />
                  Try Again
                </button>
              )}
              {onDismiss && (
                <button
                  onClick={onDismiss}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-all font-semibold text-sm"
                >
                  Dismiss
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ErrorMessage;
