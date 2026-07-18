'use client';

import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { createClient } from '@supabase/supabase-js';
import { useAuth } from './auth-context';
import type { Resource } from './types';

const rawClient = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export interface CartItem {
  cart_id: string;
  resource: Resource;
}

interface CartContextType {
  items: CartItem[];
  count: number;
  total: number;
  loading: boolean;
  isOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  addToCart: (resource: Resource) => Promise<{ error: string | null; duplicate: boolean }>;
  removeFromCart: (cartId: string) => Promise<void>;
  clearCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType>({
  items: [],
  count: 0,
  total: 0,
  loading: true,
  isOpen: false,
  openCart: () => {},
  closeCart: () => {},
  addToCart: async () => ({ error: null, duplicate: false }),
  removeFromCart: async () => {},
  clearCart: async () => {},
});

export function CartProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);

  const fetchCart = useCallback(async () => {
    if (!user) {
      setItems([]);
      setLoading(false);
      return;
    }
    const { data, error } = await rawClient
      .from('cart_items')
      .select('id, resource_id, resources!inner(*)')
      .eq('session_id', user.id);
    if (error || !data) {
      setItems([]);
      setLoading(false);
      return;
    }
    const cartItems: CartItem[] = data.map((row: any) => ({
      cart_id: row.id,
      resource: row.resources as Resource,
    }));
    setItems(cartItems);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const addToCart = useCallback(
    async (resource: Resource) => {
      if (!user) return { error: 'Please sign in to add items to cart.', duplicate: false };
      const { data: existing } = await rawClient
        .from('cart_items')
        .select('id')
        .eq('resource_id', resource.id)
        .eq('session_id', user.id)
        .maybeSingle();
      if (existing) {
        setIsOpen(true);
        return { error: null, duplicate: true };
      }
      const { error } = await rawClient
        .from('cart_items')
        .insert({ resource_id: resource.id, session_id: user.id });
      if (error) return { error: error.message, duplicate: false };
      await fetchCart();
      setIsOpen(true);
      return { error: null, duplicate: false };
    },
    [user, fetchCart]
  );

  const removeFromCart = useCallback(
    async (cartId: string) => {
      const { error } = await rawClient.from('cart_items').delete().eq('id', cartId);
      if (!error) {
        setItems((prev) => prev.filter((i) => i.cart_id !== cartId));
      }
    },
    []
  );

  const clearCart = useCallback(async () => {
    if (!user) return;
    const { error } = await rawClient.from('cart_items').delete().eq('session_id', user.id);
    if (!error) setItems([]);
  }, [user]);

  const total = items.reduce((sum, i) => sum + (i.resource.price || 0), 0);

  return (
    <CartContext.Provider
      value={{
        items,
        count: items.length,
        total,
        loading,
        isOpen,
        openCart: () => setIsOpen(true),
        closeCart: () => setIsOpen(false),
        addToCart,
        removeFromCart,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}
