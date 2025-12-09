
import React, { useState, useEffect, useCallback } from 'react';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import { MerchandiseItem, Route } from '../types';
import {
  ShoppingCart,
  Star,
  Search,
  Filter,
  Grid3X3,
  LayoutList,
  Heart,
  RefreshCw,
  Package,
  Truck,
  Shield,
  ArrowRight,
  Eye
} from 'lucide-react';

interface MerchPageProps {
  setRoute: (route: Route) => void;
}

// Product Card Skeleton
const ProductCardSkeleton: React.FC = () => (
  <div className="bg-card rounded-2xl overflow-hidden border border-border animate-pulse">
    <div className="h-64 bg-secondary"></div>
    <div className="p-5 space-y-3">
      <div className="h-4 w-16 bg-secondary rounded-full"></div>
      <div className="h-5 w-3/4 bg-secondary rounded"></div>
      <div className="h-4 w-full bg-secondary rounded"></div>
      <div className="flex items-center justify-between pt-3">
        <div className="h-6 w-20 bg-secondary rounded"></div>
        <div className="h-10 w-28 bg-secondary rounded-lg"></div>
      </div>
    </div>
  </div>
);

// Modern Product Card Component
const ProductCard: React.FC<{
  item: MerchandiseItem;
  onAddToCart: (item: MerchandiseItem) => void;
  viewMode: 'grid' | 'list';
}> = ({ item, onAddToCart, viewMode }) => {
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  if (viewMode === 'list') {
    return (
      <div className="bg-card rounded-xl border border-border hover:border-primary/30 hover:shadow-lg transition-all duration-300 overflow-hidden group">
        <div className="flex flex-col sm:flex-row">
          <div className="relative w-full sm:w-48 h-48 sm:h-auto flex-shrink-0 overflow-hidden">
            <img
              src={item.imageUrl}
              alt={item.name}
              className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
            />
            {item.stock === 0 && (
              <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                <span className="bg-destructive text-destructive-foreground text-sm font-bold px-3 py-1 rounded-lg">
                  Out of Stock
                </span>
              </div>
            )}
          </div>
          <div className="flex-1 p-5 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-primary bg-primary/10 px-2.5 py-0.5 rounded-full">
                  {item.category}
                </span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsWishlisted(!isWishlisted);
                  }}
                  className="p-1.5 rounded-full hover:bg-secondary transition-colors"
                >
                  <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-red-500 text-red-500' : 'text-muted-foreground'}`} />
                </button>
              </div>
              <h3 className="text-lg font-bold text-foreground mb-2 group-hover:text-primary transition-colors">
                {item.name}
              </h3>
              <p className="text-sm text-muted-foreground line-clamp-2">{item.description}</p>
            </div>
            <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
              <div>
                <p className="text-2xl font-bold text-foreground">KES {item.price.toLocaleString()}</p>
                <div className="flex items-center gap-2 mt-1">
                  <div className="flex items-center gap-0.5 text-yellow-500">
                    <Star className="w-3.5 h-3.5 fill-current" />
                    <span className="text-xs text-muted-foreground">(4.8)</span>
                  </div>
                  <span className="text-xs text-muted-foreground">•</span>
                  <span className="text-xs text-muted-foreground">{item.stock} in stock</span>
                </div>
              </div>
              <button
                onClick={() => onAddToCart(item)}
                disabled={item.stock === 0}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-lg font-medium transition-all ${
                  item.stock === 0
                    ? 'bg-secondary text-muted-foreground cursor-not-allowed'
                    : 'bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm hover:shadow-md'
                }`}
              >
                <ShoppingCart className="w-4 h-4" />
                Add to Cart
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="group bg-card rounded-2xl overflow-hidden border border-border hover:border-primary/30 hover:shadow-xl transition-all duration-300 flex flex-col"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative h-64 overflow-hidden">
        <img
          src={item.imageUrl}
          alt={item.name}
          className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        
        {/* Price Tag */}
        <div className="absolute top-4 right-4 bg-background/95 backdrop-blur-sm text-foreground text-sm font-bold px-3 py-1.5 rounded-full shadow-lg">
          KES {item.price.toLocaleString()}
        </div>
        
        {/* Low Stock Badge */}
        {item.stock < 10 && item.stock > 0 && (
          <div className="absolute top-4 left-4 bg-destructive text-destructive-foreground text-xs font-bold px-2.5 py-1 rounded-full shadow-sm animate-pulse">
            Only {item.stock} left!
          </div>
        )}
        
        {/* Out of Stock Overlay */}
        {item.stock === 0 && (
          <div className="absolute inset-0 bg-background/70 backdrop-blur-sm flex items-center justify-center">
            <span className="bg-destructive text-destructive-foreground text-lg font-bold px-4 py-2 rounded-lg">
              Out of Stock
            </span>
          </div>
        )}

        {/* Quick Actions - Show on Hover */}
        <div className={`absolute bottom-4 left-4 right-4 flex gap-2 transition-all duration-300 ${isHovered ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsWishlisted(!isWishlisted);
            }}
            className="p-2.5 bg-white/90 backdrop-blur-sm rounded-full shadow-lg hover:bg-white transition-colors"
          >
            <Heart className={`w-5 h-5 ${isWishlisted ? 'fill-red-500 text-red-500' : 'text-gray-700'}`} />
          </button>
          <button className="p-2.5 bg-white/90 backdrop-blur-sm rounded-full shadow-lg hover:bg-white transition-colors">
            <Eye className="w-5 h-5 text-gray-700" />
          </button>
        </div>
      </div>

      <div className="p-5 flex-grow flex flex-col">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-primary bg-primary/10 px-2.5 py-0.5 rounded-full">
            {item.category}
          </span>
          <div className="flex items-center gap-1 text-yellow-500">
            <Star className="w-4 h-4 fill-current" />
            <span className="text-xs text-muted-foreground font-medium">(4.8)</span>
          </div>
        </div>

        <h3 className="text-lg font-bold text-foreground mb-2 group-hover:text-primary transition-colors line-clamp-1">
          {item.name}
        </h3>

        <p className="text-sm text-muted-foreground mb-4 line-clamp-2 flex-grow">
          {item.description}
        </p>

        <div className="flex items-center justify-between text-xs text-muted-foreground mb-4">
          <span>{item.stock} in stock</span>
          <span className="flex items-center gap-1">
            <Truck className="w-3.5 h-3.5" />
            Free Delivery
          </span>
        </div>

        <button
          onClick={() => onAddToCart(item)}
          disabled={item.stock === 0}
          className={`w-full font-medium py-3 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 ${
            item.stock === 0
              ? 'bg-secondary text-muted-foreground cursor-not-allowed'
              : 'bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm hover:shadow-lg transform hover:-translate-y-0.5'
          }`}
        >
          <ShoppingCart className="w-5 h-5" />
          {item.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
        </button>
      </div>
    </div>
  );
};

