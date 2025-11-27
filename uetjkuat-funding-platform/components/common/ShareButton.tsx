import React, { useState } from 'react';
import { shareContent, shareViaWhatsApp, shareViaTwitter, shareViaFacebook } from '../../utils/share';
import { haptics } from '../../utils/haptics';

interface ShareButtonProps {
  title: string;
  text: string;
  url: string;
  className?: string;
}

const ShareButton: React.FC<ShareButtonProps> = ({ 
  title, 
  text, 
  url,
  className = '',
}) => {
  const [showMenu, setShowMenu] = useState(false);

  const handleNativeShare = async () => {
    haptics.light();
    const success = await shareContent({ title, text, url });
    
    if (success) {
      haptics.success();
      setShowMenu(false);
    }
  };

  const handleWhatsAppShare = () => {
    haptics.light();
    shareViaWhatsApp(text, url);
    setShowMenu(false);
  };

  const handleTwitterShare = () => {
    haptics.light();
    shareViaTwitter(text, url);
    setShowMenu(false);
  };

  const handleFacebookShare = () => {
    haptics.light();
    shareViaFacebook(url);
    setShowMenu(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setShowMenu(!showMenu)}
        className={`
          flex items-center gap-2 px-4 py-2 text-sm font-medium 
          text-gray-700 hover:text-blue-600 hover:bg-blue-50
          rounded-lg transition-all duration-200
          ${className}
        `}
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
        </svg>
        <span>Share</span>
      </button>

      {/* Share Menu */}
      {showMenu && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setShowMenu(false)}
          />
          
          {/* Menu */}
          <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-2xl border border-gray-200 py-2 z-50 animate-scale-in">
            <button
              onClick={handleNativeShare}
              className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors flex items-center gap-3"
            >
              <span className="text-lg">📤</span>
              <span>Share via...</span>
            </button>
            
            <button
              onClick={handleWhatsAppShare}
              className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-green-50 hover:text-green-600 transition-colors flex items-center gap-3"
            >
              <span className="text-lg">💬</span>
              <span>WhatsApp</span>
            </button>
            
            <button
              onClick={handleTwitterShare}
              className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors flex items-center gap-3"
            >
              <span className="text-lg">🐦</span>
              <span>Twitter</span>
            </button>
            
            <button
              onClick={handleFacebookShare}
              className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors flex items-center gap-3"
            >
              <span className="text-lg">📘</span>
              <span>Facebook</span>
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default ShareButton;
