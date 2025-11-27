
import React from 'react';
import { MOCK_MERCHANDISE } from '../constants';
import { useCart } from '../contexts/CartContext';
import { MerchandiseItem, Route } from '../types';
import { ShoppingCart, Star } from 'lucide-react';

interface MerchPageProps {
  setRoute: (route: Route) => void;
}

const MerchCard: React.FC<{ item: MerchandiseItem, onAddToCart: (item: MerchandiseItem) => void }> = ({ item, onAddToCart }) => (
  <div className="bg-card rounded-xl shadow-sm overflow-hidden border border-border hover:border-primary/50 hover:shadow-md transition-all duration-300 flex flex-col group">
    <div className="relative overflow-hidden h-72">
      <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500" />
      <div className="absolute top-4 right-4 bg-background/90 backdrop-blur-sm text-foreground text-sm font-bold px-3 py-1.5 rounded-full shadow-sm">
        KES {item.price.toLocaleString()}
      </div>
      {item.stock < 10 && item.stock > 0 && (
        <div className="absolute top-4 left-4 bg-destructive text-destructive-foreground text-xs font-bold px-2.5 py-1 rounded-full shadow-sm animate-pulse">
          Only {item.stock} left!
        </div>
      )}
      {item.stock === 0 && (
        <div className="absolute inset-0 bg-background/60 flex items-center justify-center">
          <span className="bg-destructive text-destructive-foreground text-lg font-bold px-4 py-2 rounded-lg">Out of Stock</span>
        </div>
      )}
    </div>
    <div className="p-5 flex-grow flex flex-col">
      <div className="mb-2">
        <span className="text-xs font-semibold text-primary bg-primary/10 px-2.5 py-0.5 rounded-full">{item.category}</span>
      </div>
      <h3 className="text-lg font-bold text-card-foreground mb-2 group-hover:text-primary transition-colors line-clamp-1">{item.name}</h3>
      <p className="text-muted-foreground text-sm mb-4 flex-grow line-clamp-2">{item.description}</p>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-1 text-yellow-500">
          <Star className="w-4 h-4 fill-current" />
          <span className="text-xs text-muted-foreground font-medium">(4.8)</span>
        </div>
        <span className="text-xs text-muted-foreground font-medium">{item.stock} in stock</span>
      </div>
      <button
        onClick={() => onAddToCart(item)}
        disabled={item.stock === 0}
        className={`w-full mt-auto font-medium py-2.5 rounded-lg transition-all duration-300 flex items-center justify-center gap-2 ${item.stock === 0
            ? 'bg-secondary text-muted-foreground cursor-not-allowed'
            : 'bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm hover:shadow-md'
          }`}
      >
        <ShoppingCart className="w-4 h-4" />
        {item.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
      </button>
    </div>
  </div>
);

const MerchPage: React.FC<MerchPageProps> = ({ setRoute }) => {
  const { addToCart } = useCart();

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-6 py-12">
        {/* Header Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-6">
            <span className="text-3xl">🛍️</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4 tracking-tight text-foreground">
            Official Merchandise
          </h1>
          <p className="text-lg text-muted-foreground mt-4 max-w-2xl mx-auto">
            Support the ministry and show your pride with our exclusive UET JKUAT gear. Every purchase helps fund our mission!
          </p>

          {/* Stats Bar */}
          <div className="mt-8 flex flex-wrap justify-center gap-4 md:gap-8">
            <div className="bg-card rounded-xl border border-border px-6 py-3 shadow-sm">
              <p className="text-2xl font-bold text-primary">{MOCK_MERCHANDISE.length}+</p>
              <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium">Products</p>
            </div>
            <div className="bg-card rounded-xl border border-border px-6 py-3 shadow-sm">
              <p className="text-2xl font-bold text-primary">100%</p>
              <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium">Quality</p>
            </div>
            <div className="bg-card rounded-xl border border-border px-6 py-3 shadow-sm">
              <p className="text-2xl font-bold text-primary">Fast</p>
              <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium">Delivery</p>
            </div>
          </div>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {MOCK_MERCHANDISE.map(item => (
            <MerchCard key={item.id} item={item} onAddToCart={addToCart} />
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="mt-16 text-center bg-secondary/30 rounded-2xl p-8 md:p-12 border border-border">
          <h2 className="text-2xl font-bold text-foreground mb-3">Can't find what you're looking for?</h2>
          <p className="text-muted-foreground mb-6">Contact us for custom orders and bulk purchases!</p>
          <button className="bg-background text-foreground border border-border font-medium px-6 py-3 rounded-lg hover:bg-secondary transition-colors shadow-sm">
            Contact Us
          </button>
        </div>
      </div>
    </div>
  );
};

export default MerchPage;