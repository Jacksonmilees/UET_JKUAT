import React, { useState, useEffect } from 'react';
import { ShoppingCart, CheckCircle2, Clock, AlertCircle, Package, Truck, X, RefreshCw } from 'lucide-react';
import api from '../../services/api';
import { TableSkeleton, CardSkeleton } from '../ui/Skeleton';

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
      pending: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300',
      processing: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
      shipped: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300',
      delivered: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
      cancelled: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
    };
    return badges[status as keyof typeof badges] || 'bg-secondary text-secondary-foreground';
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'delivered':
        return <CheckCircle2 className="w-4 h-4 text-green-600" />;
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-600" />;
      case 'cancelled':
        return <AlertCircle className="w-4 h-4 text-red-600" />;
      case 'shipped':
        return <Truck className="w-4 h-4 text-indigo-600" />;
      case 'processing':
        return <Package className="w-4 h-4 text-blue-600" />;
      default:
        return <ShoppingCart className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const totalOrders = orders.length;
  const pendingOrders = orders.filter(o => o.status === 'pending').length;
  const processingOrders = orders.filter(o => o.status === 'processing').length;
  const shippedOrders = orders.filter(o => o.status === 'shipped').length;

  if (loading) {
    return (
      <div className="space-y-8">
        <div>
          <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <ShoppingCart className="w-6 h-6 text-primary" />
            Order Management
          </h2>
          <p className="text-sm text-muted-foreground mt-1">Loading orders...</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map(i => <CardSkeleton key={i} />)}
        </div>
        <TableSkeleton rows={6} columns={5} />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <ShoppingCart className="w-6 h-6 text-primary" />
            Order Management
          </h2>
          <p className="text-sm text-muted-foreground mt-1">Process and track customer orders</p>
        </div>
        <button
          onClick={fetchOrders}
          className="flex items-center gap-2 px-4 py-2 bg-secondary hover:bg-secondary/80 rounded-lg transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-card rounded-xl shadow-sm p-6 border border-border">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Total Orders</p>
            <ShoppingCart className="w-4 h-4 text-primary" />
          </div>
          <p className="text-2xl font-bold text-foreground">{totalOrders}</p>
        </div>

        <div className="bg-card rounded-xl shadow-sm p-6 border border-border">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Pending</p>
            <Clock className="w-4 h-4 text-yellow-600" />
          </div>
          <p className="text-2xl font-bold text-yellow-600">{pendingOrders}</p>
        </div>

        <div className="bg-card rounded-xl shadow-sm p-6 border border-border">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Processing</p>
            <Package className="w-4 h-4 text-blue-600" />
          </div>
          <p className="text-2xl font-bold text-blue-600">{processingOrders}</p>
        </div>

        <div className="bg-card rounded-xl shadow-sm p-6 border border-border">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Shipped</p>
            <Truck className="w-4 h-4 text-indigo-600" />
          </div>
          <p className="text-2xl font-bold text-indigo-600">{shippedOrders}</p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="bg-card rounded-xl shadow-sm p-1 border border-border inline-flex w-full md:w-auto overflow-x-auto">
        {(['all', 'pending', 'processing', 'shipped', 'delivered'] as const).map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`flex-1 md:flex-none px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${filter === status
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
              }`}
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </button>
        ))}
      </div>

      {/* Orders List */}
      {loading ? (
        <div className="bg-card rounded-xl shadow-sm p-12 text-center border border-border">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading orders...</p>
        </div>
      ) : orders.length === 0 ? (
        <div className="bg-card rounded-xl shadow-sm p-12 text-center border border-border">
          <ShoppingCart className="w-12 h-12 text-muted-foreground/50 mx-auto mb-4" />
          <p className="text-lg text-foreground font-semibold">No orders found</p>
          <p className="text-muted-foreground mt-2">Orders will appear here when customers make purchases</p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order.id} className="bg-card rounded-xl shadow-sm p-6 hover:shadow-md transition-all border border-border group">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-sm font-medium text-muted-foreground">Order #{order.order_number}</p>
                    <span className="text-xs text-muted-foreground">•</span>
                    <p className="text-sm text-muted-foreground">{new Date(order.created_at).toLocaleDateString()}</p>
                  </div>
                  <p className="text-lg font-bold text-foreground">{order.user.name}</p>
                  <p className="text-sm text-muted-foreground">{order.user.email} • {order.phone_number}</p>
                </div>
                <div className="flex flex-col md:items-end gap-2">
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium flex items-center gap-1.5 w-fit ${getStatusBadge(order.status)}`}>
                    {getStatusIcon(order.status)}
                    {order.status.toUpperCase()}
                  </span>
                  <span className="text-xl font-bold text-primary">
                    KES {order.total_amount.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Order Items */}
              <div className="bg-secondary/30 rounded-lg p-4 mb-4">
                <h4 className="text-sm font-medium text-foreground mb-3">Items</h4>
                <div className="space-y-2">
                  {order.items.map((item, index) => (
                    <div key={index} className="flex justify-between items-center text-sm">
                      <span className="text-muted-foreground">
                        {item.name || `Item #${item.merchandise_id}`} <span className="text-foreground font-medium">× {item.quantity}</span>
                      </span>
                      <span className="font-medium text-foreground">
                        KES {(item.price * item.quantity).toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Delivery Info */}
              <div className="flex flex-col md:flex-row gap-4 mb-6 text-sm">
                <div className="flex-1">
                  <p className="text-muted-foreground font-medium mb-1">Delivery Address</p>
                  <p className="text-foreground">{order.delivery_address}</p>
                </div>
                {order.tracking_number && (
                  <div className="flex-1">
                    <p className="text-muted-foreground font-medium mb-1">Tracking Number</p>
                    <p className="font-mono bg-secondary px-2 py-1 rounded w-fit text-foreground">{order.tracking_number}</p>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4 border-t border-border">
                <button
                  onClick={() => setSelectedOrder(order)}
                  className="flex-1 inline-flex justify-center items-center px-4 py-2 border border-input rounded-lg text-sm font-medium text-foreground hover:bg-secondary transition-colors"
                >
                  Update Status
                </button>
                <button className="flex-1 inline-flex justify-center items-center px-4 py-2 border border-transparent rounded-lg text-sm font-medium text-primary-foreground bg-primary hover:bg-primary/90 transition-colors">
                  View Details
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Update Status Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-xl shadow-2xl max-w-md w-full p-6 border border-border">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-foreground">Update Order Status</h2>
              <button onClick={() => setSelectedOrder(null)} className="text-muted-foreground hover:text-foreground">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Order Number</p>
                <p className="font-bold text-foreground">{selectedOrder.order_number}</p>
              </div>

              <div>
                <p className="text-sm text-muted-foreground mb-1">Current Status</p>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium inline-flex items-center gap-1.5 ${getStatusBadge(selectedOrder.status)}`}>
                  {getStatusIcon(selectedOrder.status)}
                  {selectedOrder.status.toUpperCase()}
                </span>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">New Status</label>
                <select
                  className="block w-full rounded-lg border border-input bg-background px-3 py-2 text-foreground shadow-sm focus:border-primary focus:ring-1 focus:ring-primary sm:text-sm"
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
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  Tracking Number (Optional)
                </label>
                <input
                  type="text"
                  value={trackingNumber}
                  onChange={(e) => setTrackingNumber(e.target.value)}
                  placeholder="Enter tracking number"
                  className="block w-full rounded-lg border border-input bg-background px-3 py-2 text-foreground shadow-sm focus:border-primary focus:ring-1 focus:ring-primary sm:text-sm"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => {
                    setSelectedOrder(null);
                    setTrackingNumber('');
                  }}
                  className="flex-1 px-4 py-2 border border-input rounded-lg font-medium text-foreground hover:bg-secondary transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    const select = document.getElementById('newStatus') as HTMLSelectElement;
                    handleUpdateStatus(selectedOrder.id, select.value);
                  }}
                  className="flex-1 bg-primary text-primary-foreground px-4 py-2 rounded-lg font-medium hover:bg-primary/90 transition-colors shadow-sm"
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
