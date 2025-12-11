/**
 * Backend API Types - Matches Laravel Models Exactly
 *
 * These types match the backend database structure and API responses.
 * DO NOT modify without checking the corresponding Laravel model.
 */

// Base Response Structure
export interface ApiResponse<T = any> {
  status: 'success' | 'error';
  message?: string;
  data?: T;
  error?: string;
  errors?: Record<string, string[]>;
  total_count?: number;
}

// Transaction Model (app/Models/Transaction.php)
export interface Transaction {
  id: number;
  account_id: number;
  user_id?: number;
  transaction_id: string;
  amount: string | number; // decimal:2
  type: 'credit' | 'debit';
  payment_method: string;
  status: string;
  reference: string;
  phone_number?: string;
  payer_name?: string;
  metadata?: Record<string, any>;
  processed_at?: string; // datetime
  created_at: string;
  updated_at: string;
  deleted_at?: string; // soft deletes
  // Relationships
  account?: Account;
  user?: {
    id: number;
    name: string;
    member_id?: string;
    email: string;
  };
}

// Withdrawal Model (app/Models/Withdrawal.php)
export interface Withdrawal {
  id: number;
  account_id: number;
  transaction_id?: number;
  amount: string | number; // decimal:2
  phone_number: string; // 254XXXXXXXXX format
  withdrawal_reason: 'BusinessPayment' | 'SalaryPayment' | 'PromotionPayment';
  remarks?: string;
  status: 'initiated' | 'pending' | 'completed' | 'failed' | 'cancelled';
  mpesa_conversation_id?: string;
  mpesa_transaction_id?: string;
  mpesa_result_code?: string;
  mpesa_result_desc?: string;
  completed_at?: string; // datetime
  metadata?: Record<string, any>;
  initiated_by_name: string;
  receiver_name?: string;
  reference?: string;
  initiated_by?: number;
  created_at: string;
  updated_at: string;
  // Relationships
  account?: Account;
  transaction?: Transaction;
}

// Project Model (app/Models/Project.php)
export interface Project {
  id: number;
  name: string;
  title: string;
  description: string;
  long_description: string;
  target_amount: string | number; // decimal:2
  current_amount: string | number; // decimal:2
  account_number?: string;
  account_reference?: string;
  status: 'active' | 'completed' | 'cancelled';
  end_date: string; // datetime
  image_url?: string;
  featured_image?: string;
  user_id?: number;
  category_id?: number;
  slug?: string;
  visibility: 'public' | 'private';
  allow_donations: boolean;
  organizer: string;
  impact_statement?: string;
  duration_days?: number;
  metadata?: Record<string, any>;
  created_at: string;
  updated_at: string;
  // Computed attributes
  progress_percentage?: number;
  // Relationships
  donations?: Donation[];
  category?: Category;
}

// Account Model (referenced in relationships)
export interface Account {
  id: number;
  reference: string;
  name: string;
  type: string;
  balance: string | number; // decimal:2
  status: 'active' | 'inactive' | 'suspended';
  account_type_id: number;
  account_subtype_id?: number;
  metadata?: Record<string, any>;
  created_at: string;
  updated_at: string;
  // Relationships
  accountType?: AccountType;
  accountSubtype?: AccountSubtype;
}

export interface AccountType {
  id: number;
  name: string;
  code: string;
  description?: string;
  created_at: string;
  updated_at: string;
}

export interface AccountSubtype {
  id: number;
  account_type_id: number;
  name: string;
  code: string;
  description?: string;
  created_at: string;
  updated_at: string;
}

// Donation Model
export interface Donation {
  id: number;
  project_id: number;
  user_id?: number;
  amount: string | number; // decimal:2
  payment_method: string;
  status: string;
  reference: string;
  created_at: string;
  updated_at: string;
}

// Category Model
export interface Category {
  id: number;
  name: string;
  slug: string;
  description?: string;
  parent_id?: number;
  created_at: string;
  updated_at: string;
}

// User Model (simplified)
export interface User {
  id: number;
  member_id?: string;
  name: string;
  email: string;
  phone_number?: string;
  role: 'user' | 'admin' | 'super_admin';
  status: 'active' | 'inactive' | 'suspended';
  year_of_study?: string;
  course?: string;
  college?: string;
  admission_number?: string;
  ministry_interest?: string;
  residence?: string;
  avatar?: string;
  registration_completed_at?: string;
  created_at: string;
  updated_at: string;
}

// News/Article Model
export interface NewsArticle {
  id: number;
  title: string;
  slug: string;
  excerpt?: string;
  content: string;
  featured_image?: string;
  author_id?: number;
  status: 'draft' | 'published' | 'archived';
  published_at?: string;
  category_id?: number;
  tags?: string[];
  metadata?: Record<string, any>;
  created_at: string;
  updated_at: string;
  // Relationships
  author?: User;
  category?: Category;
}

