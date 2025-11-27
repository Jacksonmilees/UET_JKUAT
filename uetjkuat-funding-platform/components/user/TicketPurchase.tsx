import React, { useState } from 'react';
import { IconHash, IconCheckCircle, IconClock } from '../icons';
import api from '../../services/api';
import MpesaPaymentStatus from '../MpesaPaymentStatus';

const TicketPurchase: React.FC = () => {
  const [step, setStep] = useState<'form' | 'payment'>('form');
  const [formData, setFormData] = useState({
    mmid: '',
    buyer_name: '',
    buyer_contact: '',
    amount: '',
    phone_number: '',
  });
  const [checkoutRequestId, setCheckoutRequestId] = useState('');
  const [ticketNumber, setTicketNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [memberInfo, setMemberInfo] = useState<any>(null);

  const loadMemberInfo = async () => {
    if (!formData.mmid) return;

    try {
      const response = await api.members.getByMMID(formData.mmid);
      if (response.success && response.data) {
        setMemberInfo(response.data);
        setError('');
      } else {
        setError('Member not found');
        setMemberInfo(null);
      }
    } catch (error) {
      setError('Failed to load member info');
      setMemberInfo(null);
    }
  };

  const handlePurchase = async () => {
    if (!formData.mmid || !formData.buyer_name || !formData.buyer_contact || !formData.amount || !formData.phone_number) {
      setError('Please fill in all fields');
      return;
    }

    try {
      setLoading(true);
      setError('');

      const response = await api.tickets.purchase(formData.mmid, {
        buyer_name: formData.buyer_name,
        buyer_contact: formData.buyer_contact,
        amount: parseFloat(formData.amount),
        phone_number: formData.phone_number,
      });

      if (response.success && response.data) {
        setCheckoutRequestId(response.data.CheckoutRequestID);
        setTicketNumber(response.data.ticket_number);
        setStep('payment');
      } else {
        setError(response.error || 'Failed to initiate purchase');
      }
    } catch (err) {
      setError('Failed to initiate purchase');
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentSuccess = () => {
    // Reset form
    setFormData({
      mmid: '',
      buyer_name: '',
      buyer_contact: '',
      amount: '',
      phone_number: '',
    });
    setStep('form');
    setMemberInfo(null);
  };

  if (step === 'payment' && checkoutRequestId) {
    return (
      <div className="max-w-2xl mx-auto">
        <MpesaPaymentStatus
          checkoutRequestId={checkoutRequestId}
          onSuccess={handlePaymentSuccess}
          onCancel={() => setStep('form')}
        />
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-xl p-4">
          <p className="text-blue-700 font-semibold">Your Ticket Number:</p>
          <p className="text-2xl font-bold text-blue-800 font-mono mt-2">{ticketNumber}</p>
          <p className="text-sm text-gray-600 mt-2">Save this number for your records</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
          <IconHash className="w-8 h-8 text-purple-600" />
          Purchase Ticket
        </h2>
        <p className="text-gray-600 mt-1">Buy fundraising tickets and support the ministry</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Purchase Form */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h3 className="text-2xl font-bold text-gray-800 mb-6">Ticket Details</h3>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
              <p className="text-red-700 font-semibold">{error}</p>
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Member MMID
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={formData.mmid}
                  onChange={(e) => setFormData({ ...formData, mmid: e.target.value })}
                  onBlur={loadMemberInfo}
                  placeholder="Enter MMID"
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
                <button
                  onClick={loadMemberInfo}
                  className="bg-purple-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-purple-700 transition-colors"
                >
                  Verify
                </button>
              </div>
              {memberInfo && (
                <div className="mt-2 bg-green-50 border border-green-200 rounded-lg p-3">
                  <p className="text-green-700 font-semibold flex items-center gap-2">
                    <IconCheckCircle className="w-4 h-4" />
                    {memberInfo.name}
                  </p>
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Your Name
              </label>
              <input
                type="text"
                value={formData.buyer_name}
                onChange={(e) => setFormData({ ...formData, buyer_name: e.target.value })}
                placeholder="Enter your name"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Your Contact
              </label>
              <input
                type="tel"
                value={formData.buyer_contact}
                onChange={(e) => setFormData({ ...formData, buyer_contact: e.target.value })}
                placeholder="254XXXXXXXXX"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Amount (KES)
              </label>
              <input
                type="number"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                placeholder="0.00"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                M-Pesa Phone Number
              </label>
              <input
                type="tel"
                value={formData.phone_number}
                onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
                placeholder="254XXXXXXXXX"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>

            <button
              onClick={handlePurchase}
              disabled={loading || !memberInfo}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-4 rounded-xl font-bold hover:from-purple-700 hover:to-pink-700 shadow-lg transform hover:scale-105 transition-all disabled:opacity-50 text-lg"
            >
              {loading ? 'Processing...' : '🎫 Purchase Ticket'}
            </button>
          </div>
        </div>

        {/* Info & Instructions */}
        <div className="space-y-6">
          {/* How it Works */}
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <h3 className="text-xl font-bold text-gray-800 mb-4">How it Works</h3>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">
                  1
                </div>
                <p className="text-gray-700">Enter the member's MMID and verify</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">
                  2
                </div>
                <p className="text-gray-700">Fill in your details and ticket amount</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">
                  3
                </div>
                <p className="text-gray-700">Complete payment via M-Pesa</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">
                  4
                </div>
                <p className="text-gray-700">Receive your ticket number via SMS</p>
              </div>
            </div>
          </div>

          {/* Benefits */}
          <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl shadow-xl p-8 border-2 border-purple-200">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Why Buy Tickets?</h3>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-gray-700">
                <IconCheckCircle className="w-5 h-5 text-green-600" />
                <span>Support the ministry's fundraising</span>
              </div>
              <div className="flex items-center gap-2 text-gray-700">
                <IconCheckCircle className="w-5 h-5 text-green-600" />
                <span>Chance to win amazing prizes</span>
              </div>
              <div className="flex items-center gap-2 text-gray-700">
                <IconCheckCircle className="w-5 h-5 text-green-600" />
                <span>Help members reach their goals</span>
              </div>
              <div className="flex items-center gap-2 text-gray-700">
                <IconCheckCircle className="w-5 h-5 text-green-600" />
                <span>Instant confirmation via SMS</span>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Event Stats</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-purple-50 rounded-xl p-4 border-2 border-purple-200">
                <p className="text-sm text-purple-700 mb-1">Tickets Sold</p>
                <p className="text-3xl font-extrabold text-purple-600">0</p>
              </div>
              <div className="bg-green-50 rounded-xl p-4 border-2 border-green-200">
                <p className="text-sm text-green-700 mb-1">Total Raised</p>
                <p className="text-2xl font-extrabold text-green-600">KES 0</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TicketPurchase;
