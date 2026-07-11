import { ORDER_STATUS_LABELS, ORDER_STATUS_FLOW } from '@/lib/orderStatus';

// The single shared status timeline (same vocabulary as the CRM/admin). Presentational.
export function OrderTimeline({ status, timeline = [] }) {
    if (status === 'cancelled') {
        return (
            <div className="flex items-center gap-2 text-red-600 font-medium">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500" /> Order cancelled
            </div>
        );
    }
    const reached = new Set([...timeline.map((t) => t.status), status]);
    return (
        <ol className="space-y-0">
            {ORDER_STATUS_FLOW.map((s, idx) => {
                const done = reached.has(s);
                const current = s === status;
                return (
                    <li key={s} className="flex items-start gap-3">
                        <div className="flex flex-col items-center">
                            <span className={`w-3 h-3 rounded-full ${current ? 'bg-accent-500 ring-4 ring-accent-500/20' : done ? 'bg-emerald-500' : 'bg-neutral-300'}`} />
                            {idx < ORDER_STATUS_FLOW.length - 1 && <span className={`w-px h-8 ${done ? 'bg-emerald-300' : 'bg-neutral-200'}`} />}
                        </div>
                        <span className={`text-sm pt-0.5 ${current ? 'font-semibold text-ink' : done ? 'text-emerald-700' : 'text-neutral-500'}`}>
                            {ORDER_STATUS_LABELS[s]}
                        </span>
                    </li>
                );
            })}
        </ol>
    );
}
