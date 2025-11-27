import React, { useState, useEffect } from 'react';
import { IconX, IconDownload } from '../icons';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const InstallPrompt: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
      return;
    }

    // Listen for install prompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      
      // Show prompt after 3 seconds
      setTimeout(() => {
        const dismissed = localStorage.getItem('pwa-install-dismissed');
        if (!dismissed) {
          setShowPrompt(true);
        }
      }, 3000);
    };

    // Listen for successful install
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setShowPrompt(false);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    // Show the install prompt
    deferredPrompt.prompt();

    // Wait for the user's response
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      console.log('User accepted the install prompt');
    } else {
      console.log('User dismissed the install prompt');
    }

    setDeferredPrompt(null);
    setShowPrompt(false);
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem('pwa-install-dismissed', 'true');
  };

  if (isInstalled || !showPrompt) return null;

  return (
    <div className="fixed bottom-20 md:bottom-4 left-4 right-4 md:left-auto md:right-4 md:max-w-sm z-50 animate-slide-up">
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl shadow-2xl p-4 text-white">
        <button
          onClick={handleDismiss}
          className="absolute top-2 right-2 text-white/80 hover:text-white transition-colors"
          aria-label="Dismiss"
        >
          <IconX className="w-5 h-5" />
        </button>

        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 bg-white/20 rounded-xl p-3">
            <IconDownload className="w-8 h-8" />
          </div>

          <div className="flex-1 pr-6">
            <h3 className="font-bold text-lg mb-1">Install UET JKUAT App</h3>
            <p className="text-white/90 text-sm mb-4">
              Install our app for quick access, offline support, and a better experience!
            </p>

            <div className="flex gap-2">
              <button
                onClick={handleInstallClick}
                className="flex-1 bg-white text-indigo-600 px-4 py-2 rounded-xl font-bold hover:bg-gray-100 transition-all shadow-lg"
              >
                Install Now
              </button>
              <button
                onClick={handleDismiss}
                className="px-4 py-2 text-white/90 hover:text-white transition-colors text-sm"
              >
                Later
              </button>
            </div>
          </div>
        </div>

        {/* Features */}
        <div className="mt-4 pt-4 border-t border-white/20">
          <div className="grid grid-cols-3 gap-2 text-xs">
            <div className="text-center">
              <div className="font-semibold">⚡ Fast</div>
              <div className="text-white/80">Quick access</div>
            </div>
            <div className="text-center">
              <div className="font-semibold">📱 Native</div>
              <div className="text-white/80">App-like feel</div>
            </div>
            <div className="text-center">
              <div className="font-semibold">🔒 Secure</div>
              <div className="text-white/80">Safe & private</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InstallPrompt;
