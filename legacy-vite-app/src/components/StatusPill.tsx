import { STATUS_LABEL, STATUS_PILL, type OrderStatus } from '../lib/supabase';

export default function StatusPill({ status }: { status: OrderStatus }) {
  return (
    <span className={`badge ${STATUS_PILL[status]}`}>
      <span className="h-1.5 w-1.5 rounded-full bg-current opacity-70" />
      {STATUS_LABEL[status]}
    </span>
  );
}
