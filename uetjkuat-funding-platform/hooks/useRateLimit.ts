import { useState, useEffect } from 'react';

interface RateLimitResult {
  checkRateLimit: () => boolean;
  isLimited: boolean;
  timeUntilReset: number;
  requestCount: number;
}

/**
 * Hook to implement client-side rate limiting
 * @param maxRequests - Maximum number of requests allowed
 * @param windowMs - Time window in milliseconds
 * @returns Rate limit state and check function
 */
export const useRateLimit = (maxRequests: number, windowMs: number): RateLimitResult => {
  const [requests, setRequests] = useState<number[]>([]);
  const [isLimited, setIsLimited] = useState(false);
  const [timeUntilReset, setTimeUntilReset] = useState(0);

  const checkRateLimit = (): boolean => {
    const now = Date.now();
    const recentRequests = requests.filter(time => now - time < windowMs);
    
    if (recentRequests.length >= maxRequests) {
      setIsLimited(true);
      const oldestRequest = Math.min(...recentRequests);
      setTimeUntilReset(Math.ceil((windowMs - (now - oldestRequest)) / 1000));
      return false;
    }
    
    setRequests([...recentRequests, now]);
    setIsLimited(false);
    return true;
  };

  useEffect(() => {
    if (isLimited && timeUntilReset > 0) {
      const timer = setInterval(() => {
        setTimeUntilReset(prev => {
          if (prev <= 1) {
            setIsLimited(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      
      return () => clearInterval(timer);
    }
  }, [isLimited, timeUntilReset]);

  return { 
    checkRateLimit, 
    isLimited, 
    timeUntilReset,
    requestCount: requests.length,
  };
};

export default useRateLimit;
