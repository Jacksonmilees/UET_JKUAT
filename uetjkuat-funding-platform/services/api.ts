
// API Service Layer for UET JKUAT Funding Platform
// Connects React frontend to Laravel backend

// Use production URL as default for deployed environments
// For local development, set VITE_API_BASE_URL=http://localhost:8000/api in .env
// Default to Heroku backend URL - never use localhost in production
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://uetjkuat-54286e10a43b.herokuapp.com/api';
const API_KEY = import.meta.env.VITE_API_KEY || '';

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
    name: string;
    email: string;
    role: 'user' | 'admin' | 'super_admin';
    status: 'active' | 'inactive';
    phone_number?: string;
    avatar?: string;
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
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
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

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: data.message || data.error || `HTTP ${response.status}`,
      };
    }

    return {
      success: true,
      data: data.data || data,
      message: data.message,
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

// MPesa API
export const mpesaApi = {
  initiateSTKPush: async (
    request: MpesaInitiateRequest
  ): Promise<ApiResponse<MpesaInitiateResponse>> => {
    return apiRequest<MpesaInitiateResponse>('/v1/payments/mpesa', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  },

  checkStatus: async (
    checkoutRequestId: string
  ): Promise<ApiResponse<MpesaStatusResponse>> => {
    return apiRequest<MpesaStatusResponse>(
      `/v1/payments/mpesa/status/${checkoutRequestId}`
    );
  },
};

// Accounts API
export const accountsApi = {
  getMyAccount: async (): Promise<ApiResponse<any>> => {
    return apiRequest('/v1/accounts/my');
  },

  getBalance: async (): Promise<ApiResponse<{ balance: number }>> => {
    return apiRequest('/v1/accounts/balance');
  },

  getTransactions: async (
    accountId?: number
  ): Promise<ApiResponse<any[]>> => {
    const endpoint = accountId
      ? `/v1/accounts/${accountId}/transactions`
      : '/v1/transactions/my';
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

  sendOTP: async (): Promise<ApiResponse<{ message: string }>> => {
    return apiRequest('/v1/withdrawals/send-otp', {
      method: 'POST',
    });
  },
};

// Tickets API
export const ticketsApi = {
  getMyTickets: async (): Promise<ApiResponse<any[]>> => {
    return apiRequest('/v1/tickets/my');
  },

  getById: async (id: number): Promise<ApiResponse<any>> => {
    return apiRequest(`/v1/tickets/${id}`);
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
      method: 'POST',
    });
  },

  toggleRole: async (id: number): Promise<ApiResponse<any>> => {
    return apiRequest(`/v1/users/${id}/toggle-role`, {
      method: 'POST',
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

// Export default API object
export default {
  auth: authApi,
  projects: projectsApi,
  donations: donationsApi,
  mpesa: mpesaApi,
  accounts: accountsApi,
  withdrawals: withdrawalsApi,
  tickets: ticketsApi,
  users: usersApi,
  news: newsApi,
  getToken,
  setToken,
  removeToken,
};




