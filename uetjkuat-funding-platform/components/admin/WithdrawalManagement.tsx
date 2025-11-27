import React, { useState, useEffect } from 'react';
import { IconClock, IconCheckCircle, IconAlertCircle, IconPhone, IconWallet } from '../icons';
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
        const data = Array.isArray(response.data) ? response.data : response.data.data || [];
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
      initiated: 'bg-blue-100 text-blue-700',
      pending: 'bg-yellow-100 text-yellow-700',
      completed: 'bg-green-100 text-green-700',
      failed: 'bg-red-100 text-red-700',
      timeout: 'bg-gray-100 text-gray-700',
    };
    return badges[status as keyof typeof badges] || 'bg-gray-100 text-gray-700';
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <IconCheckCircle className="w-5 h-5 text-green-600" />;
      case 'pending':
      case 'initiated':
        return <IconClock className="w-5 h-5 text-yellow-600" />;
      case 'failed':
      case 'timeout':
        return <IconAlertCircle className="w-5 h-5 text-red-600" />;
      default:
        return <IconClock className="w-5 h-5 text-gray-600" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
            <IconWallet className="w-8 h-8 text-indigo-600" />
            Withdrawal Management
          </h2>
          <p className="text-gray-600 mt-1">Manage and track all withdrawal requests</p>
        </div>
        <button
          onClick={() => setShowWithdrawalModal(true)}
          className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-3 rounded-xl font-bold hover:from-indigo-700 hover:to-purple-700 shadow-lg transform hover:scale-105 transition-all"
        >
          + New Withdrawal
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="bg-white rounded-2xl shadow-lg p-2">
        <div className="flex flex-wrap gap-2">
          {['all', 'pending', 'completed', 'failed'].map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-6 py-2 rounded-xl font-semibold transition-all ${
                filter === status
                  ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Withdrawals List */}
      {loading ? (
        <div className="bg-white rounded-2xl shadow-xl p-12 text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading withdrawals...</p>
        </div>
      ) : withdrawals.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-xl p-12 text-center">
          <IconWallet className="w-20 h-20 text-gray-300 mx-auto mb-4" />
          <p className="text-xl text-gray-600 font-semibold">No withdrawals found</p>
          <p className="text-gray-500 mt-2">Try changing the filter or create a new withdrawal</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {withdrawals.map((withdrawal) => (
            <div
              key={withdrawal.id}
              className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all border-2 border-transparent hover:border-indigo-200"
            >
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-indigo-100 rounded-xl">
                    {getStatusIcon(withdrawal.status)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-bold text-gray-800">
                        KES {withdrawal.amount.toLocaleString()}
                      </h3>
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${getStatusBadge(withdrawal.status)}`}>
                        {withdrawal.status.toUpperCase()}
                      </span>
                    </div>
                    <div className="space-y-1 text-sm text-gray-600">
                      <p className="flex items-center gap-2">
                        <IconPhone className="w-4 h-4" />
                        <span className="font-semibold">To:</span> {withdrawal.phone_number}
                      </p>
                      <p>
                        <span className="font-semibold">Reason:</span> {withdrawal.withdrawal_reason}
                      </p>
                      {withdrawal.account && (
                        <p>
                          <span className="font-semibold">Account:</span> {withdrawal.account.name} ({withdrawal.account.reference})
                        </p>
                      )}
                      <p>
                        <span className="font-semibold">Initiated by:</span> {withdrawal.initiated_by_name}
                      </p>
                      {withdrawal.remarks && (
                        <p className="text-gray-500 italic">{withdrawal.remarks}</p>
                      )}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-500 mb-2">
                    {new Date(withdrawal.created_at).toLocaleString()}
                  </p>
                  {withdrawal.mpesa_transaction_id && (
                    <p className="text-xs text-gray-500 font-mono">
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

    try {
      setLoading(true);
      setError('');
      const response = await api.withdrawals.sendOTP();

      if (response.success) {
        setStep('otp');
      } else {
        setError(response.error || 'Failed to send OTP');
      }
    } catch (err: any) {
      setError('Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      setError('');
      
      const response = await api.withdrawals.initiate({
        account_id: parseInt(formData.account_id),
        amount: parseFloat(formData.amount),
        phone_number: formData.phone_number,
        withdrawal_reason: formData.withdrawal_reason,
        remarks: formData.remarks,
      });

      if (response.success) {
        onSuccess();
      } else {
        setError(response.error || 'Withdrawal failed');
      }
    } catch (err: any) {
      setError('Withdrawal failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-8">
        <h2 className="text-3xl font-bold text-gray-800 mb-6">
          {step === 'form' ? 'New Withdrawal Request' : 'Enter OTP'}
        </h2>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
            <p className="text-red-700 font-semibold">{error}</p>
          </div>
        )}

        {step === 'form' ? (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Account</label>
              <select
                value={formData.account_id}
                onChange={(e) => setFormData({ ...formData, account_id: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
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
                <label className="block text-sm font-semibold text-gray-700 mb-2">Amount (KES)</label>
                <input
                  type="number"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="0.00"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Recipient Phone</label>
                <input
                  type="tel"
                  value={formData.phone_number}
                  onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="254712345678"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Withdrawal Reason</label>
              <select
                value={formData.withdrawal_reason}
                onChange={(e) => setFormData({ ...formData, withdrawal_reason: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                <option value="BusinessPayment">Business Payment</option>
                <option value="SalaryPayment">Salary Payment</option>
                <option value="PromotionPayment">Promotion Payment</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Initiated By</label>
                <input
                  type="text"
                  value={formData.initiated_by_name}
                  onChange={(e) => setFormData({ ...formData, initiated_by_name: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="Your Name"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Initiator Phone</label>
                <input
                  type="tel"
                  value={formData.initiator_phone}
                  onChange={(e) => setFormData({ ...formData, initiator_phone: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="254712345678"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Remarks (Optional)</label>
              <textarea
                value={formData.remarks}
                onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                rows={3}
                placeholder="Additional notes..."
              />
            </div>

            <div className="flex gap-4 pt-4">
              <button
                onClick={onClose}
                className="flex-1 px-6 py-3 border-2 border-gray-300 rounded-xl font-bold text-gray-700 hover:bg-gray-50 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleSendOTP}
                disabled={loading}
                className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-3 rounded-xl font-bold hover:from-indigo-700 hover:to-purple-700 shadow-lg transform hover:scale-105 transition-all disabled:opacity-50"
              >
                {loading ? 'Sending OTP...' : 'Send OTP'}
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 text-center">
              <p className="text-blue-800 font-semibold mb-2">OTP sent to {formData.initiator_phone}</p>
              <p className="text-blue-600 text-sm">Check your WhatsApp for the verification code</p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Enter 6-Digit OTP</label>
              <input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                className="w-full px-4 py-4 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-center text-2xl font-bold tracking-widest"
                placeholder="000000"
                maxLength={6}
              />
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => setStep('form')}
                className="flex-1 px-6 py-3 border-2 border-gray-300 rounded-xl font-bold text-gray-700 hover:bg-gray-50 transition-all"
              >
                Back
              </button>
              <button
                onClick={handleSubmit}
                disabled={loading || otp.length !== 6}
                className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 text-white px-6 py-3 rounded-xl font-bold hover:from-green-700 hover:to-emerald-700 shadow-lg transform hover:scale-105 transition-all disabled:opacity-50"
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
