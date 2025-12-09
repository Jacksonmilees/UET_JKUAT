
// API Service Layer for UET JKUAT Funding Platform
// Connects React frontend to Laravel backend

// Use production URL as default for deployed environments
// For local development, set VITE_API_BASE_URL=http://localhost:8000/api in .env
// Default to Heroku backend URL - never use localhost in production
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://uetjkuat-54286e10a43b.herokuapp.com/api';
const API_KEY = import.meta.env.VITE_API_KEY || '';

// Warn once if API key is missing; protected endpoints will require it
if (!API_KEY) {
  // eslint-disable-next-line no-console
  console.warn('VITE_API_KEY is not set. Requests to protected /api/v1 endpoints may return 401/403.');
}

// Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  name: string;
  email: string;
  password: string;
  phoneNumber: string;
  yearOfStudy: string;
  course: string;
  college: string;
  admissionNumber: string;
  ministryInterest: string;
  residence: string;
}

export interface AuthResponse {
  user: {
    id: number;
    member_id?: string;
    name: string;
    email: string;
    role: 'user' | 'admin' | 'super_admin';
    status: 'active' | 'inactive' | 'suspended';
    phone_number?: string;
    year_of_study?: string;
    course?: string;
    college?: string;
    admission_number?: string;
    ministry_interest?: string;
    residence?: string;
    avatar?: string;
    registration_completed_at?: string;
    created_at?: string;
    updated_at?: string;
    member_id_info?: string;
    mandatory_paid?: boolean;
    mandatory_amount?: number;
    mandatory_last_payment_date?: string | null;
  };
  token: string;
}

export interface MpesaInitiateRequest {
  phone_number: string;
  amount: number;
  account_number: string;
}

export interface MpesaInitiateResponse {
  MerchantRequestID: string;
  CheckoutRequestID: string;
  ResponseCode: string;
  ResponseDescription: string;
  CustomerMessage: string;
}

export interface MpesaStatusResponse {
  checkoutRequestId: string;
  status: 'pending' | 'completed' | 'failed' | 'cancelled';
  mpesaReceiptNumber?: string;
  phoneNumber: string;
  amount: number;
  errorMessage?: string;
}

export interface WithdrawalRequest {
  account_id: number;
  amount: number;
  phone_number: string;
  withdrawal_reason: string;
  remarks?: string;
  initiated_by_name: string;
  initiator_phone: string;
  otp: string;
}

// Token Management
const getToken = (): string | null => {
  return localStorage.getItem('auth_token');
};

const setToken = (token: string): void => {
  localStorage.setItem('auth_token', token);
};

const removeToken = (): void => {
  localStorage.removeItem('auth_token');
};

// API Request Helper
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const token = getToken();

  const isFormData = typeof FormData !== 'undefined' && options.body instanceof FormData;
  const headers: HeadersInit = {
    ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
    'Accept': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...(API_KEY && { 'X-API-Key': API_KEY }),
    ...options.headers,
  };

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    let data: any = null;
    try {
      data = await response.json();
    } catch {
      // No JSON body; keep data as null
    }

    // Centralized 401/403 handling: clear session and redirect to login
    if (response.status === 401) {
      // Unauthorized - clear auth session and redirect to login
      removeToken();
      if (typeof window !== 'undefined') {
        window.location.hash = '#/login';
      }
      return {
        success: false,
        error: data?.message || data?.error || `HTTP ${response.status}`,
      };
    }

    if (!response.ok) {
      // Handle Laravel validation errors (422)
      let errorMessage = data?.message || data?.error || `HTTP ${response.status}`;
      
      // Laravel validation errors come in data.errors object
      if (data?.errors && typeof data.errors === 'object') {
        const firstErrorKey = Object.keys(data.errors)[0];
        if (firstErrorKey && Array.isArray(data.errors[firstErrorKey])) {
          errorMessage = data.errors[firstErrorKey][0];
        }
      }
      
      return {
        success: false,
        error: errorMessage,
      };
    }

    return {
      success: true,
      data: (data && (data.data ?? data)) as T,
      message: data?.message,
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Network error occurred',
    };
  }
}

