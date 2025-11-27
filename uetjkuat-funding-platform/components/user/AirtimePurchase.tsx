import React, { useState } from 'react';
import { IconPhone, IconWallet, IconCheckCircle } from '../icons';
import api from '../../services/api';

const AirtimePurchase: React.FC = () => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [amount, setAmount] = useState('');
  const [balance, setBalance] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const quickAmounts = [50, 100, 200, 500, 1000];

  const fetchBalance = async () => {
    try {
      const response = await api.airtime.getBalance();
      if (response.success && response.data) {
        setBalance(response.data.balance);
      }
    } catch (error) {
      console.error('Error fetching balance:', error);
    }
  };

  const handlePurchase = async () => {
    if (!phoneNumber || !amount) {
      setError('Please fill in all fields');
      return;
    }

    try {
      setLoading(true);
      setError('');
      setSuccess(false);

      const response = await api.airtime.purchase({
        phone_number: phoneNumber,
        amount: parseFloat(amount),
      });

      if (response.success) {
        setSuccess(true);
        setPhoneNumber('');
        setAmount('');
        setTimeout(() => setSuccess(false), 5000);
      } else {
        setError(response.error || 'Purchase failed');
      }
    } catch (err) {
      setError('Purchase failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const queryMpesaBalance = async () => {
    try {
      setLoading(true);
      const response = await api.mpesaBalance.query();
      if (response.success) {
        alert('Balance query initiated. Check your phone for details.');
      }
    } catch (error) {
      console.error('Error querying balance:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
          <IconPhone className="w-8 h-8 text-green-600" />
          Airtime Purchase
        </h2>
        <p className="text-gray-600 mt-1">Buy airtime instantly</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Purchase Form */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h3 className="text-2xl font-bold text-gray-800 mb-6">Buy Airtime</h3>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
              <p className="text-red-700 font-semibold">{error}</p>
            </div>
          )}

          {success && (
            <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6 flex items-center gap-3">
              <IconCheckCircle className="w-6 h-6 text-green-600" />
              <p className="text-green-700 font-semibold">Airtime purchased successfully!</p>
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Phone Number
              </label>
              <input
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="254XXXXXXXXX"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent text-lg"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Amount (KES)
              </label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent text-lg"
              />
            </div>

            <div>
              <p className="text-sm font-semibold text-gray-700 mb-2">Quick Amounts</p>
              <div className="grid grid-cols-5 gap-2">
                {quickAmounts.map((amt) => (
                  <button
                    key={amt}
                    onClick={() => setAmount(amt.toString())}
                    className="bg-green-100 text-green-700 py-2 rounded-lg font-bold hover:bg-green-200 transition-colors"
                  >
                    {amt}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={handlePurchase}
              disabled={loading || !phoneNumber || !amount}
              className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white px-6 py-4 rounded-xl font-bold hover:from-green-700 hover:to-emerald-700 shadow-lg transform hover:scale-105 transition-all disabled:opacity-50 text-lg"
            >
              {loading ? 'Processing...' : '📱 Buy Airtime'}
            </button>
          </div>
        </div>

        {/* Balance & Info */}
        <div className="space-y-6">
          {/* M-Pesa Balance */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl shadow-xl p-8 border-2 border-blue-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-2xl font-bold text-gray-800">M-Pesa Balance</h3>
              <IconWallet className="w-8 h-8 text-blue-600" />
            </div>
            <button
              onClick={queryMpesaBalance}
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-xl font-bold hover:from-blue-700 hover:to-indigo-700 shadow-lg transform hover:scale-105 transition-all disabled:opacity-50"
            >
              {loading ? 'Querying...' : 'Check Balance'}
            </button>
            <p className="text-sm text-gray-600 mt-3">
              You'll receive an SMS with your current M-Pesa balance
            </p>
          </div>

          {/* Info Card */}
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <h3 className="text-xl font-bold text-gray-800 mb-4">How it Works</h3>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">
                  1
                </div>
                <p className="text-gray-700">Enter the phone number to receive airtime</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">
                  2
                </div>
                <p className="text-gray-700">Select or enter the amount</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">
                  3
                </div>
                <p className="text-gray-700">Click Buy Airtime and confirm</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">
                  4
                </div>
                <p className="text-gray-700">Airtime is sent instantly!</p>
              </div>
            </div>
          </div>

          {/* Recent Purchases */}
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Recent Purchases</h3>
            <p className="text-gray-500 text-center py-8">No recent purchases</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AirtimePurchase;
