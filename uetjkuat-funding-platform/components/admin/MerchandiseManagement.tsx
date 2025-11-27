import React, { useState, useEffect } from 'react';
import { IconShoppingCart, IconPlus, IconEdit, IconTrash, IconUpload } from '../icons';
import api from '../../services/api';

interface Merchandise {
  id: number;
  name: string;
  description: string;
  price: number;
  stock: number;
  category?: string;
  image_url?: string;
  active: boolean;
  created_at: string;
}

const MerchandiseManagement: React.FC = () => {
  const [merchandise, setMerchandise] = useState<Merchandise[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<Merchandise | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    stock: '',
    category: '',
    image_url: '',
    active: true,
  });

  useEffect(() => {
    fetchMerchandise();
  }, []);

  const fetchMerchandise = async () => {
    try {
      setLoading(true);
      const response = await api.merchandise.getAll({ active: 'all' });
      if (response.success && response.data) {
        setMerchandise(Array.isArray(response.data) ? response.data : []);
      }
    } catch (error) {
      console.error('Error fetching merchandise:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadingImage(true);
      const response = await api.uploads.uploadImage(file);
      if (response.success && response.data) {
        setFormData({ ...formData, image_url: response.data.url });
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Failed to upload image');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const data = {
        ...formData,
        price: parseFloat(formData.price),
        stock: parseInt(formData.stock),
      };

      if (editingItem) {
        await api.merchandise.update(editingItem.id.toString(), data);
      } else {
        await api.merchandise.create(data);
      }

      setShowModal(false);
      setEditingItem(null);
      resetForm();
      fetchMerchandise();
    } catch (error) {
      console.error('Error saving merchandise:', error);
      alert('Failed to save merchandise');
    }
  };

  const handleEdit = (item: Merchandise) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      description: item.description,
      price: item.price.toString(),
      stock: item.stock.toString(),
      category: item.category || '',
      image_url: item.image_url || '',
      active: item.active,
    });
    setShowModal(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this item?')) return;

    try {
      await api.merchandise.delete(id.toString());
      fetchMerchandise();
    } catch (error) {
      console.error('Error deleting merchandise:', error);
      alert('Failed to delete merchandise');
    }
  };

  const handleUpdateStock = async (id: number, newStock: number) => {
    try {
      await api.merchandise.updateStock(id.toString(), newStock);
      fetchMerchandise();
    } catch (error) {
      console.error('Error updating stock:', error);
      alert('Failed to update stock');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      price: '',
      stock: '',
      category: '',
      image_url: '',
      active: true,
    });
  };

  const totalValue = merchandise.reduce((sum, item) => sum + (item.price * item.stock), 0);
  const lowStock = merchandise.filter(item => item.stock < 10).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
            <IconShoppingCart className="w-8 h-8 text-purple-600" />
            Merchandise Management
          </h2>
          <p className="text-gray-600 mt-1">Manage your catalog and inventory</p>
        </div>
        <button
          onClick={() => {
            setEditingItem(null);
            resetForm();
            setShowModal(true);
          }}
          className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-xl font-bold hover:from-purple-700 hover:to-pink-700 shadow-lg transform hover:scale-105 transition-all flex items-center gap-2"
        >
          <IconPlus className="w-5 h-5" />
          Add Product
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl shadow-xl p-6 border-2 border-purple-200">
          <p className="text-purple-700 font-semibold mb-2">Total Products</p>
          <p className="text-4xl font-extrabold text-purple-800">{merchandise.length}</p>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl shadow-xl p-6 border-2 border-green-200">
          <p className="text-green-700 font-semibold mb-2">In Stock</p>
          <p className="text-4xl font-extrabold text-green-800">
            {merchandise.filter(m => m.stock > 0).length}
          </p>
        </div>

        <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-2xl shadow-xl p-6 border-2 border-orange-200">
          <p className="text-orange-700 font-semibold mb-2">Low Stock</p>
          <p className="text-4xl font-extrabold text-orange-800">{lowStock}</p>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl shadow-xl p-6 border-2 border-blue-200">
          <p className="text-blue-700 font-semibold mb-2">Total Value</p>
          <p className="text-3xl font-extrabold text-blue-800">KES {totalValue.toLocaleString()}</p>
        </div>
      </div>

      {/* Products Grid */}
      {loading ? (
        <div className="bg-white rounded-2xl shadow-xl p-12 text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading products...</p>
        </div>
      ) : merchandise.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-xl p-12 text-center">
          <IconShoppingCart className="w-20 h-20 text-gray-300 mx-auto mb-4" />
          <p className="text-xl text-gray-600 font-semibold">No products yet</p>
          <p className="text-gray-500 mt-2">Add your first product to get started</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {merchandise.map((item) => (
            <div key={item.id} className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all border-2 border-gray-100">
              {/* Product Image */}
              <div className="h-48 bg-gradient-to-br from-purple-100 to-pink-100 relative">
                {item.image_url ? (
                  <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <IconShoppingCart className="w-20 h-20 text-purple-300" />
                  </div>
                )}
                {!item.active && (
                  <div className="absolute top-2 right-2 bg-red-500 text-white px-3 py-1 rounded-full text-xs font-bold">
                    INACTIVE
                  </div>
                )}
              </div>

              {/* Product Info */}
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-800 mb-2">{item.name}</h3>
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">{item.description}</p>

                <div className="flex justify-between items-center mb-4">
                  <span className="text-2xl font-extrabold text-purple-600">
                    KES {item.price.toLocaleString()}
                  </span>
                  <span className={`px-3 py-1 rounded-full text-sm font-bold ${
                    item.stock > 10 
                      ? 'bg-green-100 text-green-700'
                      : item.stock > 0
                      ? 'bg-orange-100 text-orange-700'
                      : 'bg-red-100 text-red-700'
                  }`}>
                    Stock: {item.stock}
                  </span>
                </div>

                {/* Stock Update */}
                <div className="mb-4">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Update Stock</label>
                  <input
                    type="number"
                    defaultValue={item.stock}
                    onBlur={(e) => {
                      const newStock = parseInt(e.target.value);
                      if (newStock !== item.stock) {
                        handleUpdateStock(item.id, newStock);
                      }
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(item)}
                    className="flex-1 bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 transition-all flex items-center justify-center gap-2"
                  >
                    <IconEdit className="w-4 h-4" />
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="flex-1 bg-red-600 text-white py-2 rounded-lg font-semibold hover:bg-red-700 transition-all flex items-center justify-center gap-2"
                  >
                    <IconTrash className="w-4 h-4" />
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full p-8 max-h-[90vh] overflow-y-auto">
            <h2 className="text-3xl font-bold text-gray-800 mb-6">
              {editingItem ? 'Edit Product' : 'Add New Product'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Image Upload */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Product Image</label>
                <div className="flex items-center gap-4">
                  {formData.image_url && (
                    <img src={formData.image_url} alt="Preview" className="w-32 h-32 object-cover rounded-lg" />
                  )}
                  <label className="flex-1 cursor-pointer">
                    <div className="border-2 border-dashed border-gray-300 rounded-xl p-4 text-center hover:border-purple-500 transition-all">
                      <IconUpload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-600">
                        {uploadingImage ? 'Uploading...' : 'Click to upload image'}
                      </p>
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                      disabled={uploadingImage}
                    />
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Product Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500"
                  rows={3}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Price (KES)</label>
                  <input
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Stock</label>
                  <input
                    type="number"
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Category</label>
                <input
                  type="text"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500"
                  placeholder="e.g., T-Shirts, Books, Accessories"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.active}
                  onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                  className="w-5 h-5 text-purple-600"
                />
                <label className="text-sm font-semibold text-gray-700">Active (visible to customers)</label>
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setEditingItem(null);
                    resetForm();
                  }}
                  className="flex-1 px-6 py-3 border-2 border-gray-300 rounded-xl font-bold text-gray-700 hover:bg-gray-50 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-xl font-bold hover:from-purple-700 hover:to-pink-700 shadow-lg transform hover:scale-105 transition-all"
                >
                  {editingItem ? 'Update Product' : 'Add Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MerchandiseManagement;
