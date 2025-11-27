import React, { useState, useEffect } from 'react';
import { IconShoppingCart, IconCheckCircle, IconClock, IconTruck, IconPackage } from '../icons';

interface Purchase {
  id: number;
  orderNumber: string;
  items: {
    name: string;
    quantity: number;
    price: number;
  }[];
  totalAmount: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  paymentStatus: 'paid' | 'pending' | 'failed';
  orderDate: string;
  deliveryAddress?: string;
  trackingNumber?: string;
}

const MyPurchases: React.FC = () => {
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'delivered'>('all');

  useEffect(() => {
    fetchPurchases();
  }, []);

  const fetchPurchases = async () => {
    try {
      setLoading(true);
      // TODO: Replace with actual API call when backend endpoint is ready
      // const response = await api.purchases.getMyPurchases();
      // For now, using mock data
      setPurchases([]);
    } catch (error) {
      console.error('Error fetching purchases:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'delivered':
        return <IconCheckCircle className="w-5 h-5 text-green-600" />;
      case 'shipped':
        return <IconTruck className="w-5 h-5 text-blue-600" />;
      case 'processing':
        return <IconClock className="w-5 h-5 text-yellow-600" />;
      default:
        return <IconPackage className="w-5 h-5 text-gray-600" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const badges = {
      pending: 'bg-yellow-100 text-yellow-700',
      processing: 'bg-blue-100 text-blue-700',
      shipped: 'bg-indigo-100 text-indigo-700',
      delivered: 'bg-green-100 text-green-700',
      cancelled: 'bg-red-100 text-red-700',
    };
    return badges[status as keyof typeof badges] || 'bg-gray-100 text-gray-700';
  };

  const filteredPurchases = purchases.filter(p => {
    if (filter === 'all') return true;
    if (filter === 'pending') return ['pending', 'processing', 'shipped'].includes(p.status);
    return p.status === filter;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
          <IconShoppingCart className="w-8 h-8 text-purple-600" />
          My Purchases
        </h2>
        <p className="text-gray-600 mt-1">Track your merchandise orders and deliveries</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl shadow-xl p-6 border-2 border-purple-200">
          <p className="text-purple-700 font-semibold mb-2">Total Orders</p>
          <p className="text-4xl font-extrabold text-purple-800">{purchases.length}</p>
        </div>

        <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-2xl shadow-xl p-6 border-2 border-yellow-200">
          <p className="text-yellow-700 font-semibold mb-2">Pending</p>
          <p className="text-4xl font-extrabold text-yellow-800">
            {purchases.filter(p => ['pending', 'processing'].includes(p.status)).length}
          </p>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl shadow-xl p-6 border-2 border-blue-200">
          <p className="text-blue-700 font-semibold mb-2">Shipped</p>
          <p className="text-4xl font-extrabold text-blue-800">
            {purchases.filter(p => p.status === 'shipped').length}
          </p>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl shadow-xl p-6 border-2 border-green-200">
          <p className="text-green-700 font-semibold mb-2">Delivered</p>
          <p className="text-4xl font-extrabold text-green-800">
            {purchases.filter(p => p.status === 'delivered').length}
          </p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="bg-white rounded-2xl shadow-lg p-2 flex gap-2">
        {(['all', 'pending', 'delivered'] as const).map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`flex-1 px-6 py-3 rounded-xl font-bold transition-all ${
              filter === status
                ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </button>
        ))}
      </div>

      {/* Purchases List */}
      {loading ? (
        <div className="bg-white rounded-2xl shadow-xl p-12 text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading purchases...</p>
        </div>
      ) : filteredPurchases.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-xl p-12 text-center">
          <IconShoppingCart className="w-20 h-20 text-gray-300 mx-auto mb-4" />
          <p className="text-xl text-gray-600 font-semibold">No purchases yet</p>
          <p className="text-gray-500 mt-2">Start shopping for ministry merchandise!</p>
          <button className="mt-6 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-3 rounded-xl font-bold hover:from-purple-700 hover:to-pink-700 shadow-lg transform hover:scale-105 transition-all">
            Browse Merchandise
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredPurchases.map((purchase) => (
            <div key={purchase.id} className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all border-2 border-gray-100">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
                <div>
                  <p className="text-sm text-gray-500">Order #{purchase.orderNumber}</p>
                  <p className="text-lg font-bold text-gray-800">
                    {new Date(purchase.orderDate).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center gap-4 mt-4 md:mt-0">
                  <span className={`px-4 py-2 rounded-full text-sm font-bold ${getStatusBadge(purchase.status)}`}>
                    {getStatusIcon(purchase.status)}
                    <span className="ml-2">{purchase.status.toUpperCase()}</span>
                  </span>
                  <span className="text-2xl font-extrabold text-purple-600">
                    KES {purchase.totalAmount.toLocaleString()}
                  </span>
                </div>
              </div>

              <div className="border-t border-gray-200 pt-4">
                <h4 className="font-semibold text-gray-700 mb-2">Items:</h4>
                <div className="space-y-2">
                  {purchase.items.map((item, index) => (
                    <div key={index} className="flex justify-between items-center">
                      <span className="text-gray-600">
                        {item.name} × {item.quantity}
                      </span>
                      <span className="font-semibold text-gray-800">
                        KES {(item.price * item.quantity).toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {purchase.trackingNumber && (
                <div className="mt-4 bg-blue-50 rounded-lg p-3 border border-blue-200">
                  <p className="text-sm text-blue-700">
                    <IconTruck className="w-4 h-4 inline mr-1" />
                    Tracking: <span className="font-mono font-bold">{purchase.trackingNumber}</span>
                  </p>
                </div>
              )}

              <div className="mt-4 flex gap-3">
                <button className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-2 rounded-lg font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all">
                  View Details
                </button>
                {purchase.status === 'delivered' && (
                  <button className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 text-white py-2 rounded-lg font-semibold hover:from-green-700 hover:to-emerald-700 transition-all">
                    Leave Review
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyPurchases;
