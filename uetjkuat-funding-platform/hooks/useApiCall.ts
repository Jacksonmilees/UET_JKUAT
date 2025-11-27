import { useState, useCallback, useRef, useEffect } from 'react';
import { retryWithBackoff } from '../utils/retry';

export interface UseApiCallOptions {
  retry?: boolean;
  maxRetries?: number;
  onSuccess?: (data: any) => void;
  onError?: (error: Error) => void;
}

export interface UseApiCallResult<T, Args extends any[]> {
  data: T | null;
  loading: boolean;
  error: Error | null;
  execute: (...args: Args) => Promise<T | undefined>;
  reset: () => void;
}

/**
 * Custom hook for API calls with loading, error states, and retry logic
 */
export const useApiCall = <T, Args extends any[]>(
  apiFunction: (...args: Args) => Promise<T>,
  options: UseApiCallOptions = {}
): UseApiCallResult<T, Args> => {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  
  const abortControllerRef = useRef<AbortController | null>(null);
  const isMountedRef = useRef(true);

  const {
    retry = true,
    maxRetries = 3,
    onSuccess,
    onError,
  } = options;

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      abortControllerRef.current?.abort();
    };
  }, []);

  const execute = useCallback(
    async (...args: Args): Promise<T | undefined> => {
      // Cancel previous request
      abortControllerRef.current?.abort();
      abortControllerRef.current = new AbortController();

      try {
        setLoading(true);
        setError(null);

        let result: T;

        if (retry) {
          result = await retryWithBackoff(
            () => apiFunction(...args),
            {
              maxRetries,
              onRetry: (attempt, err) => {
                console.log(`Retry attempt ${attempt}:`, err.message);
              },
            }
          );
        } else {
          result = await apiFunction(...args);
        }

        if (isMountedRef.current) {
          setData(result);
          onSuccess?.(result);
        }

        return result;
      } catch (err) {
        const error = err as Error;
        
        if (isMountedRef.current && error.name !== 'AbortError') {
          setError(error);
          onError?.(error);
        }
        
        throw error;
      } finally {
        if (isMountedRef.current) {
          setLoading(false);
        }
      }
    },
    [apiFunction, retry, maxRetries, onSuccess, onError]
  );

  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setLoading(false);
    abortControllerRef.current?.abort();
  }, []);

  return { data, loading, error, execute, reset };
};

export default useApiCall;
