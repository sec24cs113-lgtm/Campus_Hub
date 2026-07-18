import { useCallback, useEffect, useMemo, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  fetchLibrarianTransactions, fetchAlerts, markAlertRead, markAllAlertsRead,
  updateOrderStatus, reportDispute, extendPickup, nextStatus, isOverdue, daysUntil,
  statusIndex, type LibRow,
} from './librarianApi';
import StatusTimeline from './StatusTimeline';
import StatusPill from '../components/StatusPill';
import { STATUS_LABEL, type OrderStatus } from '../lib/supabase';

type Tab = 'pending' | 'received' | 'pickup' | 'completed' | 'alerts';

const TABS: { id: Tab; label: string }[] = [
  { id: 'pending', label: 'Pending Deliveries' },
  { id: 'received', label: 'Received Books' },
  { id: 'pickup', label: 'Ready for Pickup' },
  { id: 'completed', label: 'Completed' },
  { id: 'alerts', label: 'Notifications' },
];

export default function LibrarianDashboard() {
  const { user } = useAuth();
  const [tab, setTab] = useState<Tab>('pending');
  const [rows, setRows] = useState<LibRow[]>([]);
  const [alerts, setAlerts] = useState<LibrarianAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionMsg, setActionMsg] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      const [t, a] = await Promise.all([
        fetchLibrarianTransactions(user.id),
        fetchAlerts(user.id),
      ]);
      setRows(t);
      setAlerts(a);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => { load(); }, [load]);

  const unread = alerts.filter((a) => !a.read).length;

  const counts = useMemo(() => ({
    pending: rows.filter((r) => r.order_status === 'AwaitingSellerSubmission').length,
    received: rows.filter((r) => r.order_status === 'ReceivedByLibrarian').length,
    pickup: rows.filter((r) => r.order_status === 'ReadyForBuyerPickup').length,
    completed: rows.filter((r) => r.order_status === 'Completed' || r.order_status === 'DeliveredToBuyer').length,
  }), [rows]);

  const visible = useMemo(() => {
    switch (tab) {
      case 'pending': return rows.filter((r) => r.order_status === 'AwaitingSellerSubmission' || r.order_status === 'Purchased');
      case 'received': return rows.filter((r) => r.order_status === 'ReceivedByLibrarian');
      case 'pickup': return rows.filter((r) => r.order_status === 'ReadyForBuyerPickup');
      case 'completed': return rows.filter((r) => r.order_status === 'Completed' || r.order_status === 'DeliveredToBuyer');
      default: return [];
    }
  }, [tab, rows]);

  const advance = async (row: LibRow) => {
    const next = nextStatus(row.order_status);
    if (!next) return;
    const pickupDeadline = next === 'ReadyForBuyerPickup'
      ? new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
      : undefined;
    try {
      await updateOrderStatus(row.id, next, {
        pickupDeadline: pickupDeadline ?? undefined,
      });
      setActionMsg(`Status updated to "${STATUS_LABEL[next]}".`);
      await load();
    } catch (e: any) {
      setError(e.message);
    }
  };

  const dispute = async (row: LibRow, reason: string) => {
    try {
      await reportDispute(row.id, reason);
      setActionMsg('Dispute reported to admin.');
      await load();
    } catch (e: any) { setError(e.message); }
  };

  const extendPickupDays = async (row: LibRow, days: number) => {
    try {
      await extendPickup(row.id, days);
      setActionMsg(`Pickup window extended by ${days} day(s).`);
      await load();
    } catch (e: any) { setError(e.message); }
  };

  const onMarkAlert = async (id: string) => {
    await markAlertRead(id);
    setAlerts((prev) => prev.map((a) => (a.id === id ? { ...a, read: true } : a)));
  };

  const onMarkAll = async () => {
    if (!user) return;
    await markAllAlertsRead(user.id);
    setAlerts((prev) => prev.map((a) => ({ ...a, read: true })));
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <div className="flex flex-wrap items-end justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-display font-extrabold text-neutral-900">Librarian Dashboard</h1>
          <p className="muted mt-1">Coordinate physical book exchanges between buyers and sellers.</p>
        </div>
        <button onClick={load} className="btn-secondary">Refresh</button>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard label="Pending deliveries" value={counts.pending} tone="warning" />
        <StatCard label="Received by librarian" value={counts.received} tone="accent" />
        <StatCard label="Ready for pickup" value={counts.pickup} tone="primary" />
        <StatCard label="Completed" value={counts.completed} tone="success" />
      </div>

      {error && <div className="rounded-lg bg-error-50 text-error-600 text-sm px-3 py-2 mb-4">{error}</div>}
      {actionMsg && <div className="rounded-lg bg-success-50 text-success-600 text-sm px-3 py-2 mb-4">{actionMsg}</div>}

      {/* Tabs */}
      <div className="flex flex-wrap gap-1 border-b border-neutral-200 mb-6">
        {TABS.map((t) => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`relative px-4 py-2.5 text-sm font-semibold border-b-2 -mb-px transition ${
              tab === t.id ? 'border-primary-600 text-primary-700' : 'border-transparent text-neutral-500 hover:text-neutral-800'
            }`}>
            {t.label}
            {t.id === 'alerts' && unread > 0 && (
              <span className="ml-1.5 badge bg-error-500 text-white">{unread}</span>
            )}
            {t.id !== 'alerts' && counts[t.id as keyof typeof counts] > 0 && (
              <span className="ml-1.5 badge bg-neutral-100 text-neutral-600">{counts[t.id as keyof typeof counts]}</span>
            )}
          </button>
        ))}
      </div>

      {tab === 'alerts' ? (
        <AlertsPanel alerts={alerts} onMark={onMarkAlert} onMarkAll={onMarkAll} />
      ) : loading ? (
        <div className="card p-10 text-center muted">Loading transactions…</div>
      ) : visible.length === 0 ? (
        <div className="card p-10 text-center muted">No transactions in this stage right now.</div>
      ) : (
        <div className="space-y-4">
          {visible.map((row) => (
            <TransactionCard
              key={row.id}
              row={row}
              onAdvance={advance}
              onDispute={dispute}
              onExtend={extendPickupDays}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value, tone }: { label: string; value: number; tone: 'warning' | 'accent' | 'primary' | 'success' }) {
  const toneClass = {
    warning: 'bg-warning-50 text-warning-600',
    accent: 'bg-accent-100 text-accent-700',
    primary: 'bg-primary-50 text-primary-700',
    success: 'bg-success-50 text-success-600',
  }[tone];
  return (
    <div className="card p-4">
      <div className={`inline-flex h-9 w-9 items-center justify-center rounded-lg ${toneClass}`}>
        <span className="font-bold">{value}</span>
      </div>
      <div className="mt-3 text-sm font-semibold text-neutral-800">{label}</div>
      <div className="muted text-xs">{value} transaction{value === 1 ? '' : 's'}</div>
    </div>
  );
}

import type { LibrarianAlert } from '../lib/supabase';

function AlertsPanel({ alerts, onMark, onMarkAll }: {
  alerts: LibrarianAlert[];
  onMark: (id: string) => void;
  onMarkAll: () => void;
}) {
  if (alerts.length === 0) {
    return <div className="card p-10 text-center muted">No notifications yet.</div>;
  }
  return (
    <div>
      <div className="flex justify-end mb-3">
        <button onClick={onMarkAll} className="btn-ghost text-sm">Mark all read</button>
      </div>
      <div className="space-y-2">
        {alerts.map((a) => (
          <div key={a.id} className={`card p-4 flex items-start gap-3 ${a.read ? 'opacity-70' : ''}`}>
            <span className={`mt-1 h-2 w-2 rounded-full ${a.read ? 'bg-neutral-300' : 'bg-primary-500'}`} />
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="badge bg-primary-50 text-primary-700 capitalize">{a.type.replace(/_/g, ' ')}</span>
                <span className="muted text-xs">{new Date(a.created_at).toLocaleString()}</span>
              </div>
              <p className="text-sm text-neutral-800 mt-1">{a.message}</p>
            </div>
            {!a.read && <button onClick={() => onMark(a.id)} className="btn-ghost text-xs">Mark read</button>}
          </div>
        ))}
      </div>
    </div>
  );
}

function TransactionCard({ row, onAdvance, onDispute, onExtend }: {
  row: LibRow;
  onAdvance: (row: LibRow) => void;
  onDispute: (row: LibRow, reason: string) => void;
  onExtend: (row: LibRow, days: number) => void;
}) {
  const [showDispute, setShowDispute] = useState(false);
  const [reason, setReason] = useState('');
  const next = nextStatus(row.order_status);
  const submitOverdue = row.order_status === 'AwaitingSellerSubmission' && isOverdue(row.submission_deadline);
  const pickupOverdue = row.order_status === 'ReadyForBuyerPickup' && isOverdue(row.pickup_deadline);
  const submitDays = daysUntil(row.submission_deadline);
  const pickupDays = daysUntil(row.pickup_deadline);

  return (
    <article className="card p-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex-1 min-w-[240px]">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-display font-bold text-lg text-neutral-900">{row.resource?.title ?? 'Resource'}</h3>
            <StatusPill status={row.order_status} />
            {row.refund_initiated && <span className="badge bg-error-50 text-error-600">Refund initiated</span>}
            {row.penalty_applied && <span className="badge bg-warning-50 text-warning-600">Seller penalized</span>}
          </div>
          <div className="grid sm:grid-cols-2 gap-x-6 gap-y-1 mt-3 text-sm">
            <Info label="Seller" value={row.seller?.full_name ?? '—'} />
            <Info label="Buyer" value={row.buyer?.full_name ?? '—'} />
            <Info label="Subject" value={row.resource?.subject ?? '—'} />
            <Info label="Amount" value={`$${Number(row.amount).toFixed(2)}`} />
            <Info label="Submission deadline" value={row.submission_deadline ? new Date(row.submission_deadline).toLocaleString() : '—'} />
            <Info label="Pickup deadline" value={row.pickup_deadline ? new Date(row.pickup_deadline).toLocaleString() : '—'} />
          </div>
          {row.librarian_notes && (
            <div className="mt-3 rounded-lg bg-neutral-50 border border-neutral-200 px-3 py-2 text-sm text-neutral-700">
              <span className="font-semibold">Librarian notes: </span>{row.librarian_notes}
            </div>
          )}
        </div>

        <div className="flex flex-col gap-2 items-stretch min-w-[180px]">
          {next && (
            <button onClick={() => onAdvance(row)} className="btn-primary">
              Mark as "{STATUS_LABEL[next]}"
            </button>
          )}
          {row.order_status === 'ReadyForBuyerPickup' && (
            <>
              <button onClick={() => onExtend(row, 3)} className="btn-secondary text-xs">Extend pickup +3 days</button>
              <button onClick={() => onExtend(row, 7)} className="btn-secondary text-xs">Extend pickup +7 days</button>
            </>
          )}
          <button onClick={() => setShowDispute((v) => !v)} className="btn-ghost text-error-600 text-sm">
            Report issue to admin
          </button>
        </div>
      </div>

      {showDispute && (
        <div className="mt-4 rounded-lg bg-error-50 border border-error-500/20 p-3">
          <textarea className="input" rows={2} placeholder="Describe the issue (damaged book, wrong item, etc.)"
            value={reason} onChange={(e) => setReason(e.target.value)} />
          <div className="flex gap-2 mt-2">
            <button onClick={() => { if (reason.trim()) { onDispute(row, reason.trim()); setShowDispute(false); setReason(''); } }}
              className="btn-danger text-sm">Submit dispute</button>
            <button onClick={() => setShowDispute(false)} className="btn-ghost text-sm">Cancel</button>
          </div>
        </div>
      )}

      <div className="mt-4 pt-4 border-t border-neutral-100">
        <StatusTimeline current={row.order_status} disputed={row.order_status === 'Disputed'} />
      </div>

      {/* Deadline warnings */}
      {submitOverdue && (
        <div className="mt-3 rounded-lg bg-error-50 text-error-600 text-sm px-3 py-2">
          Seller has missed the submission deadline. Initiate buyer refund and apply seller penalty from the Admin panel.
        </div>
      )}
      {!submitOverdue && submitDays !== null && submitDays <= 2 && submitDays >= 0 && row.order_status === 'AwaitingSellerSubmission' && (
        <div className="mt-3 rounded-lg bg-warning-50 text-warning-600 text-sm px-3 py-2">
          Submission deadline in {submitDays} day(s).
        </div>
      )}
      {pickupOverdue && (
        <div className="mt-3 rounded-lg bg-warning-50 text-warning-600 text-sm px-3 py-2">
          Buyer pickup is overdue. Extend the pickup window or escalate to admin.
        </div>
      )}
      {!pickupOverdue && pickupDays !== null && pickupDays <= 2 && pickupDays >= 0 && row.order_status === 'ReadyForBuyerPickup' && (
        <div className="mt-3 rounded-lg bg-warning-50 text-warning-600 text-sm px-3 py-2">
          Pickup deadline in {pickupDays} day(s).
        </div>
      )}
    </article>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <span className="text-neutral-500">{label}: </span>
      <span className="font-medium text-neutral-800">{value}</span>
    </div>
  );
}
