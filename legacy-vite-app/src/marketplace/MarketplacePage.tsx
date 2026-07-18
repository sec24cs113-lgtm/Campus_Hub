import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase, type Resource } from '../lib/supabase';
import { useCart } from '../context/CartContext';

const PLACEHOLDER = 'https://images.pexels.com/photos/1907785/pexels-photo-1907785.jpeg?auto=compress&cs=tinysrgb&w=600';

export default function MarketplacePage() {
  const { add, count } = useCart();
  const [items, setItems] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'book' | 'video' | 'qp'>('all');
  const [q, setQ] = useState('');

  useEffect(() => {
    (async () => {
      const { data, error } = await supabase
        .from('resources')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) console.warn(error.message);
      setItems((data as Resource[]) ?? []);
      setLoading(false);
    })();
  }, []);

  const filtered = items.filter((r) => {
    if (filter !== 'all' && r.type !== filter) return false;
    if (q && !(`${r.title} ${r.subject} ${r.author ?? ''}`.toLowerCase().includes(q.toLowerCase()))) return false;
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <div className="flex flex-wrap items-end justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-display font-extrabold text-neutral-900">Campus Marketplace</h1>
          <p className="muted mt-1">Books, past papers, and video resources from students across campus.</p>
        </div>
        <Link to="/cart" className="btn-secondary">
          Cart {count > 0 && <span className="ml-1 badge bg-primary-100 text-primary-700">{count}</span>}
        </Link>
      </div>

      <div className="flex flex-wrap gap-3 mb-6">
        <input className="input max-w-xs" placeholder="Search title, subject, author…" value={q} onChange={(e) => setQ(e.target.value)} />
        <div className="flex rounded-lg bg-neutral-100 p-1">
          {(['all', 'book', 'qp', 'video'] as const).map((f) => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-md text-sm font-medium capitalize transition ${filter === f ? 'bg-white text-primary-700 shadow-card' : 'text-neutral-500'}`}>
              {f === 'qp' ? 'Past Papers' : f}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="card h-72 animate-pulse bg-neutral-100" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="card p-10 text-center muted">No resources match your filters.</div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((r) => (
            <article key={r.id} className="card overflow-hidden group hover:shadow-soft transition">
              <div className="aspect-[4/3] bg-neutral-100 overflow-hidden">
                <img src={r.image_url || PLACEHOLDER} alt={r.title}
                  className="h-full w-full object-cover group-hover:scale-105 transition duration-300" />
              </div>
              <div className="p-4">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <span className="badge bg-primary-50 text-primary-700 capitalize">{r.type === 'qp' ? 'Past Paper' : r.type}</span>
                  {r.badge && <span className="badge bg-accent-100 text-accent-700">{r.badge}</span>}
                </div>
                <h3 className="font-semibold text-neutral-900 leading-snug">{r.title}</h3>
                <div className="muted text-xs mt-1">{r.subject}{r.author ? ` · ${r.author}` : ''}</div>
                <div className="flex items-center justify-between mt-4">
                  <div className="text-lg font-bold text-primary-700">${Number(r.price).toFixed(2)}</div>
                  <button onClick={() => add(r)} className="btn-primary">Add to cart</button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
