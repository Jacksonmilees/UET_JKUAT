/**
 * Haptic Feedback Utilities for Mobile Devices
 */

export const haptics = {
  /**
   * Light haptic feedback (10ms)
   * Use for: Button taps, checkbox toggles
   */
  light: () => {
    if ('vibrate' in navigator) {
      navigator.vibrate(10);
    }
  },
  
  /**
   * Medium haptic feedback (20ms)
   * Use for: Swipe actions, pull-to-refresh
   */
  medium: () => {
    if ('vibrate' in navigator) {
      navigator.vibrate(20);
    }
  },
  
  /**
   * Heavy haptic feedback (30ms)
   * Use for: Important actions, errors
   */
  heavy: () => {
    if ('vibrate' in navigator) {
      navigator.vibrate(30);
    }
  },
  
  /**
   * Success pattern (short-long-short)
   * Use for: Successful form submissions, payments
   */
  success: () => {
    if ('vibrate' in navigator) {
      navigator.vibrate([10, 50, 10]);
    }
  },
  
  /**
   * Error pattern (long-pause-long)
   * Use for: Form errors, failed actions
   */
  error: () => {
    if ('vibrate' in navigator) {
      navigator.vibrate([50, 100, 50]);
    }
  },
  
  /**
   * Warning pattern (medium-pause-medium-pause-medium)
   * Use for: Warnings, confirmations needed
   */
  warning: () => {
    if ('vibrate' in navigator) {
      navigator.vibrate([20, 50, 20, 50, 20]);
    }
  },
  
  /**
   * Selection pattern (very short)
   * Use for: List item selection, tab changes
   */
  selection: () => {
    if ('vibrate' in navigator) {
      navigator.vibrate(5);
    }
  },
};

export default haptics;
