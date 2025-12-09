import React, { useState, useEffect } from 'react';

const PWASplashScreen: React.FC = () => {
  const [isVisible, setIsVisible] = useState(true);
  const [isAnimatingOut, setIsAnimatingOut] = useState(false);

  useEffect(() => {
    // Check if running as PWA
    const isPWA = window.matchMedia('(display-mode: standalone)').matches ||
                  (window.navigator as any).standalone === true;
    
    if (!isPWA) {
      setIsVisible(false);
      return;
    }

    // Check if already shown in this session
    const hasShown = sessionStorage.getItem('pwa-splash-shown');
    if (hasShown) {
      setIsVisible(false);
      return;
    }

    // Mark as shown
    sessionStorage.setItem('pwa-splash-shown', 'true');

    // Animate out after 1.5 seconds
    const timer = setTimeout(() => {
      setIsAnimatingOut(true);
      setTimeout(() => setIsVisible(false), 500);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  if (!isVisible) return null;

  return (
    <div 
      className={`fixed inset-0 z-[100] bg-background flex flex-col items-center justify-center transition-opacity duration-500 ${
        isAnimatingOut ? 'opacity-0' : 'opacity-100'
      }`}
    >
      {/* Animated gradient background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-1/2 -left-1/2 w-[200%] h-[200%] bg-gradient-conic from-primary/20 via-orange-500/10 to-primary/20 animate-spin-slow" />
      </div>
      
      {/* Content */}
      <div className="relative z-10 flex flex-col items-center">
        {/* Logo with pulse animation */}
        <div className="relative mb-8">
          <div className="absolute inset-0 bg-primary/30 rounded-3xl blur-xl animate-pulse" />
          <div className="relative w-24 h-24 bg-gradient-to-br from-primary to-orange-500 rounded-3xl p-1 shadow-2xl">
            <div className="w-full h-full bg-card rounded-[20px] flex items-center justify-center">
              <img 
                src="/icons/favicon-96x96.png" 
                alt="UET JKUAT" 
                className="w-16 h-16 rounded-2xl"
              />
            </div>
          </div>
        </div>

        {/* App name */}
        <h1 className="text-2xl font-bold text-foreground mb-2">UET JKUAT</h1>
        <p className="text-muted-foreground text-sm mb-8">Missions & Ministry Platform</p>

        {/* Loading indicator */}
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:-0.3s]" />
          <div className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:-0.15s]" />
          <div className="w-2 h-2 bg-primary rounded-full animate-bounce" />
        </div>
      </div>
    </div>
  );
};

export default PWASplashScreen;
