import React, { useState, useEffect } from 'react';
import { Clock, CheckCircle2, AlertCircle, Phone, Wallet, X, ArrowRight } from 'lucide-react';
import api from '../../services/api';

interface Withdrawal {
  id: string;
  account_id: number;
  amount: number;
  phone_number: string;
  withdrawal_reason: string;
  remarks?: string;
  initiated_by_name: string;
  status: 'initiated' | 'pending' | 'completed' | 'failed' | 'timeout';
  created_at: string;
  mpesa_conversation_id?: string;
  mpesa_transaction_id?: string;
  account?: {
    id: number;
    reference: string;
    name: string;
    balance: number;
  };
}

const WithdrawalManagement: React.FC = () => {
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');
  const [showWithdrawalModal, setShowWithdrawalModal] = useState(false);

  useEffect(() => {
    fetchWithdrawals();
  }, [filter]);

  const fetchWithdrawals = async () => {
    try {
      setLoading(true);
      const response = await api.withdrawals.getAll();

      if (response.success && response.data) {
        const data = Array.isArray(response.data) ? response.data : (response.data as any).data || [];
        setWithdrawals(filter !== 'all' ? data.filter((w: Withdrawal) => w.status === filter) : data);
      }
    } catch (error) {
      console.error('Error fetching withdrawals:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const badges = {
      initiated: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
      pending: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300',
      completed: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
      failed: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
      timeout: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
    };
    return badges[status as keyof typeof badges] || 'bg-secondary text-secondary-foreground';
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="w-5 h-5 text-green-600" />;
      case 'pending':
      case 'initiated':
        return <Clock className="w-5 h-5 text-yellow-600" />;
      case 'failed':
      case 'timeout':
        return <AlertCircle className="w-5 h-5 text-red-600" />;
      default:
        return <Clock className="w-5 h-5 text-muted-foreground" />;
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Wallet className="w-6 h-6 text-primary" />
            Withdrawal Management
          </h2>
          <p className="text-sm text-muted-foreground mt-1">Manage and track all withdrawal requests</p>
        </div>
        <button
          onClick={() => setShowWithdrawalModal(true)}
          className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg shadow-sm text-primary-foreground bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-all"
        >
          + New Withdrawal
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="bg-card rounded-xl shadow-sm p-1 border border-border inline-flex">
        {['all', 'pending', 'completed', 'failed'].map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${filter === status
              ? 'bg-primary text-primary-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
              }`}
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </button>
        ))}
      </div>

      {/* Withdrawals List */}
      {loading ? (
        <div className="bg-card rounded-xl shadow-sm p-12 text-center border border-border">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading withdrawals...</p>
        </div>
      ) : withdrawals.length === 0 ? (
        <div className="bg-card rounded-xl shadow-sm p-12 text-center border border-border">
          <Wallet className="w-12 h-12 text-muted-foreground/50 mx-auto mb-4" />
          <p className="text-lg text-foreground font-semibold">No withdrawals found</p>
          <p className="text-muted-foreground mt-2">Try changing the filter or create a new withdrawal</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {withdrawals.map((withdrawal) => (
            <div
              key={withdrawal.id}
              className="bg-card rounded-xl shadow-sm p-6 hover:shadow-md transition-all border border-border group"
            >
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-primary/10 rounded-xl">
                    {getStatusIcon(withdrawal.status)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-bold text-foreground">
                        KES {withdrawal.amount.toLocaleString()}
                      </h3>
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${getStatusBadge(withdrawal.status)}`}>
                        {withdrawal.status}
                      </span>
                    </div>
                    <div className="space-y-1 text-sm text-muted-foreground">
                      <p className="flex items-center gap-2">
                        <Phone className="w-3.5 h-3.5" />
                        <span className="font-medium text-foreground">To:</span> {withdrawal.phone_number}
                      </p>
                      <p>
                        <span className="font-medium text-foreground">Reason:</span> {withdrawal.withdrawal_reason}
                      </p>
                      {withdrawal.account && (
                        <p>
                          <span className="font-medium text-foreground">Account:</span> {withdrawal.account.name} ({withdrawal.account.reference})
                        </p>
                      )}
                      <p>
                        <span className="font-medium text-foreground">Initiated by:</span> {withdrawal.initiated_by_name}
                      </p>
                      {withdrawal.remarks && (
                        <p className="text-muted-foreground italic">"{withdrawal.remarks}"</p>
                      )}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs text-muted-foreground mb-2">
                    {new Date(withdrawal.created_at).toLocaleString()}
                  </p>
                  {withdrawal.mpesa_transaction_id && (
                    <p className="text-xs text-muted-foreground font-mono bg-secondary px-2 py-1 rounded inline-block">
                      ID: {withdrawal.mpesa_transaction_id}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Withdrawal Modal */}
      {showWithdrawalModal && (
        <WithdrawalModal
          onClose={() => setShowWithdrawalModal(false)}
          onSuccess={() => {
            setShowWithdrawalModal(false);
            fetchWithdrawals();
          }}
        />
      )}
    </div>
  );
};

// Withdrawal Modal Component
const WithdrawalModal: React.FC<{ onClose: () => void; onSuccess: () => void }> = ({ onClose, onSuccess }) => {
  const [step, setStep] = useState<'form' | 'otp'>('form');
  const [formData, setFormData] = useState({
    account_id: '',
    amount: '',
    phone_number: '',
    withdrawal_reason: 'BusinessPayment',
    remarks: '',
    initiated_by_name: '',
    initiator_phone: '',
  });
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [accounts, setAccounts] = useState<any[]>([]);

  useEffect(() => {
    fetchAccounts();
  }, []);

  const fetchAccounts = async () => {
    try {
      const response = await api.accounts.getMyAccount();
      if (response.success && response.data) {
        setAccounts(Array.isArray(response.data) ? response.data : [response.data]);
      }
    } catch (error) {
      console.error('Error fetching accounts:', error);
    }
  };

  const handleSendOTP = async () => {
    if (!formData.initiator_phone) {
      setError('Please enter initiator phone number');
      return;
    }

    // Validate phone format
    const phoneRegex = /^254[17][0-9]{8}$/;
    if (!phoneRegex.test(formData.initiator_phone)) {
      setError('Phone number must be in format 254XXXXXXXXX');
      return;
    }

    try {
      setLoading(true);
      setError('');
      const response = await api.withdrawals.sendOTP(formData.initiator_phone);

      if (response.success) {
        setStep('otp');
      } else {
        setError(response.error || 'Failed to send OTP');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (otp.length !== 6) {
      setError('Please enter a valid 6-digit OTP');
      return;
    }

    try {
      setLoading(true);
      setError('');

      const response = await api.withdrawals.initiate({
        account_id: parseInt(formData.account_id),
        amount: parseFloat(formData.amount),
        phone_number: formData.phone_number,
        withdrawal_reason: formData.withdrawal_reason,
        remarks: formData.remarks,
        initiated_by_name: formData.initiated_by_name,
        initiator_phone: formData.initiator_phone,
        otp: otp,
      });

      if (response.success) {
        onSuccess();
      } else {
        setError(response.error || 'Withdrawal failed');
      }
    } catch (err: any) {
      setError(err.message || 'Withdrawal failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-card rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-8 border border-border">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-foreground">
            {step === 'form' ? 'New Withdrawal Request' : 'Enter OTP'}
          </h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3 mb-6">
            <p className="text-sm text-destructive font-medium">{error}</p>
          </div>
        )}

        {step === 'form' ? (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Account</label>
              <select
                value={formData.account_id}
                onChange={(e) => setFormData({ ...formData, account_id: e.target.value })}
                className="block w-full rounded-lg border border-input bg-background px-3 py-2 text-foreground shadow-sm focus:border-primary focus:ring-1 focus:ring-primary sm:text-sm"
                required
              >
                <option value="">Select Account</option>
                {accounts.map((account) => (
                  <option key={account.id} value={account.id}>
                    {account.name} ({account.reference}) - KES {account.balance?.toLocaleString()}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Amount (KES)</label>
                <input
                  type="number"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  className="block w-full rounded-lg border border-input bg-background px-3 py-2 text-foreground shadow-sm focus:border-primary focus:ring-1 focus:ring-primary sm:text-sm"
                  placeholder="0.00"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Recipient Phone</label>
                <input
                  type="tel"
                  value={formData.phone_number}
                  onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
                  className="block w-full rounded-lg border border-input bg-background px-3 py-2 text-foreground shadow-sm focus:border-primary focus:ring-1 focus:ring-primary sm:text-sm"
                  placeholder="254712345678"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Withdrawal Reason</label>
              <select
                value={formData.withdrawal_reason}
                onChange={(e) => setFormData({ ...formData, withdrawal_reason: e.target.value })}
                className="block w-full rounded-lg border border-input bg-background px-3 py-2 text-foreground shadow-sm focus:border-primary focus:ring-1 focus:ring-primary sm:text-sm"
              >
                <option value="BusinessPayment">Business Payment</option>
                <option value="SalaryPayment">Salary Payment</option>
                <option value="PromotionPayment">Promotion Payment</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Initiated By</label>
                <input
                  type="text"
                  value={formData.initiated_by_name}
                  onChange={(e) => setFormData({ ...formData, initiated_by_name: e.target.value })}
                  className="block w-full rounded-lg border border-input bg-background px-3 py-2 text-foreground shadow-sm focus:border-primary focus:ring-1 focus:ring-primary sm:text-sm"
                  placeholder="Your Name"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Initiator Phone</label>
                <input
                  type="tel"
                  value={formData.initiator_phone}
                  onChange={(e) => setFormData({ ...formData, initiator_phone: e.target.value })}
                  className="block w-full rounded-lg border border-input bg-background px-3 py-2 text-foreground shadow-sm focus:border-primary focus:ring-1 focus:ring-primary sm:text-sm"
                  placeholder="254712345678"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Remarks (Optional)</label>
              <textarea
                value={formData.remarks}
                onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                className="block w-full rounded-lg border border-input bg-background px-3 py-2 text-foreground shadow-sm focus:border-primary focus:ring-1 focus:ring-primary sm:text-sm"
                rows={3}
                placeholder="Additional notes..."
              />
            </div>

            <div className="flex gap-3 pt-4">
              <button
                onClick={onClose}
                className="flex-1 px-4 py-2 border border-input rounded-lg font-medium text-foreground hover:bg-secondary transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSendOTP}
                disabled={loading}
                className="flex-1 bg-primary text-primary-foreground px-4 py-2 rounded-lg font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 shadow-sm flex items-center justify-center gap-2"
              >
                {loading ? 'Sending...' : <>Send OTP <ArrowRight className="w-4 h-4" /></>}
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-6 text-center">
              <p className="text-blue-800 dark:text-blue-200 font-semibold mb-2">OTP sent to {formData.initiator_phone}</p>
              <p className="text-blue-600 dark:text-blue-300 text-sm">Check your WhatsApp for the verification code</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Enter 6-Digit OTP</label>
              <input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                className="block w-full px-4 py-4 border-2 border-input rounded-xl focus:ring-2 focus:ring-primary focus:border-primary text-center text-2xl font-bold tracking-widest bg-background text-foreground"
                placeholder="000000"
                maxLength={6}
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setStep('form')}
                className="flex-1 px-4 py-2 border border-input rounded-lg font-medium text-foreground hover:bg-secondary transition-colors"
              >
                Back
              </button>
              <button
                onClick={handleSubmit}
                disabled={loading || otp.length !== 6}
                className="flex-1 bg-primary text-primary-foreground px-4 py-2 rounded-lg font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 shadow-sm"
              >
                {loading ? 'Processing...' : 'Complete Withdrawal'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default WithdrawalManagement;
