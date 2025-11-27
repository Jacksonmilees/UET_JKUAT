

import React from 'react';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { Route } from '../types';
import { IconTrash, IconPlus, IconMinus } from '../components/icons';

interface CartPageProps {
  setRoute: (route: Route) => void;
}

const CartPage: React.FC<CartPageProps> = ({ setRoute }) => {
  const { cartItems, removeFromCart, updateQuantity, checkout, cartTotal } = useCart();
  const { user } = useAuth();
  
  const handleCheckout = () => {
      if(!user) {
          setRoute({ page: 'login' });
          return;
      }
      checkout();
      setRoute({ page: 'dashboard' });
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
      <div className="container mx-auto px-6 py-12">
        <div className="mb-8">
          <h1 className="text-5xl font-extrabold mb-2">
            <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Shopping Cart 🛒
            </span>
          </h1>
          <p className="text-gray-600 text-lg">{cartItems.length} {cartItems.length === 1 ? 'item' : 'items'} in your cart</p>
        </div>

        {cartItems.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl shadow-2xl">
            <div className="text-8xl mb-6">🛍️</div>
            <p className="text-2xl text-gray-600 mb-8 font-semibold">Your cart is empty</p>
            <p className="text-gray-500 mb-8">Looks like you haven't added anything to your cart yet!</p>
            <button
              onClick={() => setRoute({ page: 'merch' })}
              className="bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold py-4 px-10 rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all shadow-lg transform hover:scale-105"
            >
              Browse Merchandise →
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-4">
              {cartItems.map(item => (
                <div key={item.id} className="bg-white rounded-2xl shadow-xl p-6 flex items-center gap-6 hover:shadow-2xl transition-all border-2 border-transparent hover:border-purple-200">
                  <img src={item.imageUrl} alt={item.name} className="w-32 h-32 object-cover rounded-xl shadow-lg"/>
                  <div className="flex-grow">
                    <h2 className="font-bold text-2xl text-gray-800 mb-2">{item.name}</h2>
                    <p className="text-purple-600 font-bold text-lg">KES {item.price.toLocaleString()}</p>
                    <p className="text-sm text-gray-500 mt-1">{item.category}</p>
                  </div>
                  <div className="flex flex-col items-center gap-4">
                    <div className="flex items-center gap-3 bg-gray-100 rounded-xl p-2">
                       <button 
                         onClick={() => updateQuantity(item.id, item.quantity - 1)} 
                         className="p-2 rounded-lg bg-white hover:bg-purple-100 transition-colors shadow-sm"
                       >
                          <IconMinus className="w-5 h-5 text-purple-600"/>
                       </button>
                       <span className="w-12 text-center font-bold text-xl">{item.quantity}</span>
                       <button 
                         onClick={() => updateQuantity(item.id, item.quantity + 1)} 
                         className="p-2 rounded-lg bg-white hover:bg-purple-100 transition-colors shadow-sm"
                       >
                          <IconPlus className="w-5 h-5 text-purple-600"/>
                       </button>
                    </div>
                    <p className="font-extrabold text-2xl text-gray-800">KES {(item.price * item.quantity).toLocaleString()}</p>
                  </div>
                  <button 
                    onClick={() => removeFromCart(item.id)} 
                    className="text-gray-400 hover:text-red-500 p-3 hover:bg-red-50 rounded-xl transition-all"
                  >
                     <IconTrash className="w-6 h-6"/>
                  </button>
                </div>
              ))}
            </div>
            <div className="lg:col-span-1">
              <div className="bg-white rounded-3xl shadow-2xl p-8 sticky top-24 border-2 border-purple-100">
                <h2 className="text-3xl font-bold mb-6 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">Order Summary</h2>
                <div className="space-y-4 mb-6">
                    <div className="flex justify-between text-lg">
                        <span className="text-gray-600">Subtotal</span>
                        <span className="font-bold text-gray-800">KES {cartTotal.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-lg">
                        <span className="text-gray-600">Shipping</span>
                        <span className="text-green-600 font-bold flex items-center gap-1">✓ FREE</span>
                    </div>
                    <div className="border-t-2 border-gray-200 pt-4"></div>
                    <div className="flex justify-between text-2xl font-extrabold">
                        <span>Total</span>
                        <span className="text-purple-600">KES {cartTotal.toLocaleString()}</span>
                    </div>
                </div>
                <button 
                  onClick={handleCheckout}
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold py-4 rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all shadow-lg transform hover:scale-105 text-lg"
                >
                  {user ? 'Proceed to Checkout 🚀' : 'Login to Checkout 🔐'}
                </button>
                <p className="text-xs text-gray-500 text-center mt-4">Secure checkout powered by M-Pesa</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CartPage;