// Authentication API
export const authApi = {
  login: async (credentials: LoginCredentials): Promise<ApiResponse<AuthResponse>> => {
    const response = await apiRequest<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });

    if (response.success && response.data?.token) {
      setToken(response.data.token);
    }

    return response;
  },

  register: async (credentials: RegisterCredentials): Promise<ApiResponse<AuthResponse>> => {
    const response = await apiRequest<AuthResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });

    if (response.success && response.data?.token) {
      setToken(response.data.token);
    }

    return response;
  },

  logout: (): void => {
    removeToken();
  },

  getCurrentUser: async (): Promise<ApiResponse<AuthResponse['user']>> => {
    return apiRequest<AuthResponse['user']>('/auth/me');
  },

  checkMandatoryContribution: async (): Promise<ApiResponse<{
    required: boolean;
    paid: boolean;
    amount: number;
    lastPaymentDate?: string;
  }>> => {
    return apiRequest('/auth/mandatory-contribution');
  },
};

// Projects API
export const projectsApi = {
  getAll: async (): Promise<ApiResponse<any[]>> => {
    return apiRequest('/v1/projects');
  },

  getById: async (id: number): Promise<ApiResponse<any>> => {
    return apiRequest(`/v1/projects/${id}`);
  },

  create: async (project: any): Promise<ApiResponse<any>> => {
    return apiRequest('/v1/projects', {
      method: 'POST',
      body: JSON.stringify(project),
    });
  },

  update: async (id: number, project: any): Promise<ApiResponse<any>> => {
    return apiRequest(`/v1/projects/${id}`, {
      method: 'PUT',
      body: JSON.stringify(project),
    });
  },

  delete: async (id: number): Promise<ApiResponse<void>> => {
    return apiRequest(`/v1/projects/${id}`, {
      method: 'DELETE',
    });
  },
};

// Donations API
export const donationsApi = {
  getByProject: async (projectId: number): Promise<ApiResponse<any[]>> => {
    return apiRequest(`/v1/projects/${projectId}/donations`);
  },

  getByUser: async (): Promise<ApiResponse<any[]>> => {
    return apiRequest('/v1/donations/my');
  },
};

// Helper function to format phone number to 254XXXXXXXXX format
const formatPhoneNumber = (phone: string): string => {
  let formatted = phone.replace(/\s+/g, '').replace(/-/g, '');
  if (formatted.startsWith('0')) {
    formatted = '254' + formatted.substring(1);
  } else if (formatted.startsWith('+254')) {
    formatted = formatted.substring(1);
  } else if (!formatted.startsWith('254')) {
    formatted = '254' + formatted;
  }
  return formatted;
};

