/**
 * Copy text to clipboard utility
 * Works across all browsers with fallback for older browsers
 */

export const copyToClipboard = async (text: string): Promise<boolean> => {
  try {
    // Modern clipboard API (preferred)
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    } else {
      // Fallback for older browsers or non-HTTPS
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      textArea.style.top = '-999999px';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      
      try {
        const successful = document.execCommand('copy');
        textArea.remove();
        return successful;
      } catch (error) {
        console.error('Fallback copy failed:', error);
        textArea.remove();
        return false;
      }
    }
  } catch (error) {
    console.error('Copy to clipboard failed:', error);
    return false;
  }
};

/**
 * Check if clipboard API is available
 */
export const isClipboardAvailable = (): boolean => {
  return !!(navigator.clipboard && window.isSecureContext);
};

export default copyToClipboard;
