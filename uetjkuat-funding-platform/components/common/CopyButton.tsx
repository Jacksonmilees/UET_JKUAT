import React, { useState } from 'react';
import { IconCheck } from '../icons';
import { copyToClipboard } from '../../utils/clipboard';
import { haptics } from '../../utils/haptics';

interface CopyButtonProps {
  text: string;
  label?: string;
  className?: string;
  onCopy?: () => void;
}

const CopyButton: React.FC<CopyButtonProps> = ({ 
  text, 
  label = 'Copy',
  className = '',
  onCopy,
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    const success = await copyToClipboard(text);
    if (success) {
      setCopied(true);
      haptics.success();
      onCopy?.();
      setTimeout(() => setCopied(false), 2000);
    } else {
      haptics.error();
    }
  };

  return (
    <button
      onClick={handleCopy}
      className={`
        flex items-center gap-2 px-3 py-2 text-sm font-medium 
        rounded-lg transition-all duration-200
        ${copied 
          ? 'text-green-600 bg-green-50' 
          : 'text-gray-700 hover:text-blue-600 hover:bg-blue-50'
        }
        ${className}
      `}
    >
      {copied ? (
        <>
          <IconCheck className="w-4 h-4" />
          <span>Copied!</span>
        </>
      ) : (
        <>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
          <span>{label}</span>
        </>
      )}
    </button>
  );
};

export default CopyButton;
