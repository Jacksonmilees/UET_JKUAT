/**
 * Retry Utilities with Exponential Backoff
 */

export interface RetryOptions {
  maxRetries?: number;
  initialDelay?: number;
  maxDelay?: number;
  backoffMultiplier?: number;
  onRetry?: (attempt: number, error: Error) => void;
}

/**
 * Retries a function with exponential backoff
 */
export const retryWithBackoff = async <T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> => {
  const {
    maxRetries = 3,
    initialDelay = 1000,
    maxDelay = 10000,
    backoffMultiplier = 2,
    onRetry,
  } = options;

  let lastError: Error;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;

      // Don't retry on last attempt
      if (attempt === maxRetries - 1) {
        break;
      }

      // Calculate delay with exponential backoff
      const delay = Math.min(
        initialDelay * Math.pow(backoffMultiplier, attempt),
        maxDelay
      );

      console.log(
        `Retry attempt ${attempt + 1}/${maxRetries} after ${delay}ms`,
        lastError.message
      );

      // Call retry callback if provided
      if (onRetry) {
        onRetry(attempt + 1, lastError);
      }

      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  throw lastError!;
};

/**
 * Retries only on specific error types
 */
export const retryOnCondition = async <T>(
  fn: () => Promise<T>,
  shouldRetry: (error: Error) => boolean,
  options: RetryOptions = {}
): Promise<T> => {
  const {
    maxRetries = 3,
    initialDelay = 1000,
    onRetry,
  } = options;

  let lastError: Error;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;

      // Check if we should retry this error
      if (!shouldRetry(lastError) || attempt === maxRetries - 1) {
        throw lastError;
      }

      const delay = initialDelay * Math.pow(2, attempt);
      
      if (onRetry) {
        onRetry(attempt + 1, lastError);
      }

      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  throw lastError!;
};

/**
 * Check if error is retryable (network errors, 5xx errors)
 */
export const isRetryableError = (error: Error): boolean => {
  const retryableMessages = [
    'network',
    'timeout',
    'fetch',
    'ECONNREFUSED',
    'ETIMEDOUT',
  ];

  const message = error.message.toLowerCase();
  return retryableMessages.some(msg => message.includes(msg));
};

/**
 * Retry with timeout
 */
export const retryWithTimeout = async <T>(
  fn: () => Promise<T>,
  timeoutMs: number,
  retryOptions: RetryOptions = {}
): Promise<T> => {
  return Promise.race([
    retryWithBackoff(fn, retryOptions),
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error('Operation timed out')), timeoutMs)
    ),
  ]);
};

export default {
  retryWithBackoff,
  retryOnCondition,
  isRetryableError,
  retryWithTimeout,
};