// MPesa API
export const mpesaApi = {
  initiateSTKPush: async (
    request: MpesaInitiateRequest
  ): Promise<ApiResponse<MpesaInitiateResponse>> => {
    // Format phone number before sending
    const formattedRequest = {
      ...request,
      phone_number: formatPhoneNumber(request.phone_number),
    };
    return apiRequest<MpesaInitiateResponse>('/v1/payments/mpesa', {
      method: 'POST',
      body: JSON.stringify(formattedRequest),
    });
  },

  // Alias for initiateSTKPush - used by DashboardPage recharge
  initiate: async (data: { 
    phoneNumber: string; 
    amount: number; 
    type?: string;
    accountNumber?: string;
  }): Promise<ApiResponse<MpesaInitiateResponse>> => {
    return apiRequest<MpesaInitiateResponse>('/v1/payments/mpesa', {
      method: 'POST',
      body: JSON.stringify({
        phone_number: formatPhoneNumber(data.phoneNumber),
        amount: data.amount,
        account_number: data.accountNumber || 'RECHARGE',
        type: data.type || 'account_recharge',
      }),
    });
  },

  checkStatus: async (
    checkoutRequestId: string
  ): Promise<ApiResponse<MpesaStatusResponse>> => {
    return apiRequest<MpesaStatusResponse>(
      `/v1/payments/mpesa/status/${checkoutRequestId}`
    );
  },

  getBalance: async (refresh?: boolean): Promise<ApiResponse<{ 
    balance: number; 
    all_balances?: Array<{ account_type: string; currency: string; amount: number }>;
    last_updated?: string;
    source?: string;
  }>> => {
    const url = refresh ? '/v1/admin/dashboard/paybill-balance?refresh=true' : '/v1/admin/dashboard/paybill-balance';
    return apiRequest(url);
  },

  queryBalance: async (): Promise<ApiResponse<any>> => {
    return apiRequest('/mpesa/balance/query', {
      method: 'POST',
    });
  },

  // Get all M-Pesa transactions
  getAllTransactions: async (params?: {
    page?: number;
    per_page?: number;
    status?: string;
    from_date?: string;
    to_date?: string;
    phone?: string;
    min_amount?: number;
    max_amount?: number;
  }): Promise<ApiResponse<{
    data: any[];
    totals: { count: number; total_amount: number; completed_amount: number };
    pagination: { current_page: number; last_page: number; per_page: number; total: number };
  }>> => {
    const query = params ? '?' + new URLSearchParams(params as any).toString() : '';
    return apiRequest(`/v1/mpesa/all-transactions${query}`);
  },

  // Add manual transaction
  addTransaction: async (data: {
    trans_id: string;
    amount: number;
    phone_number: string;
    payer_name?: string;
    trans_time?: string;
    bill_ref?: string;
  }): Promise<ApiResponse<any>> => {
    return apiRequest('/v1/mpesa/add-transaction', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Bulk import from Org Portal
  syncFromOrgPortal: async (transactions: Array<{
    trans_id: string;
    amount: number;
    phone_number: string;
    payer_name?: string;
    trans_time?: string;
    bill_ref?: string;
    type?: string;
  }>): Promise<ApiResponse<{
    imported: number;
    skipped: number;
    failed: number;
    total_amount: number;
    new_balance: number;
  }>> => {
    return apiRequest('/v1/mpesa/sync-from-org-portal', {
      method: 'POST',
      body: JSON.stringify({ transactions }),
    });
  },
};

// Accounts API (Extended)
export const accountsApi = {
  getAll: async (params?: Record<string, any>): Promise<ApiResponse<any[]>> => {
    const query = params ? '?' + new URLSearchParams(params).toString() : '';
    return apiRequest(`/v1/accounts${query}`);
  },



  createAccount: async (data: any): Promise<ApiResponse<any>> => {
    return apiRequest('/v1/create-account', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  checkAccount: async (data: any): Promise<ApiResponse<any>> => {
    return apiRequest('/v1/accounts/check', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  getMyAccount: async (): Promise<ApiResponse<any>> => {
    return apiRequest('/v1/accounts/my');
  },

  getById: async (id: number): Promise<ApiResponse<any>> => {
    return apiRequest(`/v1/accounts/${id}`);
  },

  create: async (data: any): Promise<ApiResponse<any>> => {
    return apiRequest('/v1/accounts', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  update: async (id: number, data: any): Promise<ApiResponse<any>> => {
    return apiRequest(`/v1/accounts/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  delete: async (id: number): Promise<ApiResponse<void>> => {
    return apiRequest(`/v1/accounts/${id}`, {
      method: 'DELETE',
    });
  },

  search: async (criteria: any): Promise<ApiResponse<any>> => {
    return apiRequest('/v1/accounts/search', {
      method: 'POST',
      body: JSON.stringify(criteria),
    });
  },

  transfer: async (data: any): Promise<ApiResponse<any>> => {
    return apiRequest('/v1/accounts/transfer', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  validateTransfer: async (data: any): Promise<ApiResponse<any>> => {
    return apiRequest('/v1/accounts/validate-transfer', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  getTypes: async (): Promise<ApiResponse<any[]>> => {
    return apiRequest('/v1/account-types');
  },

  getSubtypes: async (typeId?: number): Promise<ApiResponse<any[]>> => {
    const query = typeId ? `?account_type_id=${typeId}` : '';
    return apiRequest(`/v1/account-subtypes${query}`);
  },

  getBalance: async (): Promise<ApiResponse<{ balance: number }>> => {
    return apiRequest('/v1/accounts/balance');
  },

  getTransactions: async (
    accountId?: number | string
  ): Promise<ApiResponse<any[]>> => {
    const endpoint = accountId
      ? `/v1/accounts/${accountId}/transactions`
      : '/v1/transactions';
    return apiRequest(endpoint);
  },
};

// Withdrawals API
export const withdrawalsApi = {
  initiate: async (
    request: WithdrawalRequest
  ): Promise<ApiResponse<any>> => {
    return apiRequest('/v1/withdrawals/initiate', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  },

  getAll: async (): Promise<ApiResponse<any[]>> => {
    return apiRequest('/v1/withdrawals');
  },

  getById: async (id: number): Promise<ApiResponse<any>> => {
    return apiRequest(`/v1/withdrawals/${id}`);
  },

  sendOTP: async (phone_number: string): Promise<ApiResponse<{ message: string }>> => {
    return apiRequest('/v1/withdrawals/send-otp', {
      method: 'POST',
      body: JSON.stringify({ phone_number }),
    });
  },
};

// Tickets API (Extended)
export const ticketsApi = {
  getMyTickets: async (): Promise<ApiResponse<any[]>> => {
    return apiRequest('/v1/tickets/my');
  },

  getById: async (id: number): Promise<ApiResponse<any>> => {
    return apiRequest(`/v1/tickets/${id}`);
  },

  purchase: async (mmid: string, data: any): Promise<ApiResponse<any>> => {
    return apiRequest(`/api/tickets/${mmid}/process`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  checkStatus: async (ticketNumber: string): Promise<ApiResponse<any>> => {
    return apiRequest(`/api/tickets/check-payment-status/${ticketNumber}`);
  },

  getByMember: async (mmid: string): Promise<ApiResponse<any[]>> => {
    return apiRequest(`/api/tickets/completed/${mmid}`);
  },

  getByMMID: async (mmid: string): Promise<ApiResponse<any>> => {
    return apiRequest(`/api/tickets/${mmid}`);
  },

  getAllCompleted: async (): Promise<ApiResponse<any>> => {
    return apiRequest('/v1/tickets/completed/all');
  },

  checkPaymentStatus: async (ticketNumber: string): Promise<ApiResponse<any>> => {
    return apiRequest(`/api/tickets/check-payment-status/${ticketNumber}`);
  },

  processPurchase: async (mmid: string, data: any): Promise<ApiResponse<any>> => {
    return apiRequest(`/api/tickets/${mmid}/process`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  selectWinner: async (): Promise<ApiResponse<any>> => {
    return apiRequest('/api/winner-selection', {
      method: 'POST',
    });
  },
};

// Users API (Admin)
export const usersApi = {
  getAll: async (): Promise<ApiResponse<any[]>> => {
    return apiRequest('/v1/users');
  },

  getById: async (id: number): Promise<ApiResponse<any>> => {
    return apiRequest(`/v1/users/${id}`);
  },

  update: async (id: number, user: any): Promise<ApiResponse<any>> => {
    return apiRequest(`/v1/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(user),
    });
  },

  delete: async (id: number): Promise<ApiResponse<void>> => {
    return apiRequest(`/v1/users/${id}`, {
      method: 'DELETE',
    });
  },

  toggleStatus: async (id: number): Promise<ApiResponse<any>> => {
    return apiRequest(`/v1/users/${id}/toggle-status`, {
      method: 'PUT',
    });
  },

  toggleRole: async (id: number): Promise<ApiResponse<any>> => {
    return apiRequest(`/v1/users/${id}/toggle-role`, {
      method: 'PUT',
    });
  },

  resetPassword: async (id: number): Promise<ApiResponse<{ user_name: string; user_email: string; new_password: string }>> => {
    return apiRequest(`/v1/users/${id}/reset-password`, {
      method: 'POST',
    });
  },

  updatePermissions: async (id: number, permissions: string[]): Promise<ApiResponse<any>> => {
    return apiRequest(`/v1/users/${id}/permissions`, {
      method: 'PUT',
      body: JSON.stringify({ permissions }),
    });
  },

  createAdmin: async (data: { name: string; email: string; phone_number?: string; permissions?: string[] }): Promise<ApiResponse<{ user: any; credentials: { email: string; password: string } }>> => {
    return apiRequest('/v1/users/create-admin', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
};

// News API
export const newsApi = {
  getAll: async (): Promise<ApiResponse<any[]>> => {
    return apiRequest('/v1/news');
  },

  getById: async (id: number): Promise<ApiResponse<any>> => {
    return apiRequest(`/v1/news/${id}`);
  },

  create: async (article: any): Promise<ApiResponse<any>> => {
    return apiRequest('/v1/news', {
      method: 'POST',
      body: JSON.stringify(article),
    });
  },

  update: async (id: number, article: any): Promise<ApiResponse<any>> => {
    return apiRequest(`/v1/news/${id}`, {
      method: 'PUT',
      body: JSON.stringify(article),
    });
  },

  delete: async (id: number): Promise<ApiResponse<void>> => {
    return apiRequest(`/v1/news/${id}`, {
      method: 'DELETE',
    });
  },
};

// Transactions API (Admin)
export const transactionsApi = {
  getAll: async (params?: Record<string, string>): Promise<ApiResponse<any[]>> => {
    const query = params
      ? '?' + new URLSearchParams(params).toString()
      : '';
    return apiRequest(`/v1/transactions${query}`);
  },

  getById: async (id: string): Promise<ApiResponse<any>> => {
    return apiRequest(`/v1/transactions/${id}`);
  },

  getByAccount: async (reference: string): Promise<ApiResponse<any[]>> => {
    return apiRequest(`/v1/accounts/${reference}/transactions`);
  },
};

// Reports API
export const reportsApi = {
  getFinance: async (params?: Record<string, string>): Promise<ApiResponse<any>> => {
    const query = params ? '?' + new URLSearchParams(params).toString() : '';
    return apiRequest(`/v1/reports/finance${query}`);
  },

  downloadPDF: async (params?: Record<string, string>): Promise<ApiResponse<any>> => {
    const query = params ? '?' + new URLSearchParams(params).toString() : '';
    return apiRequest(`/v1/reports/finance/pdf${query}`);
  },

  emailReport: async (data: any): Promise<ApiResponse<any>> => {
    return apiRequest('/v1/reports/finance/email', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
};

// Members API
export const membersApi = {
  getAll: async (): Promise<ApiResponse<any[]>> => {
    return apiRequest('/v1/members');
  },

  getByMMID: async (mmid: string): Promise<ApiResponse<any>> => {
    return apiRequest(`/v1/members/mmid/${mmid}`);
  },

  search: async (query: string): Promise<ApiResponse<any[]>> => {
    return apiRequest('/v1/members/search', {
      method: 'POST',
      body: JSON.stringify({ query }),
    });
  },

  create: async (data: any): Promise<ApiResponse<any>> => {
    return apiRequest('/v1/members', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  update: async (id: string, data: any): Promise<ApiResponse<any>> => {
    return apiRequest(`/v1/members/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  getStats: async (id: string): Promise<ApiResponse<any>> => {
    return apiRequest(`/v1/members/${id}/stats`);
  },
};

// Airtime API
export const airtimeApi = {
  purchase: async (data: { phone_number: string; amount: number }): Promise<ApiResponse<any>> => {
    return apiRequest('/v1/airtime/purchase', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  getBalance: async (): Promise<ApiResponse<{ balance: number }>> => {
    return apiRequest('/v1/airtime/balance');
  },
};

// M-Pesa Balance API
export const mpesaBalanceApi = {
  query: async (): Promise<ApiResponse<any>> => {
    return apiRequest('/api/mpesa/balance/query', {
      method: 'POST',
    });
  },
};

// Uploads API
export const uploadsApi = {
  uploadImage: async (formData: FormData): Promise<ApiResponse<{ url: string; path: string }>> => {
    const token = localStorage.getItem('auth_token');
    const headers: HeadersInit = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    if (API_KEY) {
      headers['X-API-Key'] = API_KEY;
    }
    
    try {
      const response = await fetch(`${API_BASE_URL}/v1/uploads`, {
        method: 'POST',
        headers,
        body: formData,
      });
      const data = await response.json();
      return { success: response.ok, data: data.data || data, error: data.error || data.message };
    } catch (error) {
      return { success: false, error: 'Upload failed' };
    }
  },
};
// Announcements API
const announcementsApi = {
  getAll: async (params?: Record<string, string>) => apiRequest('/v1/announcements' + (params ? '?' + new URLSearchParams(params).toString() : '')),
  getById: async (id: string) => apiRequest(`/v1/announcements/${id}`),
  create: async (data: any) => apiRequest('/v1/announcements', { method: 'POST', body: JSON.stringify(data) }),
  update: async (id: string, data: any) => apiRequest(`/v1/announcements/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: async (id: string) => apiRequest(`/v1/announcements/${id}`, { method: 'DELETE' }),
  toggleActive: async (id: string) => apiRequest(`/v1/announcements/${id}/toggle`, { method: 'PUT' }),
};

// Onboarding (mandatory contribution)
const onboardingApi = {
  initiate: async (phone_number: string): Promise<ApiResponse<any>> =>
    apiRequest('/v1/onboarding/initiate', {
      method: 'POST',
      body: JSON.stringify({ phone_number }),
    }),
  status: async (): Promise<ApiResponse<any>> => apiRequest('/v1/onboarding/status'),
};

// Orders API
const ordersApi = {
  getAll: async (params?: Record<string, string>) => apiRequest('/v1/orders' + (params ? '?' + new URLSearchParams(params).toString() : '')),
  getMy: async () => apiRequest('/v1/orders/my'),
  getById: async (id: string) => apiRequest(`/v1/orders/${id}`),
  create: async (data: any) => apiRequest('/v1/orders', { method: 'POST', body: JSON.stringify(data) }),
  updateStatus: async (id: string, status: string, trackingNumber?: string) =>
    apiRequest(`/v1/orders/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status, tracking_number: trackingNumber })
    }),
  updatePayment: async (id: string, paymentStatus: string) =>
    apiRequest(`/v1/orders/${id}/payment`, {
      method: 'PUT',
      body: JSON.stringify({ payment_status: paymentStatus })
    }),
};

// Merchandise API
const merchandiseApi = {
  getAll: async (params?: Record<string, string>) => apiRequest('/v1/merchandise' + (params ? '?' + new URLSearchParams(params).toString() : '')),
  getById: async (id: string) => apiRequest(`/v1/merchandise/${id}`),
  create: async (data: any) => apiRequest('/v1/merchandise', { method: 'POST', body: JSON.stringify(data) }),
  update: async (id: string, data: any) => apiRequest(`/v1/merchandise/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: async (id: string) => apiRequest(`/v1/merchandise/${id}`, { method: 'DELETE' }),
  updateStock: async (id: string, stock: number) =>
    apiRequest(`/v1/merchandise/${id}/stock`, {
      method: 'PUT',
      body: JSON.stringify({ stock })
    }),
};

// Enhanced Users API
const enhancedUsersApi = {
  ...usersApi,
  getStats: async (id: string) => apiRequest(`/v1/users/${id}/stats`),
  updatePassword: async (id: string, currentPassword: string, newPassword: string, newPasswordConfirmation: string) =>
    apiRequest(`/v1/users/${id}/password`, {
      method: 'PUT',
      body: JSON.stringify({
        current_password: currentPassword,
        new_password: newPassword,
        new_password_confirmation: newPasswordConfirmation
      })
    }),
  toggleStatus: async (id: string) => apiRequest(`/v1/users/${id}/toggle-status`, { method: 'PUT' }),
};

// Settings API (for public settings)
const settingsApi = {
  getPublic: async (): Promise<ApiResponse<{
    chair_name: string;
    chair_title: string;
    chair_image: string | null;
    organization_name: string;
    organization_tagline: string;
    hero_images: Array<{ url: string; alt: string }>;
    visible_modules: Record<string, boolean>;
  }>> => apiRequest('/v1/settings/public'),
};

// Export default API object
export default {
  auth: authApi,
  projects: projectsApi,
  donations: donationsApi,
  mpesa: mpesaApi,
  accounts: accountsApi,
  withdrawals: withdrawalsApi,
  tickets: ticketsApi,
  users: enhancedUsersApi,
  news: newsApi,
  transactions: transactionsApi,
  reports: reportsApi,
  members: membersApi,
  airtime: airtimeApi,
  mpesaBalance: mpesaBalanceApi,
  uploads: uploadsApi,
  announcements: announcementsApi,
  orders: ordersApi,
  merchandise: merchandiseApi,
  onboarding: onboardingApi,
  settings: settingsApi,
  getToken,
  setToken,
  removeToken,
  // Generic HTTP methods for flexible API calls
  get: async <T = any>(endpoint: string): Promise<{ data: ApiResponse<T> }> => {
    const response = await apiRequest<T>(endpoint);
    return { data: response };
  },
  post: async <T = any>(endpoint: string, body?: any): Promise<{ data: ApiResponse<T> }> => {
    const response = await apiRequest<T>(endpoint, {
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    });
    return { data: response };
  },
  put: async <T = any>(endpoint: string, body?: any): Promise<{ data: ApiResponse<T> }> => {
    const response = await apiRequest<T>(endpoint, {
      method: 'PUT',
      body: body ? JSON.stringify(body) : undefined,
    });
    return { data: response };
  },
  delete: async <T = any>(endpoint: string): Promise<{ data: ApiResponse<T> }> => {
    const response = await apiRequest<T>(endpoint, { method: 'DELETE' });
    return { data: response };
  },
};




