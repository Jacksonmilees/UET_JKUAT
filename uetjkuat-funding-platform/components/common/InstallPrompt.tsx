import React, { useState, useEffect } from 'react';
import { X, Download, Zap, Smartphone, Shield, Wifi, Star } from 'lucide-react';

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

      // Show prompt after 5 seconds
      setTimeout(() => {
        const dismissed = localStorage.getItem('pwa-install-dismissed');
        const dismissedTime = localStorage.getItem('pwa-install-dismissed-time');
        
        // Only show again if dismissed more than 7 days ago
        if (dismissed && dismissedTime) {
          const daysSinceDismiss = (Date.now() - parseInt(dismissedTime)) / (1000 * 60 * 60 * 24);
          if (daysSinceDismiss < 7) return;
        }
        
        if (!dismissed) {
          setShowPrompt(true);
        }
      }, 5000);
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
    localStorage.setItem('pwa-install-dismissed-time', Date.now().toString());
  };

  if (isInstalled || !showPrompt) return null;

  return (
    <div className="fixed bottom-20 md:bottom-6 left-4 right-4 md:left-auto md:right-6 md:max-w-sm z-50 animate-in slide-in-from-bottom-4 fade-in duration-500">
      <div className="bg-background/80 backdrop-blur-xl border border-border/50 rounded-2xl shadow-2xl overflow-hidden">
        {/* Header with subtle gradient */}
        <div className="bg-gradient-to-r from-gray-900/10 to-gray-800/10 dark:from-white/5 dark:to-white/10 px-5 py-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 p-0.5">
                <div className="w-full h-full bg-background rounded-[10px] flex items-center justify-center">
                  <img 
                    src="/icons/favicon-96x96.png" 
                    alt="UET JKUAT" 
                    className="w-8 h-8 rounded-lg"
                  />
                </div>
              </div>
              <div>
                <h3 className="font-bold text-foreground">Install UET JKUAT</h3>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Star className="w-3 h-3 fill-foreground text-foreground" />
                  <span>Better experience as an app</span>
                </div>
              </div>
            </div>
            <button
              onClick={handleDismiss}
              className="p-1.5 -mr-1 -mt-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-colors"
              aria-label="Dismiss"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Benefits */}
        <div className="px-5 py-4">
          <div className="grid grid-cols-3 gap-3 mb-4">
            <div className="text-center p-2 rounded-lg bg-secondary/30 backdrop-blur-sm">
              <div className="flex justify-center mb-1.5">
                <div className="w-8 h-8 rounded-full bg-foreground/10 flex items-center justify-center">
                  <Wifi className="w-4 h-4 text-foreground" />
                </div>
              </div>
              <div className="text-xs font-medium text-foreground">Offline</div>
              <div className="text-[10px] text-muted-foreground">Access</div>
            </div>
            <div className="text-center p-2 rounded-lg bg-secondary/30 backdrop-blur-sm">
              <div className="flex justify-center mb-1.5">
                <div className="w-8 h-8 rounded-full bg-foreground/10 flex items-center justify-center">
                  <Zap className="w-4 h-4 text-foreground" />
                </div>
              </div>
              <div className="text-xs font-medium text-foreground">Faster</div>
              <div className="text-[10px] text-muted-foreground">Loading</div>
            </div>
            <div className="text-center p-2 rounded-lg bg-secondary/30 backdrop-blur-sm">
              <div className="flex justify-center mb-1.5">
                <div className="w-8 h-8 rounded-full bg-foreground/10 flex items-center justify-center">
                  <Smartphone className="w-4 h-4 text-foreground" />
                </div>
              </div>
              <div className="text-xs font-medium text-foreground">Native</div>
              <div className="text-[10px] text-muted-foreground">Feel</div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex gap-3">
            <button
              onClick={handleInstallClick}
              className="flex-1 flex items-center justify-center gap-2 bg-foreground text-background px-4 py-3 rounded-xl text-sm font-semibold hover:bg-foreground/90 transition-all shadow-lg"
            >
              <Download className="w-4 h-4" />
              Install App
            </button>
            <button
              onClick={handleDismiss}
              className="px-4 py-3 text-muted-foreground hover:text-foreground hover:bg-secondary/50 rounded-xl transition-colors text-sm font-medium"
            >
              Not now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InstallPrompt;
