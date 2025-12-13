import React, { useState, useEffect, useMemo } from 'react';
import { DataTable } from './shared/DataTable';
import { StatCard } from './shared/StatCard';
import { FilterBar } from './shared/FilterBar';
import { ApiResponse } from '../../types/backend';
import {
  ShoppingBag, Eye, Truck, DollarSign, Package, CheckCircle,
  XCircle, Clock, AlertCircle, User, Phone, MapPin, X
} from 'lucide-react';
import api from '../../services/api';

interface Order {
  id: number;
  order_number: string;
  user_id: number;
  user_name?: string;
  user_email?: string;
  user_phone?: string;
  total_amount: string | number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  payment_status: 'pending' | 'paid' | 'failed' | 'refunded';
  shipping_address?: string;
  tracking_number?: string;
  items?: OrderItem[];
  created_at: string;
  updated_at: string;
}

interface OrderItem {
  id: number;
  merchandise_id: number;
  merchandise_name: string;
  quantity: number;
  price: string | number;
  subtotal: string | number;
}

export function OrdersManagement({ className = '' }: { className?: string }) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | Order['status']>('all');
  const [paymentFilter, setPaymentFilter] = useState<'all' | Order['payment_status']>('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [trackingNumber, setTrackingNumber] = useState('');

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response: ApiResponse<Order[]> = await api.orders.getAll();
      if (response.success && response.data) {
        setOrders(Array.isArray(response.data) ? response.data : []);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (orderId: number, newStatus: Order['status']) => {
    try {
      const tracking = newStatus === 'shipped' ? trackingNumber : undefined;
      const response: ApiResponse = await api.orders.updateStatus(orderId.toString(), newStatus, tracking);
      if (response.success) {
        await fetchOrders();
        setTrackingNumber('');
      }
    } catch (error) {
      console.error('Error updating order status:', error);
    }
  };

  const handleUpdatePayment = async (orderId: number, paymentStatus: Order['payment_status']) => {
    try {
      const response: ApiResponse = await api.orders.updatePayment(orderId.toString(), paymentStatus);
      if (response.success) {
        await fetchOrders();
      }
    } catch (error) {
      console.error('Error updating payment status:', error);
    }
  };

  const openOrderDetails = (order: Order) => {
    setSelectedOrder(order);
    setShowModal(true);
  };

  const filteredOrders = useMemo(() => {
    let filtered = [...orders];

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(order =>
        order.order_number.toLowerCase().includes(query) ||
        order.user_name?.toLowerCase().includes(query) ||
        order.user_email?.toLowerCase().includes(query) ||
        order.user_phone?.toLowerCase().includes(query)
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(order => order.status === statusFilter);
    }

    if (paymentFilter !== 'all') {
      filtered = filtered.filter(order => order.payment_status === paymentFilter);
    }

    return filtered;
  }, [orders, searchQuery, statusFilter, paymentFilter]);

  const stats = {
    total: orders.length,
    pending: orders.filter(o => o.status === 'pending').length,
    shipped: orders.filter(o => o.status === 'shipped').length,
    delivered: orders.filter(o => o.status === 'delivered').length,
    revenue: orders.reduce((sum, o) => sum + parseFloat(o.total_amount.toString()), 0),
  };

  const columns = [
    {
      key: 'order_number',
      header: 'Order #',
      render: (order: Order) => (
        <div className="font-medium text-gray-900">{order.order_number}</div>
      )
    },
    {
      key: 'customer',
      header: 'Customer',
      render: (order: Order) => (
        <div>
          <div className="font-medium text-gray-900">{order.user_name || 'N/A'}</div>
          <div className="text-sm text-gray-500">{order.user_email}</div>
        </div>
      )
    },
    {
      key: 'total',
      header: 'Total',
      render: (order: Order) => (
        <div className="font-medium text-gray-900">
          KES {parseFloat(order.total_amount.toString()).toLocaleString('en-KE', { minimumFractionDigits: 2 })}
        </div>
      )
    },
    {
      key: 'status',
      header: 'Order Status',
      render: (order: Order) => {
        const statusColors = {
          pending: 'bg-yellow-100 text-yellow-800',
          processing: 'bg-blue-100 text-blue-800',
          shipped: 'bg-purple-100 text-purple-800',
          delivered: 'bg-green-100 text-green-800',
          cancelled: 'bg-red-100 text-red-800',
        };
        const status = order.status || 'pending';
        return (
          <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusColors[status as keyof typeof statusColors] || statusColors.pending}`}>
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </span>
        );
      }
    },
    {
      key: 'payment',
      header: 'Payment',
      render: (order: Order) => {
        const paymentColors = {
          pending: 'bg-gray-100 text-gray-800',
          paid: 'bg-green-100 text-green-800',
          failed: 'bg-red-100 text-red-800',
          refunded: 'bg-orange-100 text-orange-800',
        };
        const paymentStatus = order.payment_status || 'pending';
        return (
          <span className={`px-2 py-1 text-xs font-medium rounded-full ${paymentColors[paymentStatus as keyof typeof paymentColors] || paymentColors.pending}`}>
            {paymentStatus.charAt(0).toUpperCase() + paymentStatus.slice(1)}
          </span>
        );
      }
    },
    {
      key: 'date',
      header: 'Date',
      render: (order: Order) => new Date(order.created_at).toLocaleDateString()
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (order: Order) => (
        <div className="flex items-center space-x-2">
          <button
            onClick={() => openOrderDetails(order)}
            className="p-1 text-blue-600 hover:bg-blue-50 rounded"
            title="View Details"
          >
            <Eye className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className={`space-y-6 ${className}`}>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Orders Management</h1>
          <p className="text-sm text-gray-600 mt-1">Manage customer orders and fulfillment</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard title="Total Orders" value={stats.total.toString()} icon={ShoppingBag} gradient="blue" loading={loading} />
        <StatCard title="Pending" value={stats.pending.toString()} icon={Clock} gradient="orange" loading={loading} />
        <StatCard title="Shipped" value={stats.shipped.toString()} icon={Truck} gradient="purple" loading={loading} />
        <StatCard title="Delivered" value={stats.delivered.toString()} icon={CheckCircle} gradient="green" loading={loading} />
        <StatCard title="Total Revenue" value={`KES ${stats.revenue.toLocaleString('en-KE', { minimumFractionDigits: 0 })}`} icon={DollarSign} gradient="green" loading={loading} />
      </div>

      <FilterBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Search orders..."
        filters={[
          {
            label: 'Order Status',
            value: statusFilter,
            onChange: (value) => setStatusFilter(value as typeof statusFilter),
            options: [
              { value: 'all', label: 'All Status' },
              { value: 'pending', label: 'Pending' },
              { value: 'processing', label: 'Processing' },
              { value: 'shipped', label: 'Shipped' },
              { value: 'delivered', label: 'Delivered' },
              { value: 'cancelled', label: 'Cancelled' },
            ],
          },
          {
            label: 'Payment',
            value: paymentFilter,
            onChange: (value) => setPaymentFilter(value as typeof paymentFilter),
            options: [
              { value: 'all', label: 'All Payments' },
              { value: 'pending', label: 'Pending' },
              { value: 'paid', label: 'Paid' },
              { value: 'failed', label: 'Failed' },
              { value: 'refunded', label: 'Refunded' },
            ],
          },
        ]}
        onRefresh={fetchOrders}
      />

      <div className="bg-white rounded-lg shadow">
        <DataTable
          data={filteredOrders}
          columns={columns}
          keyExtractor={(order) => order.id.toString()}
          loading={loading}
          emptyMessage="No orders found"
          itemsPerPage={15}
        />
      </div>

      {showModal && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">Order Details - {selectedOrder.order_number}</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Customer Info */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                  <User className="w-5 h-5 mr-2" />
                  Customer Information
                </h3>
                <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg">
                  <div>
                    <span className="text-sm text-gray-500">Name:</span>
                    <p className="font-medium">{selectedOrder.user_name || 'N/A'}</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500">Email:</span>
                    <p className="font-medium">{selectedOrder.user_email || 'N/A'}</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500">Phone:</span>
                    <p className="font-medium">{selectedOrder.user_phone || 'N/A'}</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500">Address:</span>
                    <p className="font-medium">{selectedOrder.shipping_address || 'N/A'}</p>
                  </div>
                </div>
              </div>

              {/* Order Items */}
              {selectedOrder.items && selectedOrder.items.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                    <Package className="w-5 h-5 mr-2" />
                    Order Items
                  </h3>
                  <div className="border rounded-lg overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Quantity</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Subtotal</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {selectedOrder.items.map((item) => (
                          <tr key={item.id}>
                            <td className="px-4 py-3 text-sm font-medium text-gray-900">{item.merchandise_name}</td>
                            <td className="px-4 py-3 text-sm text-gray-500">{item.quantity}</td>
                            <td className="px-4 py-3 text-sm text-gray-500">KES {parseFloat(item.price.toString()).toLocaleString()}</td>
                            <td className="px-4 py-3 text-sm font-medium text-gray-900">KES {parseFloat(item.subtotal.toString()).toLocaleString()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Order Status Update */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Update Order Status</h3>
                <div className="flex flex-wrap gap-2">
                  {['pending', 'processing', 'shipped', 'delivered', 'cancelled'].map((status) => (
                    <button
                      key={status}
                      onClick={() => {
                        if (status === 'shipped' && !trackingNumber) {
                          const tracking = prompt('Enter tracking number:');
                          if (tracking) {
                            setTrackingNumber(tracking);
                            handleUpdateStatus(selectedOrder.id, status as Order['status']);
                          }
                        } else {
                          handleUpdateStatus(selectedOrder.id, status as Order['status']);
                        }
                      }}
                      disabled={selectedOrder.status === status}
                      className={`px-4 py-2 rounded-lg text-sm font-medium ${
                        selectedOrder.status === status
                          ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                          : 'bg-blue-600 text-white hover:bg-blue-700'
                      }`}
                    >
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Payment Status Update */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Update Payment Status</h3>
                <div className="flex flex-wrap gap-2">
                  {['pending', 'paid', 'failed', 'refunded'].map((status) => (
                    <button
                      key={status}
                      onClick={() => handleUpdatePayment(selectedOrder.id, status as Order['payment_status'])}
                      disabled={selectedOrder.payment_status === status}
                      className={`px-4 py-2 rounded-lg text-sm font-medium ${
                        selectedOrder.payment_status === status
                          ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                          : 'bg-green-600 text-white hover:bg-green-700'
                      }`}
                    >
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Tracking Number */}
              {selectedOrder.tracking_number && (
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="flex items-center">
                    <Truck className="w-5 h-5 text-blue-600 mr-2" />
                    <span className="text-sm font-medium text-blue-900">Tracking Number:</span>
                    <span className="ml-2 text-sm text-blue-700">{selectedOrder.tracking_number}</span>
                  </div>
                </div>
              )}

              {/* Total */}
              <div className="border-t pt-4">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold text-gray-900">Total Amount:</span>
                  <span className="text-2xl font-bold text-green-600">
                    KES {parseFloat(selectedOrder.total_amount.toString()).toLocaleString('en-KE', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
