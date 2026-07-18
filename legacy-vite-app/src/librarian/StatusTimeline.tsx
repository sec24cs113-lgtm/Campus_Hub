import { ORDER_FLOW, STATUS_LABEL, type OrderStatus } from '../lib/supabase';

export default function StatusTimeline({ current, disputed }: { current: OrderStatus; disputed?: boolean }) {
  const currentIdx = ORDER_FLOW.indexOf(current);
  return (
    <ol className="flex flex-wrap items-center gap-1 text-xs">
      {ORDER_FLOW.map((s, i) => {
        const done = i < currentIdx;
        const active = i === currentIdx && !disputed;
        return (
          <li key={s} className="flex items-center gap-1">
            <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 font-medium ${
              active ? 'bg-primary-600 text-white'
              : done ? 'bg-success-50 text-success-600'
              : 'bg-neutral-100 text-neutral-500'
            }`}>
              <span className={`h-1.5 w-1.5 rounded-full ${active ? 'bg-white' : done ? 'bg-success-500' : 'bg-neutral-400'}`} />
              {STATUS_LABEL[s]}
            </span>
            {i < ORDER_FLOW.length - 1 && <span className="text-neutral-300">›</span>}
          </li>
        );
      })}
      {disputed && (
        <li className="badge bg-error-50 text-error-600 ml-2">Disputed</li>
      )}
    </ol>
  );
}
