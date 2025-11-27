import React from 'react';
import { IconInbox } from '../icons';

interface EmptyStateProps {
  message: string;
  description?: string;
  icon?: React.ReactNode;
  action?: {
    label: string;
    onClick: () => void;
  };
}

const EmptyState: React.FC<EmptyStateProps> = ({ 
  message, 
  description,
  icon, 
  action 
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center">
      <div className="mb-6">
        {icon || <IconInbox className="w-20 h-20 text-gray-300 mx-auto" />}
      </div>
      
      <h3 className="text-xl font-bold text-gray-800 mb-2">
        {message}
      </h3>
      
      {description && (
        <p className="text-gray-600 mb-6 max-w-md">
          {description}
        </p>
      )}
      
      {action && (
        <button
          onClick={action.onClick}
          className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-xl font-bold hover:from-blue-700 hover:to-indigo-700 shadow-lg transform hover:scale-105 transition-all"
        >
          {action.label}
        </button>
      )}
    </div>
  );
};

export default EmptyState;
