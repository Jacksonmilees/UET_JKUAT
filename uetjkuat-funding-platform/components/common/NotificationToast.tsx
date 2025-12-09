
import React, { useContext } from 'react';
import { NotificationContext, NotificationType } from '../../contexts/NotificationContext';
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react';

const NotificationToast: React.FC = () => {
  const { notifications, removeNotification } = useContext(NotificationContext);

  if (notifications.length === 0) {
    return null;
  }

  const getConfig = (type: NotificationType) => {
    switch (type) {
      case 'success':
        return {
          icon: CheckCircle,
          bgClass: 'bg-green-500/10 backdrop-blur-xl',
          borderClass: 'border-green-500/30',
          textClass: 'text-green-500',
          iconClass: 'text-green-500',
        };
      case 'error':
        return {
          icon: XCircle,
          bgClass: 'bg-red-500/10 backdrop-blur-xl',
          borderClass: 'border-red-500/30',
          textClass: 'text-red-500',
          iconClass: 'text-red-500',
        };
      case 'warning':
        return {
          icon: AlertTriangle,
          bgClass: 'bg-yellow-500/10 backdrop-blur-xl',
          borderClass: 'border-yellow-500/30',
          textClass: 'text-yellow-500',
          iconClass: 'text-yellow-500',
        };
      case 'info':
      default:
        return {
          icon: Info,
          bgClass: 'bg-blue-500/10 backdrop-blur-xl',
          borderClass: 'border-blue-500/30',
          textClass: 'text-blue-500',
          iconClass: 'text-blue-500',
        };
    }
  };

  return (
    <div className="fixed top-20 right-4 z-[100] flex flex-col gap-3 max-w-sm w-full pointer-events-none">
      {notifications.map((notification) => {
        const config = getConfig(notification.type);
        const Icon = config.icon;

        return (
          <div
            key={notification.id}
            className={`
              ${config.bgClass} ${config.borderClass}
              border rounded-xl p-4 shadow-2xl
              animate-slide-in-right pointer-events-auto
              flex items-start gap-3
              transform transition-all duration-300 hover:scale-[1.02]
            `}
          >
            <div className={`flex-shrink-0 ${config.iconClass}`}>
              <Icon className="w-5 h-5" />
            </div>
            <p className={`flex-1 text-sm font-medium ${config.textClass}`}>
              {notification.message}
            </p>
            <button
              onClick={() => removeNotification(notification.id)}
              className={`flex-shrink-0 ${config.textClass} hover:opacity-70 transition-opacity`}
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
};

export default NotificationToast;