const MerchPage: React.FC<MerchPageProps> = ({ setRoute }) => {
  const { addToCart, itemCount } = useCart();
  const { user } = useAuth();
  const [merchandise, setMerchandise] = useState<MerchandiseItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<'default' | 'price-low' | 'price-high' | 'name'>('default');

  const fetchMerchandise = useCallback(async () => {
    try {
      const response = await api.merchandise.getAll();
      if (response.success && response.data) {
        const items = Array.isArray(response.data) ? response.data : [];
        setMerchandise(items.map((item: any) => ({
          id: item.id,
          name: item.name,
          description: item.description,
          price: item.price,
          imageUrl: item.image_url || item.imageUrl || 'https://picsum.photos/400/400',
          category: item.category || 'General',
          stock: item.stock || 0,
        })));
      }
    } catch (error) {
      console.error('Error fetching merchandise:', error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchMerchandise();
  }, [fetchMerchandise]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchMerchandise();
  };

  // Get unique categories
  const categories = ['all', ...new Set(merchandise.map(item => item.category).filter(Boolean))];

  // Filter and sort merchandise
  const filteredMerchandise = merchandise
    .filter(item => {
      const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'price-low':
          return a.price - b.price;
        case 'price-high':
          return b.price - a.price;
        case 'name':
          return a.name.localeCompare(b.name);
        default:
          return 0;
      }
    });

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 md:py-12">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                <Package className="w-6 h-6 text-primary" />
              </div>
              <h1 className="text-3xl md:text-4xl font-bold text-foreground">
                Official Shop
              </h1>
            </div>
            <p className="text-muted-foreground text-lg max-w-xl">
              Support the ministry with our exclusive UET JKUAT merchandise
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="flex items-center gap-2 px-4 py-2 bg-secondary hover:bg-secondary/80 text-foreground rounded-lg transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              Refresh
            </button>
            <button
              onClick={() => setRoute({ page: 'cart' })}
              className="relative flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
            >
              <ShoppingCart className="w-4 h-4" />
              Cart
              {itemCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                  {itemCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Trust Badges */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          <div className="bg-card border border-border rounded-xl p-4 flex items-center gap-3">
            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
              <Package className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="font-semibold text-foreground text-sm">{merchandise.length}+</p>
              <p className="text-xs text-muted-foreground">Products</p>
            </div>
          </div>
          <div className="bg-card border border-border rounded-xl p-4 flex items-center gap-3">
            <div className="w-10 h-10 bg-green-500/10 rounded-lg flex items-center justify-center">
              <Shield className="w-5 h-5 text-green-500" />
            </div>
            <div>
              <p className="font-semibold text-foreground text-sm">100%</p>
              <p className="text-xs text-muted-foreground">Quality</p>
            </div>
          </div>
          <div className="bg-card border border-border rounded-xl p-4 flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-500/10 rounded-lg flex items-center justify-center">
              <Truck className="w-5 h-5 text-blue-500" />
            </div>
            <div>
              <p className="font-semibold text-foreground text-sm">Fast</p>
              <p className="text-xs text-muted-foreground">Delivery</p>
            </div>
          </div>
          <div className="bg-card border border-border rounded-xl p-4 flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-500/10 rounded-lg flex items-center justify-center">
              <Star className="w-5 h-5 text-amber-500" />
            </div>
            <div>
              <p className="font-semibold text-foreground text-sm">4.8/5</p>
              <p className="text-xs text-muted-foreground">Rating</p>
            </div>
          </div>
        </div>

        {/* Search, Filter, and View Controls */}
        <div className="flex flex-col lg:flex-row gap-4 mb-8">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-card border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground"
            />
          </div>

          {/* Categories */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 lg:pb-0">
            <Filter className="w-4 h-4 text-muted-foreground flex-shrink-0" />
            {categories.map(category => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                  selectedCategory === category
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-secondary text-muted-foreground hover:text-foreground'
                }`}
              >
                {category === 'all' ? 'All' : category}
              </button>
            ))}
          </div>

          {/* Sort and View Mode */}
          <div className="flex items-center gap-3">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-3 py-2 bg-card border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground"
            >
              <option value="default">Sort by</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="name">Name A-Z</option>
            </select>
            <div className="hidden sm:flex items-center bg-secondary rounded-lg p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-md transition-colors ${viewMode === 'grid' ? 'bg-card shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
              >
                <Grid3X3 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-md transition-colors ${viewMode === 'list' ? 'bg-card shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
              >
                <LayoutList className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className={`grid gap-6 ${viewMode === 'grid' ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' : 'grid-cols-1'}`}>
            {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
              <ProductCardSkeleton key={i} />
            ))}
          </div>
        )}

        {/* Empty State */}
        {!isLoading && filteredMerchandise.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-20 h-20 bg-secondary rounded-full flex items-center justify-center mb-6">
              <Package className="w-10 h-10 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-2">No Products Found</h3>
            <p className="text-muted-foreground max-w-md mb-6">
              {searchQuery || selectedCategory !== 'all'
                ? 'Try adjusting your search or filter to find what you\'re looking for.'
                : 'There are no products available at the moment. Check back soon!'}
            </p>
            {(searchQuery || selectedCategory !== 'all') && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('all');
                }}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
              >
                Clear Filters
              </button>
            )}
          </div>
        )}

        {/* Products Grid/List */}
        {!isLoading && filteredMerchandise.length > 0 && (
          <div className={`grid gap-6 ${viewMode === 'grid' ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' : 'grid-cols-1'}`}>
            {filteredMerchandise.map(item => (
              <ProductCard
                key={item.id}
                item={item}
                onAddToCart={addToCart}
                viewMode={viewMode}
              />
            ))}
          </div>
        )}

        {/* Guest Checkout Banner */}
        {!user && !isLoading && filteredMerchandise.length > 0 && (
          <div className="mt-12 bg-gradient-to-r from-primary/10 via-primary/5 to-primary/10 border border-primary/20 rounded-2xl p-8 text-center">
            <h3 className="text-xl font-bold text-foreground mb-2">Shop Without an Account</h3>
            <p className="text-muted-foreground mb-6 max-w-xl mx-auto">
              You can purchase merchandise as a guest using M-Pesa, or create an account to track your orders and earn rewards.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button
                onClick={() => setRoute({ page: 'register' })}
                className="flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium"
              >
                Create Account
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => setRoute({ page: 'cart' })}
                className="flex items-center gap-2 px-6 py-3 bg-secondary text-foreground rounded-lg hover:bg-secondary/80 transition-colors font-medium"
              >
                <ShoppingCart className="w-4 h-4" />
                View Cart ({itemCount})
              </button>
            </div>
          </div>
        )}

        {/* Contact CTA */}
        <div className="mt-12 text-center bg-card rounded-2xl p-8 md:p-12 border border-border">
          <h2 className="text-2xl font-bold text-foreground mb-3">Custom Orders & Bulk Purchases</h2>
          <p className="text-muted-foreground mb-6 max-w-xl mx-auto">
            Looking for custom merchandise or bulk orders for your department? Contact us for special pricing!
          </p>
          <button className="bg-secondary text-foreground font-medium px-6 py-3 rounded-lg hover:bg-secondary/80 transition-colors">
            Contact Us
          </button>
        </div>
      </div>
    </div>
  );
};

export default MerchPage;