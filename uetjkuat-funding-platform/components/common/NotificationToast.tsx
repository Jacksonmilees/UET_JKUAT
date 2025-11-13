
import React, { useContext } from 'react';
import { NotificationContext } from '../../contexts/NotificationContext';

const NotificationToast: React.FC = () => {
  const { notification, clearNotification } = useContext(NotificationContext);

  if (!notification) {
    return null;
  }

  return (
    <div 
      className="fixed bottom-5 right-5 bg-gray-800 text-white py-3 px-6 rounded-lg shadow-lg z-50 animate-toast-in-out"
      onAnimationEnd={clearNotification}
    >
      <p>{notification.message}</p>
    </div>
  );
};

export default NotificationToast;