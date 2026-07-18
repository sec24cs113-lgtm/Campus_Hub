'use client';

import { X, Trash2, ShoppingBag, Loader2, BookOpen, PlaySquare, FileText } from 'lucide-react';
import { useCart } from '@/lib/cart-context';
import { formatInr } from '@/lib/currency';

export default function CartDrawer() {
  const { items, count, total, isOpen, closeCart, removeFromCart, loading } = useCart();

  if (!isOpen) return null;

  return (
    <>
      <div
        className="fixed inset-0 z-50 transition-opacity"
        style={{ backgroundColor: 'rgba(15, 23, 42, 0.4)' }}
        onClick={closeCart}
      />
      <div
        className="fixed right-0 top-0 bottom-0 z-50 w-full max-w-md flex flex-col shadow-2xl transition-transform"
        style={{ backgroundColor: '#ffffff' }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-6 py-5"
          style={{ borderBottom: '1px solid #e2e8f0' }}
        >
          <div className="flex items-center gap-2.5">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ backgroundColor: '#eff6ff' }}
            >
              <ShoppingBag className="w-5 h-5" style={{ color: '#3b82f6' }} />
            </div>
            <div>
              <h2 className="font-bold text-lg" style={{ color: '#1e293b' }}>
                Your Cart
              </h2>
              <p className="text-xs" style={{ color: '#94a3b8' }}>
                {count} {count === 1 ? 'item' : 'items'}
              </p>
            </div>
          </div>
          <button
            onClick={closeCart}
            className="w-9 h-9 rounded-xl flex items-center justify-center transition-all hover:opacity-70"
            style={{ backgroundColor: '#f1f5f9' }}
          >
            <X className="w-5 h-5" style={{ color: '#475569' }} />
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin" style={{ color: '#3b82f6' }} />
            </div>
          ) : items.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <ShoppingBag className="w-12 h-12 mb-4" style={{ color: '#cbd5e1' }} />
              <p className="font-semibold" style={{ color: '#64748b' }}>
                Your cart is empty
              </p>
              <p className="text-sm mt-1" style={{ color: '#94a3b8' }}>
                Browse the marketplace and add resources you like.
              </p>
              <button
                onClick={closeCart}
                className="mt-5 px-6 py-2.5 rounded-xl text-sm font-semibold transition-all hover:opacity-90"
                style={{ backgroundColor: '#3b82f6', color: '#ffffff' }}
              >
                Browse Resources
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {items.map((item) => {
                const Icon =
                  item.resource.type === 'video'
                    ? PlaySquare
                    : item.resource.type === 'qp'
                    ? FileText
                    : BookOpen;
                const typeColor =
                  item.resource.type === 'video'
                    ? '#3b82f6'
                    : item.resource.type === 'qp'
                    ? '#10b981'
                    : '#8b5cf6';
                return (
                  <div
                    key={item.cart_id}
                    className="flex items-center gap-3 p-3 rounded-xl"
                    style={{ border: '1px solid #e8edf5', backgroundColor: '#fafbfc' }}
                  >
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 overflow-hidden"
                      style={{
                        backgroundColor: item.resource.image_url ? 'transparent' : typeColor,
                      }}
                    >
                      {item.resource.image_url ? (
                        <img
                          src={item.resource.image_url}
                          alt={item.resource.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Icon className="w-6 h-6 text-white" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p
                        className="font-semibold text-sm truncate"
                        style={{ color: '#1e293b' }}
                      >
                        {item.resource.title}
                      </p>
                      <p className="text-xs mt-0.5" style={{ color: '#94a3b8' }}>
                        {item.resource.subject}
                      </p>
                      <p
                        className="font-bold text-sm mt-0.5"
                        style={{ color: '#3b82f6' }}
                      >
                        {formatInr(item.resource.price)}
                      </p>
                    </div>
                    <button
                      onClick={() => removeFromCart(item.cart_id)}
                      className="w-8 h-8 rounded-lg flex items-center justify-center transition-all hover:opacity-70 flex-shrink-0"
                      style={{ backgroundColor: '#fee2e2', color: '#ef4444' }}
                      title="Remove from cart"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="px-6 py-5" style={{ borderTop: '1px solid #e2e8f0' }}>
            <div className="flex items-center justify-between mb-4">
              <span className="font-semibold" style={{ color: '#475569' }}>
                Total
              </span>
              <span className="font-bold text-xl" style={{ color: '#1e293b' }}>
                {formatInr(total)}
              </span>
            </div>
            <button
              className="w-full py-3.5 rounded-xl font-semibold text-sm transition-all hover:opacity-90 active:scale-95"
              style={{ backgroundColor: '#3b82f6', color: '#ffffff' }}
            >
              Checkout
            </button>
          </div>
        )}
      </div>
    </>
  );
}
