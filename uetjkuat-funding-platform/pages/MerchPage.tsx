

import React from 'react';
import { MOCK_MERCHANDISE } from '../constants';
import { useCart } from '../contexts/CartContext';
import { MerchandiseItem, Route } from '../types';
import { IconShoppingCart } from '../components/icons';

interface MerchPageProps {
  setRoute: (route: Route) => void;
}

const MerchCard: React.FC<{ item: MerchandiseItem, onAddToCart: (item: MerchandiseItem) => void }> = ({ item, onAddToCart }) => (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden transform hover:-translate-y-1 transition-transform duration-300 flex flex-col group">
        <div className="relative">
            <img src={item.imageUrl} alt={item.name} className="w-full h-64 object-cover" />
            <div className="absolute top-2 right-2 bg-blue-600 text-white text-sm font-bold px-3 py-1 rounded-full">
                KES {item.price.toLocaleString()}
            </div>
        </div>
        <div className="p-6 flex-grow flex flex-col">
            <h3 className="text-xl font-bold text-gray-800 mb-2">{item.name}</h3>
            <p className="text-gray-600 text-sm mb-4 flex-grow">{item.description}</p>
            <button 
                onClick={() => onAddToCart(item)}
                className="w-full mt-4 bg-blue-600 text-white font-semibold py-2 rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
            >
                <IconShoppingCart className="w-5 h-5"/>
                Add to Cart
            </button>
        </div>
    </div>
);

const MerchPage: React.FC<MerchPageProps> = ({ setRoute }) => {
  const { addToCart } = useCart();

  return (
    <div className="bg-gray-50">
      <div className="container mx-auto px-6 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-extrabold text-gray-800">Merchandise</h1>
          <p className="text-lg text-gray-600 mt-2">Support the ministry and show your pride with our official gear.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {MOCK_MERCHANDISE.map(item => (
                <MerchCard key={item.id} item={item} onAddToCart={addToCart} />
            ))}
        </div>
      </div>
    </div>
  );
};

export default MerchPage;