

import React from 'react';
import { MOCK_MERCHANDISE } from '../constants';
import { useCart } from '../contexts/CartContext';
import { MerchandiseItem, Route } from '../types';
import { IconShoppingCart } from '../components/icons';

interface MerchPageProps {
  setRoute: (route: Route) => void;
}

const MerchCard: React.FC<{ item: MerchandiseItem, onAddToCart: (item: MerchandiseItem) => void }> = ({ item, onAddToCart }) => (
    <div className="bg-white rounded-2xl shadow-xl overflow-hidden transform hover:-translate-y-3 hover:shadow-2xl transition-all duration-500 flex flex-col group border-2 border-transparent hover:border-purple-200">
        <div className="relative overflow-hidden">
            <img src={item.imageUrl} alt={item.name} className="w-full h-72 object-cover transform group-hover:scale-110 transition-transform duration-700" />
            <div className="absolute top-4 right-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-lg font-bold px-5 py-2 rounded-full shadow-lg">
                KES {item.price.toLocaleString()}
            </div>
            {item.stock < 10 && item.stock > 0 && (
                <div className="absolute top-4 left-4 bg-gradient-to-r from-orange-500 to-red-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg animate-pulse">
                    Only {item.stock} left!
                </div>
            )}
            {item.stock === 0 && (
                <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                    <span className="bg-red-600 text-white text-xl font-bold px-6 py-3 rounded-xl">Out of Stock</span>
                </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
        </div>
        <div className="p-6 flex-grow flex flex-col bg-gradient-to-b from-white to-purple-50">
            <div className="mb-3">
                <span className="text-xs font-bold text-purple-600 bg-purple-100 px-3 py-1 rounded-full">{item.category}</span>
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-3 group-hover:text-purple-600 transition-colors">{item.name}</h3>
            <p className="text-gray-600 text-sm mb-4 flex-grow leading-relaxed">{item.description}</p>
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-1 text-yellow-500">
                    {[...Array(5)].map((_, i) => (
                        <svg key={i} className="w-4 h-4 fill-current" viewBox="0 0 20 20">
                            <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z"/>
                        </svg>
                    ))}
                    <span className="text-xs text-gray-600 ml-2">(4.8)</span>
                </div>
                <span className="text-xs text-gray-500">{item.stock} in stock</span>
            </div>
            <button 
                onClick={() => onAddToCart(item)}
                disabled={item.stock === 0}
                className={`w-full mt-4 font-bold py-3 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 shadow-lg transform hover:scale-105 ${
                    item.stock === 0 
                        ? 'bg-gray-400 cursor-not-allowed text-white' 
                        : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white hover:shadow-xl'
                }`}
            >
                <IconShoppingCart className="w-5 h-5"/>
                {item.stock === 0 ? 'Out of Stock' : 'Add to Cart 🛒'}
            </button>
        </div>
    </div>
);

const MerchPage: React.FC<MerchPageProps> = ({ setRoute }) => {
  const { addToCart } = useCart();

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
      <div className="container mx-auto px-6 py-16">
        {/* Header Section */}
        <div className="text-center mb-16">
          <div className="inline-block mb-6">
            <span className="text-6xl">🛍️</span>
          </div>
          <h1 className="text-5xl md:text-6xl font-extrabold mb-4">
            <span className="bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent">
              Official Merchandise
            </span>
          </h1>
          <p className="text-xl text-gray-700 mt-4 max-w-3xl mx-auto leading-relaxed">
            Support the ministry and show your pride with our exclusive UET JKUAT gear. Every purchase helps fund our mission! 🙏
          </p>
          
          {/* Stats Bar */}
          <div className="mt-10 flex flex-wrap justify-center gap-8">
            <div className="bg-white rounded-2xl shadow-lg px-8 py-4">
              <p className="text-3xl font-bold text-purple-600">{MOCK_MERCHANDISE.length}+</p>
              <p className="text-sm text-gray-600">Products</p>
            </div>
            <div className="bg-white rounded-2xl shadow-lg px-8 py-4">
              <p className="text-3xl font-bold text-pink-600">100%</p>
              <p className="text-sm text-gray-600">Quality</p>
            </div>
            <div className="bg-white rounded-2xl shadow-lg px-8 py-4">
              <p className="text-3xl font-bold text-blue-600">Fast</p>
              <p className="text-sm text-gray-600">Delivery</p>
            </div>
          </div>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {MOCK_MERCHANDISE.map(item => (
                <MerchCard key={item.id} item={item} onAddToCart={addToCart} />
            ))}
        </div>

        {/* Bottom CTA */}
        <div className="mt-16 text-center bg-gradient-to-r from-purple-600 to-pink-600 rounded-3xl p-12 shadow-2xl">
          <h2 className="text-3xl font-bold text-white mb-4">Can't find what you're looking for? 🤔</h2>
          <p className="text-purple-100 mb-6 text-lg">Contact us for custom orders and bulk purchases!</p>
          <button className="bg-white text-purple-600 font-bold px-8 py-4 rounded-xl hover:bg-purple-50 transition-all transform hover:scale-105 shadow-lg">
            Contact Us 📧
          </button>
        </div>
      </div>
    </div>
  );
};

export default MerchPage;