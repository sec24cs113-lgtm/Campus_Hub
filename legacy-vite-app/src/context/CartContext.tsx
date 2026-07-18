import { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import type { Resource } from '../lib/supabase';

interface CartItem { resource: Resource; }
interface CartState {
  items: CartItem[];
  add: (r: Resource) => void;
  remove: (id: string) => void;
  clear: () => void;
  total: number;
  count: number;
}

const CartContext = createContext<CartState | undefined>(undefined);

const KEY = 'campushub_cart';

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(() => {
    try { return JSON.parse(localStorage.getItem(KEY) ?? '[]'); } catch { return []; }
  });

  const persist = (next: CartItem[]) => {
    setItems(next);
    localStorage.setItem(KEY, JSON.stringify(next));
  };

  const add = useCallback((r: Resource) => {
    setItems((prev) => {
      if (prev.some((i) => i.resource.id === r.id)) return prev;
      const next = [...prev, { resource: r }];
      localStorage.setItem(KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const remove = useCallback((id: string) => {
    setItems((prev) => {
      const next = prev.filter((i) => i.resource.id !== id);
      localStorage.setItem(KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const clear = useCallback(() => persist([]), []);

  const total = items.reduce((s, i) => s + Number(i.resource.price ?? 0), 0);
  const count = items.length;

  return (
    <CartContext.Provider value={{ items, add, remove, clear, total, count }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}
