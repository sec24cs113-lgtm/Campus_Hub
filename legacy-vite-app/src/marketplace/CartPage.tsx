import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';

const PLACEHOLDER = 'https://images.pexels.com/photos/1907785/pexels-photo-1907785.jpeg?auto=compress&cs=tinysrgb&w=200';

export default function CartPage() {
  const { items, remove, clear, total } = useCart();
  const { user } = useAuth();
  const nav = useNavigate();
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const checkout = async () => {
    if (!user) { nav('/auth', { state: { from: '/cart' } }); return; }
    setErr(null);
    setBusy(true);

    // find a librarian to assign
    const { data: lib } = await supabase
      .from('user_profiles')
      .select('id')
      .eq('librarian_role', true)
      .limit(1)
      .maybeSingle();
    const librarianId = lib?.id ?? null;

    const deadline = new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString();

    const rows = items.map((i) => ({
      buyer_id: user.id,
      seller_id: i.resource.user_id,
      resource_id: i.resource.id,
      amount: i.resource.price,
      order_status: 'AwaitingSellerSubmission',
      escrow_status: 'held',
      payment_status: 'paid',
      submission_deadline: deadline,
      librarian_id: librarianId,
    }));

    const { data: inserted, error } = await supabase
      .from('transactions')
      .insert(rows)
      .select('id, librarian_id');

    if (error) {
      setErr(error.message);
      setBusy(false);
      return;
    }

    // create librarian alerts
    if (inserted && inserted.length) {
      const alerts = inserted
        .filter((t) => t.librarian_id)
        .map((t) => ({
          transaction_id: t.id,
          librarian_id: t.librarian_id,
          type: 'new_exchange' as const,
          message: 'New book purchase confirmed — awaiting seller submission.',
        }));
      if (alerts.length) {
        await supabase.from('librarian_alerts').insert(alerts);
      }
    }

    clear();
    setBusy(false);
    nav('/orders', { replace: true });
  };

  if (items.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <h1 className="section-title">Your cart is empty</h1>
        <p className="muted mt-2">Browse the marketplace and add resources to checkout.</p>
        <Link to="/" className="btn-primary mt-6">Browse marketplace</Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      <h1 className="text-2xl font-display font-extrabold mb-6">Your cart</h1>
      <div className="space-y-3">
        {items.map((i) => (
          <div key={i.resource.id} className="card p-4 flex items-center gap-4">
            <img src={i.resource.image_url || PLACEHOLDER} alt="" className="h-16 w-16 rounded-lg object-cover" />
            <div className="flex-1">
              <div className="font-semibold text-neutral-900">{i.resource.title}</div>
              <div className="muted text-xs">{i.resource.subject}</div>
            </div>
            <div className="font-bold text-primary-700">${Number(i.resource.price).toFixed(2)}</div>
            <button onClick={() => remove(i.resource.id)} className="btn-ghost text-error-600">Remove</button>
          </div>
        ))}
      </div>

      <div className="card mt-6 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="muted text-sm">Total</div>
          <div className="text-2xl font-display font-extrabold text-neutral-900">${total.toFixed(2)}</div>
        </div>
        <div className="flex gap-3">
          <button onClick={clear} className="btn-secondary">Clear</button>
          <button onClick={checkout} disabled={busy} className="btn-primary">
            {busy ? 'Processing…' : 'Confirm purchase'}
          </button>
        </div>
      </div>

      {err && <div className="mt-4 rounded-lg bg-error-50 text-error-600 text-sm px-3 py-2">{err}</div>}

      <p className="muted mt-4 text-xs">
        Payment is held in escrow by the admin. The seller must submit the physical book to the librarian
        before the 5-day deadline.
      </p>
    </div>
  );
}
