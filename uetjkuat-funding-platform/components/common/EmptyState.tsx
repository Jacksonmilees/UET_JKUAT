import React from 'react';
import { Inbox } from 'lucide-react';

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
    <div className="flex flex-col items-center justify-center p-12 text-center animate-fade-in">
      <div className="mb-6 p-6 bg-secondary-800/50 rounded-full border border-secondary-700 shadow-inner">
        {icon ? (
          React.cloneElement(icon as React.ReactElement<any>, { className: "w-12 h-12 text-secondary-500" })
        ) : (
          <Inbox className="w-12 h-12 text-secondary-500" />
        )}
      </div>

      <h3 className="text-xl font-bold text-white mb-2">
        {message}
      </h3>

      {description && (
        <p className="text-secondary-400 mb-8 max-w-md leading-relaxed">
          {description}
        </p>
      )}

      {action && (
        <button
          onClick={action.onClick}
          className="px-6 py-3 bg-primary-500 text-primary-950 font-bold rounded-xl hover:bg-primary-400 shadow-glow hover:shadow-glow-lg transition-all duration-300 transform hover:-translate-y-0.5"
        >
          {action.label}
        </button>
      )}
    </div>
  );
};

export default EmptyState;