// Announcement Model
export interface Announcement {
  id: number;
  title: string;
  content: string;
  type: 'info' | 'warning' | 'success' | 'error';
  priority: 'low' | 'medium' | 'high';
  is_active: boolean;
  start_date?: string;
  end_date?: string;
  target_audience?: string;
  created_by?: number;
  created_at: string;
  updated_at: string;
}

// Merchandise Model
export interface Merchandise {
  id: number;
  name: string;
  description: string;
  price: string | number; // decimal:2
  stock: number;
  category?: string;
  image_url?: string;
  images?: string[];
  status: 'available' | 'out_of_stock' | 'discontinued';
  metadata?: Record<string, any>;
  created_at: string;
  updated_at: string;
}

// Order Model
export interface Order {
  id: number;
  user_id: number;
  order_number: string;
  total_amount: string | number; // decimal:2
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  payment_status: 'pending' | 'paid' | 'failed' | 'refunded';
  payment_method?: string;
  shipping_address?: Record<string, any>;
  tracking_number?: string;
  notes?: string;
  metadata?: Record<string, any>;
  created_at: string;
  updated_at: string;
  // Relationships
  user?: User;
  items?: OrderItem[];
}

export interface OrderItem {
  id: number;
  order_id: number;
  merchandise_id: number;
  quantity: number;
  unit_price: string | number; // decimal:2
  total_price: string | number; // decimal:2
  created_at: string;
  updated_at: string;
  // Relationships
  merchandise?: Merchandise;
}

// Ticket Model
export interface Ticket {
  id: number;
  mmid: string;
  ticket_number: string;
  event_name: string;
  event_date: string;
  price: string | number; // decimal:2
  status: 'pending' | 'paid' | 'used' | 'cancelled';
  payment_reference?: string;
  buyer_name?: string;
  buyer_phone?: string;
  metadata?: Record<string, any>;
  created_at: string;
  updated_at: string;
}

// M-Pesa Transaction Log
export interface MpesaTransactionLog {
  id: number;
  trans_id: string;
  trans_time: string;
  trans_amount: string | number; // decimal:2
  business_short_code: string;
  bill_ref_number?: string;
  invoice_number?: string;
  org_account_balance?: string;
  third_party_trans_id?: string;
  msisdn: string; // phone number
  first_name?: string;
  middle_name?: string;
  last_name?: string;
  status: 'pending' | 'completed' | 'failed';
  processed: boolean;
  transaction_id?: number; // Reference to transactions table
  account_id?: number; // Reference to accounts table
  metadata?: Record<string, any>;
  created_at: string;
  updated_at: string;
}

// Semester Model
export interface Semester {
  id: number;
  name: string;
  code: string;
  start_date: string;
  end_date: string;
  is_active: boolean;
  academic_year: string;
  created_at: string;
  updated_at: string;
}

// Settings Model
export interface Settings {
  id: number;
  key: string;
  value: any;
  type: 'string' | 'number' | 'boolean' | 'json';
  group?: string;
  description?: string;
  created_at: string;
  updated_at: string;
}

// Report Types
export interface FinancialReport {
  period: {
    start_date: string;
    end_date: string;
  };
  summary: {
    total_revenue: number;
    total_expenses: number;
    net_balance: number;
    transaction_count: number;
  };
  accounts: Array<{
    reference: string;
    name: string;
    opening_balance: number;
    closing_balance: number;
    total_credits: number;
    total_debits: number;
  }>;
  transactions: Transaction[];
}

// Request/Response Types for API calls

export interface TransactionFilters {
  account_reference?: string;
  start_date?: string;
  end_date?: string;
  type?: 'credit' | 'debit';
  status?: string;
  sort_by?: 'created_at' | 'amount' | 'status';
  sort_direction?: 'asc' | 'desc';
}

export interface WithdrawalRequest {
  account_id: number;
  amount: number;
  phone_number: string; // Must be 254XXXXXXXXX format
  withdrawal_reason: 'BusinessPayment' | 'SalaryPayment' | 'PromotionPayment';
  remarks?: string;
  initiated_by_name: string;
  otp: string;
  initiator_phone: string; // Must be 254XXXXXXXXX format
}

export interface ProjectCreateRequest {
  name: string;
  title: string;
  description: string;
  long_description: string;
  target_amount: number;
  current_amount?: number;
  end_date: string;
  featured_image?: string;
  category_id?: number;
  organizer: string;
  impact_statement: string;
  duration_days?: number;
  visibility?: 'public' | 'private';
  allow_donations?: boolean;
}

export interface AccountTransferRequest {
  source_account_id: number;
  destination_account_id: number;
  amount: number;
  description?: string;
}
