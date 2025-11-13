

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
    <div className="bg-gray-100 min-h-full">
      <div className="container mx-auto px-6 py-12">
        <h1 className="text-4xl font-extrabold text-gray-800 mb-8">Your Shopping Cart</h1>

        {cartItems.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-lg shadow-md">
            <p className="text-xl text-gray-500 mb-6">Your cart is empty.</p>
            <button
              onClick={() => setRoute({ page: 'merch' })}
              className="bg-blue-600 text-white font-bold py-3 px-8 rounded-md hover:bg-blue-700 transition duration-300"
            >
              Browse Merchandise
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 bg-white rounded-lg shadow-md p-6 space-y-4">
              {cartItems.map(item => (
                <div key={item.id} className="flex items-center space-x-4 border-b pb-4 last:border-b-0">
                  <img src={item.imageUrl} alt={item.name} className="w-24 h-24 object-cover rounded-md"/>
                  <div className="flex-grow">
                    <h2 className="font-bold text-lg text-gray-800">{item.name}</h2>
                    <p className="text-sm text-gray-500">KES {item.price.toLocaleString()}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                     <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="p-1 rounded-full bg-gray-200 hover:bg-gray-300">
                        <IconMinus className="w-4 h-4"/>
                     </button>
                     <span className="w-10 text-center font-semibold">{item.quantity}</span>
                     <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="p-1 rounded-full bg-gray-200 hover:bg-gray-300">
                        <IconPlus className="w-4 h-4"/>
                     </button>
                  </div>
                  <p className="font-bold w-24 text-right">KES {(item.price * item.quantity).toLocaleString()}</p>
                  <button onClick={() => removeFromCart(item.id)} className="text-gray-400 hover:text-red-500 p-2">
                     <IconTrash className="w-5 h-5"/>
                  </button>
                </div>
              ))}
            </div>
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-md p-6 sticky top-24">
                <h2 className="text-2xl font-bold border-b pb-4 mb-4">Order Summary</h2>
                <div className="space-y-2 mb-4">
                    <div className="flex justify-between">
                        <span>Subtotal</span>
                        <span>KES {cartTotal.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                        <span>Shipping</span>
                        <span className="text-green-600 font-semibold">FREE</span>
                    </div>
                </div>
                <div className="border-t pt-4 flex justify-between font-bold text-xl">
                    <span>Total</span>
                    <span>KES {cartTotal.toLocaleString()}</span>
                </div>
                <button 
                  onClick={handleCheckout}
                  className="w-full mt-6 bg-blue-600 text-white font-bold py-3 rounded-md hover:bg-blue-700 transition duration-300"
                >
                  {user ? 'Proceed to Checkout' : 'Login to Checkout'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CartPage;