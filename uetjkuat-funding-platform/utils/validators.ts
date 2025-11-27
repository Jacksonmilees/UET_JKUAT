/**
 * API Response Validation Utilities
 */

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

/**
 * Validates API response and throws error if invalid
 */
export const validateApiResponse = <T>(response: any): T => {
  if (!response) {
    throw new Error('Empty response from server');
  }
  
  if (response.error) {
    throw new Error(response.error);
  }
  
  if (response.success === false) {
    throw new Error(response.message || 'Request failed');
  }
  
  return response.data as T;
};

/**
 * Validates required fields in an object
 */
export const validateRequiredFields = (
  data: Record<string, any>,
  requiredFields: string[]
): void => {
  const missingFields = requiredFields.filter(field => !data[field]);
  
  if (missingFields.length > 0) {
    throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
  }
};

/**
 * Validates email format
 */
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validates phone number (Kenyan format)
 */
export const validatePhoneNumber = (phone: string): boolean => {
  // Kenyan phone: 254XXXXXXXXX or 07XXXXXXXX or +254XXXXXXXXX
  const phoneRegex = /^(\+?254|0)?[17]\d{8}$/;
  return phoneRegex.test(phone.replace(/\s/g, ''));
};

/**
 * Sanitizes user input
 */
export const sanitizeInput = (input: string): string => {
  return input.trim().replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
};

/**
 * Validates amount (must be positive number)
 */
export const validateAmount = (amount: number): boolean => {
  return typeof amount === 'number' && amount > 0 && isFinite(amount);
};

/**
 * Validates date is not in the past
 */
export const validateFutureDate = (date: string | Date): boolean => {
  const inputDate = new Date(date);
  const now = new Date();
  return inputDate > now;
};

export default {
  validateApiResponse,
  validateRequiredFields,
  validateEmail,
  validatePhoneNumber,
  sanitizeInput,
  validateAmount,
  validateFutureDate,
};
