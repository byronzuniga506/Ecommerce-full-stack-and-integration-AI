import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { Product } from "../pages/ProductsPage";

export interface CartItem extends Product { quantity: number }

interface CartContextType {
  cart: CartItem[];
  addToCart: (p: Product) => void;
  removeFromCart: (id: number) => void;
  updateQuantity: (id: number, q: number) => void;
  clearCart: () => void;
  totalPrice: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem("cart");
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => localStorage.setItem("cart", JSON.stringify(cart)), [cart]);

  const addToCart = (p: Product) => {
    setCart(prev => {
      const ex = prev.find(i => i.id === p.id);
      return ex
        ? prev.map(i => i.id === p.id ? { ...i, quantity: i.quantity + 1 } : i)
        : [...prev, { ...p, quantity: 1 }];
    });
  };

  const removeFromCart   = (id: number) => setCart(prev => prev.filter(i => i.id !== id));
  const updateQuantity   = (id: number, q: number) =>
    setCart(prev => prev.map(i => i.id === id ? { ...i, quantity: Math.max(q, 1) } : i));
  const clearCart        = () => setCart([]);
  const totalPrice       = cart.reduce((s, i) => s + i.price * i.quantity, 0);

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, updateQuantity, clearCart, totalPrice }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const c = useContext(CartContext);
  if (!c) throw new Error("CartContext missing");
  return c;
};