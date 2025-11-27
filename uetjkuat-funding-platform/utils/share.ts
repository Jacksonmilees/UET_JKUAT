/**
 * Share utilities for web and mobile
 */

import { copyToClipboard } from './clipboard';

export interface ShareData {
  title: string;
  text: string;
  url: string;
}

/**
 * Share content using native share API or fallback to clipboard
 */
export const shareContent = async (data: ShareData): Promise<boolean> => {
  try {
    // Check if native share is available (mobile devices)
    if (navigator.share) {
      await navigator.share(data);
      return true;
    } else {
      // Fallback: Copy link to clipboard
      const shareText = `${data.title}\n\n${data.text}\n\n${data.url}`;
      const success = await copyToClipboard(shareText);
      return success;
    }
  } catch (error) {
    // User cancelled share or error occurred
    console.error('Share failed:', error);
    return false;
  }
};

/**
 * Check if native share is available
 */
export const isShareAvailable = (): boolean => {
  return !!navigator.share;
};

/**
 * Share via WhatsApp
 */
export const shareViaWhatsApp = (text: string, url: string): void => {
  const message = encodeURIComponent(`${text}\n\n${url}`);
  const whatsappUrl = `https://wa.me/?text=${message}`;
  window.open(whatsappUrl, '_blank');
};

/**
 * Share via Twitter
 */
export const shareViaTwitter = (text: string, url: string): void => {
  const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
  window.open(twitterUrl, '_blank');
};

/**
 * Share via Facebook
 */
export const shareViaFacebook = (url: string): void => {
  const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
  window.open(facebookUrl, '_blank');
};

export default shareContent;
