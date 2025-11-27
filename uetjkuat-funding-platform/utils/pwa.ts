/**
 * PWA Utilities
 */

/**
 * Register service worker
 */
export const registerServiceWorker = async (): Promise<void> => {
  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.register('/service-worker.js');
      console.log('Service Worker registered successfully:', registration);

      // Check for updates
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              // New service worker available
              console.log('New content available, please refresh.');
              
              // Optionally show update notification
              if (confirm('New version available! Reload to update?')) {
                window.location.reload();
              }
            }
          });
        }
      });
    } catch (error) {
      console.error('Service Worker registration failed:', error);
    }
  }
};

/**
 * Unregister service worker
 */
export const unregisterServiceWorker = async (): Promise<void> => {
  if ('serviceWorker' in navigator) {
    const registrations = await navigator.serviceWorker.getRegistrations();
    for (const registration of registrations) {
      await registration.unregister();
    }
  }
};

/**
 * Check if app is installed
 */
export const isAppInstalled = (): boolean => {
  return window.matchMedia('(display-mode: standalone)').matches ||
         (window.navigator as any).standalone === true;
};

/**
 * Check if device is mobile
 */
export const isMobile = (): boolean => {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  );
};

/**
 * Check if device is iOS
 */
export const isIOS = (): boolean => {
  return /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
};

/**
 * Check if device is Android
 */
export const isAndroid = (): boolean => {
  return /Android/.test(navigator.userAgent);
};

/**
 * Request notification permission
 */
export const requestNotificationPermission = async (): Promise<NotificationPermission> => {
  if ('Notification' in window) {
    return await Notification.requestPermission();
  }
  return 'denied';
};

/**
 * Show notification
 */
export const showNotification = async (
  title: string,
  options?: NotificationOptions
): Promise<void> => {
  if ('Notification' in window && Notification.permission === 'granted') {
    if ('serviceWorker' in navigator) {
      const registration = await navigator.serviceWorker.ready;
      await registration.showNotification(title, {
        icon: '/icons/icon-192x192.png',
        badge: '/icons/icon-72x72.png',
        vibrate: [200, 100, 200],
        ...options,
      });
    } else {
      new Notification(title, options);
    }
  }
};

/**
 * Add to home screen prompt
 */
export const canInstallPWA = (): boolean => {
  return !isAppInstalled() && (isAndroid() || isIOS());
};

/**
 * Get device info
 */
export const getDeviceInfo = () => {
  return {
    isMobile: isMobile(),
    isIOS: isIOS(),
    isAndroid: isAndroid(),
    isInstalled: isAppInstalled(),
    canInstall: canInstallPWA(),
    userAgent: navigator.userAgent,
    platform: navigator.platform,
    language: navigator.language,
  };
};

/**
 * Check online status
 */
export const isOnline = (): boolean => {
  return navigator.onLine;
};

/**
 * Listen for online/offline events
 */
export const onConnectionChange = (
  callback: (isOnline: boolean) => void
): (() => void) => {
  const handleOnline = () => callback(true);
  const handleOffline = () => callback(false);

  window.addEventListener('online', handleOnline);
  window.addEventListener('offline', handleOffline);

  return () => {
    window.removeEventListener('online', handleOnline);
    window.removeEventListener('offline', handleOffline);
  };
};

export default {
  registerServiceWorker,
  unregisterServiceWorker,
  isAppInstalled,
  isMobile,
  isIOS,
  isAndroid,
  requestNotificationPermission,
  showNotification,
  canInstallPWA,
  getDeviceInfo,
  isOnline,
  onConnectionChange,
};
