

import React, { createContext, useState, useContext, ReactNode, useMemo } from 'react';
import { CartItem, MerchandiseItem, Order } from '../types';
import { MOCK_ORDERS } from '../constants';
import { useAuth } from './AuthContext';
import { NotificationContext } from './NotificationContext';

interface CartContextType {
  cartItems: CartItem[];
  orders: Order[];
  addToCart: (item: MerchandiseItem) => void;
  removeFromCart: (itemId: number) => void;
  updateQuantity: (itemId: number, newQuantity: number) => void;
  checkout: () => void;
  clearCart: () => void;
  itemCount: number;
  cartTotal: number;
}

export const CartContext = createContext<CartContextType>({} as CartContextType);

export const useCart = () => useContext(CartContext);

interface CartProviderProps {
  children: ReactNode;
}

export const CartProvider: React.FC<CartProviderProps> = ({ children }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [orders, setOrders] = useState<Order[]>(MOCK_ORDERS);
  const { user } = useAuth();
  const { addNotification } = useContext(NotificationContext);

  const itemCount = useMemo(() => {
    return cartItems.reduce((sum, item) => sum + item.quantity, 0);
  }, [cartItems]);

  const cartTotal = useMemo(() => {
    return cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  }, [cartItems]);

  const addToCart = (itemToAdd: MerchandiseItem) => {
    setCartItems(prevItems => {
      const existingItem = prevItems.find(item => item.id === itemToAdd.id);
      if (existingItem) {
        return prevItems.map(item =>
          item.id === itemToAdd.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prevItems, { ...itemToAdd, quantity: 1 }];
    });
    addNotification(`${itemToAdd.name} added to cart.`);
  };

  const removeFromCart = (itemId: number) => {
    setCartItems(prevItems => prevItems.filter(item => item.id !== itemId));
  };

  const updateQuantity = (itemId: number, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeFromCart(itemId);
    } else {
      setCartItems(prevItems =>
        prevItems.map(item =>
          item.id === itemId ? { ...item, quantity: newQuantity } : item
        )
      );
    }
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const checkout = () => {
    if (!user) {
      addNotification('You must be logged in to place an order.');
      // In a real app, you might redirect to login here.
      return;
    }
    if (cartItems.length === 0) {
      addNotification('Your cart is empty.');
      return;
    }

    const newOrder: Order = {
      id: `${user.id}-${new Date().getTime()}`,
      userId: user.id,
      items: cartItems,
      totalAmount: cartTotal,
      orderDate: new Date().toISOString(),
      status: 'Processing',
    };

    setOrders(prevOrders => [newOrder, ...prevOrders]);
    clearCart();
    addNotification('Your order has been placed successfully!');
  };

  const value = {
    cartItems,
    orders,
    addToCart,
    removeFromCart,
    updateQuantity,
    checkout,
    clearCart,
    itemCount,
    cartTotal,
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};