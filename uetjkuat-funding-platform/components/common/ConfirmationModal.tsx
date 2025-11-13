

import React from 'react';
import { IconClose, IconTrash } from '../icons';

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({ isOpen, onClose, onConfirm, title, message }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-2xl p-6 max-w-sm w-full relative transform transition-all duration-300 animate-scale-in">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
          <IconClose className="w-6 h-6" />
        </button>
        <div className="flex flex-col items-center text-center">
            <div className="bg-red-100 p-3 rounded-full mb-4">
                <IconTrash className="w-8 h-8 text-red-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">{title}</h2>
            <p className="text-gray-600 mb-6">{message}</p>
            
            <div className="flex justify-center space-x-4 w-full">
                <button
                type="button"
                onClick={onClose}
                className="flex-1 px-6 py-2 rounded-md text-gray-700 bg-gray-200 hover:bg-gray-300 transition-colors font-semibold"
                >
                Cancel
                </button>
                <button
                type="button"
                onClick={onConfirm}
                className="flex-1 px-6 py-2 rounded-md text-white bg-red-600 hover:bg-red-700 transition-colors font-semibold"
                >
                Delete
                </button>
            </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;