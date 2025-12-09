import React, { useState, useEffect, useRef } from 'react';
import { ShoppingCart, Plus, Edit2, Trash2, Upload, X, Package, DollarSign, AlertTriangle, CheckCircle2, Loader2, RefreshCw, ZoomIn, Image as ImageIcon } from 'lucide-react';
import api from '../../services/api';
import { ProductCardSkeleton, CardSkeleton } from '../ui/Skeleton';

interface Merchandise {
  id: number;
  name: string;
  description: string;
  price: number;
  stock: number;
  category?: string;
  image_url?: string;
  images?: string[]; // Multiple images support
  active: boolean;
  created_at: string;
}

// Image Zoom Modal Component
const ImageZoomModal: React.FC<{ 
  imageUrl: string; 
  onClose: () => void; 
  allImages?: string[];
}> = ({ imageUrl, onClose, allImages = [] }) => {
  const [currentImage, setCurrentImage] = useState(imageUrl);
  const images = allImages.length > 0 ? allImages : [imageUrl];
  
  return (
    <div 
      className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <button 
        onClick={onClose}
        className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors"
      >
        <X className="w-6 h-6" />
      </button>
      
      <div className="max-w-4xl w-full" onClick={(e) => e.stopPropagation()}>
        <img 
          src={currentImage} 
          alt="Zoomed" 
          className="w-full h-auto max-h-[80vh] object-contain rounded-lg"
        />
        
        {images.length > 1 && (
          <div className="flex justify-center gap-2 mt-4">
            {images.map((img, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentImage(img)}
                className={`w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${
                  currentImage === img ? 'border-white' : 'border-transparent opacity-60 hover:opacity-100'
                }`}
              >
                <img src={img} alt={`Thumb ${idx + 1}`} className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const MerchandiseManagement: React.FC = () => {
  const [merchandise, setMerchandise] = useState<Merchandise[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<Merchandise | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [zoomedImage, setZoomedImage] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    stock: '',
    category: '',
    image_url: '',
    images: [] as string[], // Array of additional images
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

  // Convert file to base64
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  };

  // Upload main image (using base64)
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadingImage(true);
      const base64 = await fileToBase64(file);
      setFormData({ ...formData, image_url: base64 });
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Failed to upload image');
    } finally {
      setUploadingImage(false);
    }
  };

  // Upload additional images (multi-image support using base64)
  const handleMultiImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    try {
      setUploadingImage(true);
      const uploadedUrls: string[] = [];
      
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const base64 = await fileToBase64(file);
        uploadedUrls.push(base64);
      }
      
      if (uploadedUrls.length > 0) {
        setFormData(prev => {
          const newImages = [...prev.images, ...uploadedUrls];
          return { 
            ...prev, 
            images: newImages,
            // Set the first uploaded image as main image_url if none exists
            image_url: prev.image_url || newImages[0]
          };
        });
      }
    } catch (error) {
      console.error('Error uploading images:', error);
      alert('Failed to upload some images');
    } finally {
      setUploadingImage(false);
    }
  };

  // Remove additional image
  const removeAdditionalImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
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
      images: item.images || [],
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
      images: [],
      active: true,
    });
  };

  const totalValue = merchandise.reduce((sum, item) => sum + (item.price * item.stock), 0);
  const lowStock = merchandise.filter(item => item.stock < 10).length;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <ShoppingCart className="w-6 h-6 text-primary" />
            Merchandise Management
          </h2>
          <p className="text-sm text-muted-foreground mt-1">Manage your catalog and inventory</p>
        </div>
        <button
          onClick={() => {
            setEditingItem(null);
            resetForm();
            setShowModal(true);
          }}
          className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg shadow-sm text-primary-foreground bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-all"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Product
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-card rounded-xl shadow-sm p-6 border border-border">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Total Products</p>
            <Package className="w-4 h-4 text-primary" />
          </div>
          <p className="text-2xl font-bold text-foreground">{merchandise.length}</p>
        </div>

        <div className="bg-card rounded-xl shadow-sm p-6 border border-border">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">In Stock</p>
            <CheckCircle2 className="w-4 h-4 text-green-600" />
          </div>
          <p className="text-2xl font-bold text-green-600">
            {merchandise.filter(m => m.stock > 0).length}
          </p>
        </div>

        <div className="bg-card rounded-xl shadow-sm p-6 border border-border">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Low Stock</p>
            <AlertTriangle className="w-4 h-4 text-orange-600" />
          </div>
          <p className="text-2xl font-bold text-orange-600">{lowStock}</p>
        </div>

        <div className="bg-card rounded-xl shadow-sm p-6 border border-border">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Total Value</p>
            <DollarSign className="w-4 h-4 text-blue-600" />
          </div>
          <p className="text-2xl font-bold text-blue-600">KES {totalValue.toLocaleString()}</p>
        </div>
      </div>

      {/* Products Grid */}
      {loading ? (
        <div className="bg-card rounded-xl shadow-sm p-12 text-center border border-border">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading products...</p>
        </div>
      ) : merchandise.length === 0 ? (
        <div className="bg-card rounded-xl shadow-sm p-12 text-center border border-border">
          <ShoppingCart className="w-12 h-12 text-muted-foreground/50 mx-auto mb-4" />
          <p className="text-lg text-foreground font-semibold">No products yet</p>
          <p className="text-muted-foreground mt-2">Add your first product to get started</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {merchandise.map((item) => (
            <div key={item.id} className="bg-card rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-all border border-border group">
              {/* Product Image with Hover Zoom */}
              <div className="h-48 bg-secondary/50 relative overflow-hidden cursor-pointer" onClick={() => item.image_url && setZoomedImage(item.image_url)}>
                {item.image_url ? (
                  <>
                    <img 
                      src={item.image_url} 
                      alt={item.name} 
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110" 
                    />
                    {/* Hover Overlay with Zoom Icon */}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all duration-300 flex items-center justify-center">
                      <ZoomIn className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    </div>
                    {/* Image count badge */}
                    {item.images && item.images.length > 1 && (
                      <div className="absolute bottom-2 right-2 bg-black/60 text-white px-2 py-1 rounded-lg text-xs font-medium flex items-center gap-1">
                        <ImageIcon className="w-3 h-3" />
                        {item.images.length}
                      </div>
                    )}
                  </>
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <ShoppingCart className="w-16 h-16 text-muted-foreground/30" />
                  </div>
                )}
                {!item.active && (
                  <div className="absolute top-2 right-2 bg-destructive text-destructive-foreground px-2 py-1 rounded text-xs font-bold">
                    INACTIVE
                  </div>
                )}
              </div>

              {/* Product Info */}
              <div className="p-5">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-lg font-bold text-foreground line-clamp-1" title={item.name}>{item.name}</h3>
                </div>
                <p className="text-muted-foreground text-sm mb-4 line-clamp-2 min-h-[40px]">{item.description}</p>

                <div className="flex justify-between items-center mb-4">
                  <span className="text-xl font-bold text-primary">
                    KES {item.price.toLocaleString()}
                  </span>
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${item.stock > 10
                      ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                      : item.stock > 0
                        ? 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300'
                        : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                    }`}>
                    Stock: {item.stock}
                  </span>
                </div>

                {/* Stock Update */}
                <div className="mb-4">
                  <label className="block text-xs font-medium text-muted-foreground mb-1.5 uppercase tracking-wider">Update Stock</label>
                  <input
                    type="number"
                    defaultValue={item.stock}
                    onBlur={(e) => {
                      const newStock = parseInt(e.target.value);
                      if (newStock !== item.stock) {
                        handleUpdateStock(item.id, newStock);
                      }
                    }}
                    className="block w-full rounded-lg border border-input bg-background px-3 py-2 text-foreground shadow-sm focus:border-primary focus:ring-1 focus:ring-primary sm:text-sm"
                  />
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-2 border-t border-border">
                  <button
                    onClick={() => handleEdit(item)}
                    className="flex-1 inline-flex justify-center items-center px-3 py-2 border border-input rounded-lg text-sm font-medium text-foreground hover:bg-secondary transition-colors"
                  >
                    <Edit2 className="w-4 h-4 mr-2" />
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="flex-1 inline-flex justify-center items-center px-3 py-2 border border-transparent rounded-lg text-sm font-medium text-destructive hover:bg-destructive/10 transition-colors"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
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
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-xl shadow-2xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto border border-border">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-foreground">
                {editingItem ? 'Edit Product' : 'Add New Product'}
              </h2>
              <button onClick={() => setShowModal(false)} className="text-muted-foreground hover:text-foreground">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Image Upload Section */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  Product Images
                  <span className="text-muted-foreground font-normal ml-1">(First image will be the main image)</span>
                </label>
                
                {/* Image Gallery */}
                {formData.images.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-3">
                    {formData.images.map((img, idx) => (
                      <div key={idx} className="relative group">
                        <img 
                          src={img} 
                          alt={`Product ${idx + 1}`} 
                          className="w-20 h-20 object-cover rounded-lg border border-border cursor-pointer hover:opacity-80 transition-opacity"
                          onClick={() => setZoomedImage(img)}
                        />
                        {idx === 0 && (
                          <span className="absolute -top-2 -left-2 bg-primary text-primary-foreground text-xs px-1.5 py-0.5 rounded-full">
                            Main
                          </span>
                        )}
                        <button
                          type="button"
                          onClick={() => {
                            setFormData(prev => ({
                              ...prev,
                              images: prev.images.filter((_, i) => i !== idx),
                              image_url: idx === 0 && prev.images.length > 1 ? prev.images[1] : (idx === 0 ? '' : prev.image_url)
                            }));
                          }}
                          className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                
                {/* Upload Button */}
                <label className="cursor-pointer group block">
                  <div className="border-2 border-dashed border-input rounded-xl p-4 text-center hover:border-primary transition-all bg-secondary/30 group-hover:bg-secondary/50">
                    <Upload className="w-6 h-6 text-muted-foreground mx-auto mb-2 group-hover:text-primary" />
                    <p className="text-xs text-muted-foreground group-hover:text-foreground">
                      {uploadingImage ? 'Uploading...' : 'Click to upload images (multiple allowed)'}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {formData.images.length} image{formData.images.length !== 1 ? 's' : ''} added
                    </p>
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleMultiImageUpload}
                    className="hidden"
                    disabled={uploadingImage}
                  />
                </label>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Product Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="block w-full rounded-lg border border-input bg-background px-3 py-2 text-foreground shadow-sm focus:border-primary focus:ring-1 focus:ring-primary sm:text-sm"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="block w-full rounded-lg border border-input bg-background px-3 py-2 text-foreground shadow-sm focus:border-primary focus:ring-1 focus:ring-primary sm:text-sm"
                  rows={3}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Price (KES)</label>
                  <input
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="block w-full rounded-lg border border-input bg-background px-3 py-2 text-foreground shadow-sm focus:border-primary focus:ring-1 focus:ring-primary sm:text-sm"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Stock</label>
                  <input
                    type="number"
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                    className="block w-full rounded-lg border border-input bg-background px-3 py-2 text-foreground shadow-sm focus:border-primary focus:ring-1 focus:ring-primary sm:text-sm"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Category</label>
                <input
                  type="text"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="block w-full rounded-lg border border-input bg-background px-3 py-2 text-foreground shadow-sm focus:border-primary focus:ring-1 focus:ring-primary sm:text-sm"
                  placeholder="e.g., T-Shirts, Books, Accessories"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="active"
                  checked={formData.active}
                  onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                  className="w-4 h-4 text-primary border-input rounded focus:ring-primary"
                />
                <label htmlFor="active" className="text-sm font-medium text-foreground">Active (visible to customers)</label>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setEditingItem(null);
                    resetForm();
                  }}
                  className="flex-1 px-4 py-2 border border-input rounded-lg font-medium text-foreground hover:bg-secondary transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-primary text-primary-foreground px-4 py-2 rounded-lg font-medium hover:bg-primary/90 transition-colors shadow-sm"
                >
                  {editingItem ? 'Update Product' : 'Add Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Image Zoom Modal */}
      {zoomedImage && (
        <ImageZoomModal 
          imageUrl={zoomedImage} 
          onClose={() => setZoomedImage(null)}
          allImages={formData.images.length > 0 ? formData.images : undefined}
        />
      )}
    </div>
  );
};

export default MerchandiseManagement;
