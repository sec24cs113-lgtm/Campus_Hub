'use client';

import { useState } from 'react';
import { Search, Bell, CreditCard, ShoppingCart } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { useCart } from '@/lib/cart-context';
import { formatInr } from '@/lib/currency';

export default function TopBar() {
  const [query, setQuery] = useState('');
  const { profile } = useAuth();
  const { count, openCart } = useCart();

  return (
    <div
      className="sticky top-0 z-20 flex items-center gap-4 px-8 py-4"
      style={{ backgroundColor: '#f0f3fb', borderBottom: '1px solid #e2e8f0' }}
    >
      {/* Search */}
      <div className="flex-1 max-w-xl relative">
        <Search
          className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4"
          style={{ color: '#94a3b8' }}
        />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search resources, authors, or subjects..."
          className="w-full pl-11 pr-4 py-2.5 rounded-xl text-sm outline-none transition-all"
          style={{
            backgroundColor: '#ffffff',
            border: '1.5px solid #e2e8f0',
            color: '#1e293b',
          }}
          onFocus={(e) => (e.currentTarget.style.border = '1.5px solid #3b82f6')}
          onBlur={(e) => (e.currentTarget.style.border = '1.5px solid #e2e8f0')}
        />
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-3 ml-auto">
        {/* Wallet */}
        <button
          className="flex items-center gap-2 px-4 py-2 rounded-xl font-semibold text-sm transition-all hover:opacity-90 active:scale-95"
          style={{ backgroundColor: '#1e3a8a', color: '#ffffff' }}
        >
          <CreditCard className="w-4 h-4" />
          <span>{formatInr(profile?.wallet_balance ?? 0)}</span>
        </button>

        {/* Cart */}
        <button
          onClick={openCart}
          className="relative w-10 h-10 rounded-xl flex items-center justify-center transition-all hover:opacity-80"
          style={{ backgroundColor: '#ffffff', border: '1.5px solid #e2e8f0' }}
        >
          <ShoppingCart className="w-5 h-5" style={{ color: '#475569' }} />
          {count > 0 && (
            <span
              className="absolute -top-1 -right-1 w-4 h-4 rounded-full text-white text-xs flex items-center justify-center font-bold"
              style={{ backgroundColor: '#ef4444', fontSize: '10px' }}
            >
              {count}
            </span>
          )}
        </button>

        {/* Notification */}
        <button
          className="relative w-10 h-10 rounded-xl flex items-center justify-center transition-all hover:opacity-80"
          style={{ backgroundColor: '#ffffff', border: '1.5px solid #e2e8f0' }}
        >
          <Bell className="w-5 h-5" style={{ color: '#475569' }} />
          <span
            className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full"
            style={{ backgroundColor: '#ef4444' }}
          />
        </button>
      </div>
    </div>
  );
}
