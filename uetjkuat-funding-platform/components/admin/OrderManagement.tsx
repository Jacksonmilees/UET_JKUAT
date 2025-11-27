import React, { useState, useEffect } from 'react';
import { IconShoppingCart, IconCheckCircle, IconClock, IconAlertCircle } from '../icons';
import api from '../../services/api';

interface Order {
  id: number;
  order_number: string;
  user: {
    name: string;
    email: string;
    phone_number: string;
  };
  items: {
    id: number;
    merchandise_id: number;
    quantity: number;
    price: number;
    name?: string;
  }[];
  total_amount: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  payment_status: 'pending' | 'paid' | 'failed';
  delivery_address: string;
  phone_number: string;
  tracking_number?: string;
  created_at: string;
}

const OrderManagement: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'processing' | 'shipped' | 'delivered'>('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [trackingNumber, setTrackingNumber] = useState('');

  useEffect(() => {
    fetchOrders();
  }, [filter]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const params = filter !== 'all' ? { status: filter } : {};
      const response = await api.orders.getAll(params);
      if (response.success && response.data) {
        setOrders(Array.isArray(response.data) ? response.data : []);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (orderId: number, newStatus: string) => {
    try {
      await api.orders.updateStatus(orderId.toString(), newStatus, trackingNumber || undefined);
      fetchOrders();
      setSelectedOrder(null);
      setTrackingNumber('');
    } catch (error) {
      console.error('Error updating order:', error);
      alert('Failed to update order status');
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'delivered':
        return <IconCheckCircle className="w-5 h-5 text-green-600" />;
      case 'pending':
        return <IconClock className="w-5 h-5 text-yellow-600" />;
      case 'cancelled':
        return <IconAlertCircle className="w-5 h-5 text-red-600" />;
      default:
        return <IconShoppingCart className="w-5 h-5 text-blue-600" />;
    }
  };

  const totalOrders = orders.length;
  const pendingOrders = orders.filter(o => o.status === 'pending').length;
  const processingOrders = orders.filter(o => o.status === 'processing').length;
  const shippedOrders = orders.filter(o => o.status === 'shipped').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
          <IconShoppingCart className="w-8 h-8 text-purple-600" />
          Order Management
        </h2>
        <p className="text-gray-600 mt-1">Process and track customer orders</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl shadow-xl p-6 border-2 border-purple-200">
          <p className="text-purple-700 font-semibold mb-2">Total Orders</p>
          <p className="text-4xl font-extrabold text-purple-800">{totalOrders}</p>
        </div>

        <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-2xl shadow-xl p-6 border-2 border-yellow-200">
          <p className="text-yellow-700 font-semibold mb-2">Pending</p>
          <p className="text-4xl font-extrabold text-yellow-800">{pendingOrders}</p>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl shadow-xl p-6 border-2 border-blue-200">
          <p className="text-blue-700 font-semibold mb-2">Processing</p>
          <p className="text-4xl font-extrabold text-blue-800">{processingOrders}</p>
        </div>

        <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl shadow-xl p-6 border-2 border-indigo-200">
          <p className="text-indigo-700 font-semibold mb-2">Shipped</p>
          <p className="text-4xl font-extrabold text-indigo-800">{shippedOrders}</p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="bg-white rounded-2xl shadow-lg p-2 flex gap-2">
        {(['all', 'pending', 'processing', 'shipped', 'delivered'] as const).map((status) => (
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

      {/* Orders List */}
      {loading ? (
        <div className="bg-white rounded-2xl shadow-xl p-12 text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading orders...</p>
        </div>
      ) : orders.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-xl p-12 text-center">
          <IconShoppingCart className="w-20 h-20 text-gray-300 mx-auto mb-4" />
          <p className="text-xl text-gray-600 font-semibold">No orders found</p>
          <p className="text-gray-500 mt-2">Orders will appear here when customers make purchases</p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order.id} className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all border-2 border-gray-100">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
                <div>
                  <p className="text-sm text-gray-500">Order #{order.order_number}</p>
                  <p className="text-lg font-bold text-gray-800">{order.user.name}</p>
                  <p className="text-sm text-gray-600">{order.user.email} • {order.phone_number}</p>
                </div>
                <div className="flex items-center gap-4 mt-4 md:mt-0">
                  <span className={`px-4 py-2 rounded-full text-sm font-bold flex items-center gap-2 ${getStatusBadge(order.status)}`}>
                    {getStatusIcon(order.status)}
                    {order.status.toUpperCase()}
                  </span>
                  <span className="text-2xl font-extrabold text-purple-600">
                    KES {order.total_amount.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Order Items */}
              <div className="border-t border-gray-200 pt-4 mb-4">
                <h4 className="font-semibold text-gray-700 mb-2">Items:</h4>
                <div className="space-y-2">
                  {order.items.map((item, index) => (
                    <div key={index} className="flex justify-between items-center bg-gray-50 p-3 rounded-lg">
                      <span className="text-gray-700">
                        {item.name || `Item #${item.merchandise_id}`} × {item.quantity}
                      </span>
                      <span className="font-semibold text-gray-800">
                        KES {(item.price * item.quantity).toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Delivery Info */}
              <div className="bg-blue-50 rounded-lg p-3 mb-4 border border-blue-200">
                <p className="text-sm text-blue-700 font-semibold">Delivery Address:</p>
                <p className="text-gray-800">{order.delivery_address}</p>
                {order.tracking_number && (
                  <p className="text-sm text-blue-700 mt-2">
                    Tracking: <span className="font-mono font-bold">{order.tracking_number}</span>
                  </p>
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  onClick={() => setSelectedOrder(order)}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-2 rounded-lg font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all"
                >
                  Update Status
                </button>
                <button className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 text-white py-2 rounded-lg font-semibold hover:from-green-700 hover:to-emerald-700 transition-all">
                  View Details
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Update Status Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8">
            <h2 className="text-3xl font-bold text-gray-800 mb-6">Update Order Status</h2>

            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-600 mb-1">Order Number</p>
                <p className="font-bold text-gray-800">{selectedOrder.order_number}</p>
              </div>

              <div>
                <p className="text-sm text-gray-600 mb-1">Current Status</p>
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${getStatusBadge(selectedOrder.status)}`}>
                  {selectedOrder.status.toUpperCase()}
                </span>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">New Status</label>
                <select
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500"
                  defaultValue={selectedOrder.status}
                  id="newStatus"
                >
                  <option value="pending">Pending</option>
                  <option value="processing">Processing</option>
                  <option value="shipped">Shipped</option>
                  <option value="delivered">Delivered</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Tracking Number (Optional)
                </label>
                <input
                  type="text"
                  value={trackingNumber}
                  onChange={(e) => setTrackingNumber(e.target.value)}
                  placeholder="Enter tracking number"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  onClick={() => {
                    setSelectedOrder(null);
                    setTrackingNumber('');
                  }}
                  className="flex-1 px-6 py-3 border-2 border-gray-300 rounded-xl font-bold text-gray-700 hover:bg-gray-50 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    const select = document.getElementById('newStatus') as HTMLSelectElement;
                    handleUpdateStatus(selectedOrder.id, select.value);
                  }}
                  className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-xl font-bold hover:from-purple-700 hover:to-pink-700 shadow-lg transform hover:scale-105 transition-all"
                >
                  Update
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderManagement;
