'use client';

import { useState } from 'react';
import { Heart, ShoppingCart, CheckCircle, Star, Loader2 } from 'lucide-react';
import type { Resource } from '@/lib/types';
import { formatInr } from '@/lib/currency';
import { useCart } from '@/lib/cart-context';

interface ResourceCardProps {
  resource: Resource;
}

export default function ResourceCard({ resource }: ResourceCardProps) {
  const [liked, setLiked] = useState(false);
  const [addedToCart, setAddedToCart] = useState(false);
  const [adding, setAdding] = useState(false);
  const { addToCart } = useCart();

  const handleCart = async () => {
    if (adding) return;
    setAdding(true);
    const { error } = await addToCart(resource);
    setAdding(false);
    if (!error) {
      setAddedToCart(true);
      setTimeout(() => setAddedToCart(false), 1500);
    }
  };

  const badgeColor =
    resource.badge === 'BESTSELLER'
      ? { bg: '#fef3c7', text: '#92400e' }
      : resource.badge === 'TRENDING'
      ? { bg: '#fce7f3', text: '#9d174d' }
      : resource.badge === 'Verified'
      ? { bg: '#d1fae5', text: '#065f46' }
      : { bg: '#e0f2fe', text: '#0369a1' };

  return (
    <div
      className="resource-card bg-white rounded-2xl overflow-hidden cursor-pointer"
      style={{ border: '1px solid #e8edf5' }}
    >
      {/* Image */}
      <div className="relative overflow-hidden" style={{ height: '160px' }}>
        <img
          src={resource.image_url || 'https://images.pexels.com/photos/159711/books-bookstore-book-reading-159711.jpeg?auto=compress&cs=tinysrgb&w=800'}
          alt={resource.title}
          className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
        />
        {resource.badge && (
          <span
            className="absolute top-3 left-3 px-2.5 py-1 rounded-full text-xs font-bold tracking-wide"
            style={{ backgroundColor: badgeColor.bg, color: badgeColor.text }}
          >
            {resource.badge}
          </span>
        )}
        {resource.verified && !resource.badge && (
          <span className="absolute top-3 left-3 flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700">
            <CheckCircle className="w-3 h-3" />
            Verified
          </span>
        )}
        <button
          onClick={() => setLiked(!liked)}
          className="absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center transition-all active:scale-90"
          style={{ backgroundColor: 'rgba(255,255,255,0.92)' }}
        >
          <Heart
            className="w-4 h-4 transition-colors"
            fill={liked ? '#ef4444' : 'none'}
            style={{ color: liked ? '#ef4444' : '#94a3b8' }}
          />
        </button>
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="font-semibold text-sm leading-snug mb-1 line-clamp-2" style={{ color: '#1e293b' }}>
          {resource.title}
        </h3>
        <p className="text-xs mb-3" style={{ color: '#94a3b8' }}>
          {resource.subject} &bull; {resource.author}
        </p>

        <div className="flex items-center justify-between">
          <span className="font-bold text-base" style={{ color: '#3b82f6' }}>
            {formatInr(resource.price)}
          </span>
          <button
            onClick={handleCart}
            disabled={adding}
            className="w-9 h-9 rounded-xl flex items-center justify-center transition-all active:scale-90 disabled:opacity-50"
            style={{
              backgroundColor: addedToCart ? '#10b981' : '#eff6ff',
              color: addedToCart ? '#ffffff' : '#3b82f6',
            }}
          >
            {adding ? <Loader2 className="w-4 h-4 animate-spin" /> : addedToCart ? <CheckCircle className="w-4 h-4" /> : <ShoppingCart className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </div>
  );
}
