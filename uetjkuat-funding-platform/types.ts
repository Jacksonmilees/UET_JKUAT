
export interface ProjectUpdate {
  date: string;
  description: string;
}

export interface Contributor {
    name: string;
    avatar: string;
}

export interface Project {
  id: number;
  title: string;
  description: string;
  longDescription: string;
  category: string;
  fundingGoal: number;
  currentAmount: number;
  featuredImage: string;
  endDate: string;
  organizer: string;
  impactStatement: string;
  updates: ProjectUpdate[];
  contributors: Contributor[];
}

export interface User {
  id: number;
  name: string;
  email: string;
  avatar: string;
  password?: string;
  role: 'user' | 'admin';
  status: 'active' | 'inactive';
  // New detailed fields for students
  phoneNumber?: string;
  yearOfStudy?: string;
  course?: string;
  college?: string;
  admissionNumber?: string;
  ministryInterest?: string;
  residence?: string;
}

export type RegisterCredentials = {
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
};


export interface Transaction {
  id: string;
  projectId?: number;
  projectTitle?: string;
  amount: number;
  date: string;
  type?: 'credit' | 'debit' | 'donation' | 'withdrawal';
  status?: 'completed' | 'pending' | 'failed' | 'cancelled';
  reference?: string;
  phoneNumber?: string;
  userId?: number;
  description?: string;
}

export interface MpesaSession {
  id: string;
  amount: number;
  phoneNumber: string;
  projectId?: number;
  projectTitle?: string;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled' | 'successful';
  initiatedAt: string;
  completedAt?: string;
  checkoutRequestId: string;
  merchantRequestId?: string;
  mpesaReceiptNumber?: string;
  errorMessage?: string;
}

export interface Account {
  id: number;
  accountNumber: string;
  type: string;
  balance: number;
  status: 'active' | 'inactive' | 'suspended';
  reference?: string;
  label?: string;
  ownerName?: string;
  ownerPhone?: string;
}

export interface Withdrawal {
  id: string;
  accountId: number;
  amount: number;
  phoneNumber: string;
  reason: string;
  status: 'pending' | 'approved' | 'sent' | 'failed' | 'cancelled';
  createdAt: string;
  completedAt?: string;
  mpesaTransactionId?: string;
  requestedBy?: string;
}

export interface Ticket {
  id: string;
  ticketNumber: string;
  amount: number;
  status: 'active' | 'expired' | 'used';
  purchaseDate: string;
  expiryDate?: string;
  phoneNumber?: string;
}

export interface MandatoryContributionStatus {
  requiredAmount: number;
  contributedAmount: number;
  isCleared: boolean;
  lastContributionDate?: string;
}

export interface Donation {
  id: string;
  projectId: number;
  projectTitle: string;
  amount: number;
  phoneNumber: string;
  donorName: string;
  userId?: number;
  mpesaReceipt?: string;
  status: 'completed' | 'pending' | 'failed';
  createdAt: string;
}

export type RoutePage = 'home' | 'projectDetail' | 'dashboard' | 'news' | 'login' | 'register' | 'merch' | 'cart' | 'admin';

export interface Route {
    page: RoutePage;
    params?: any;
}

export interface NewsArticle {
    id: number;
    title: string;
    excerpt: string;
    imageUrl: string;
    author: string;
    date: string;
    category: string;
}

export interface MerchandiseItem {
    id: number;
    name: string;
    description: string;
    price: number;
    imageUrl: string;
    category: string;
    stock: number;
}

export interface CartItem extends MerchandiseItem {
    quantity: number;
}

export interface Order {
    id: string;
    userId: number;
    items: CartItem[];
    totalAmount: number;
    orderDate: string;
    status: 'Processing' | 'Shipped' | 'Delivered';
}