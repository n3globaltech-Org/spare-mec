import { FiCheck } from 'react-icons/fi';
import { ORDER_STATUS_LABELS, ORDER_STATUS_FLOW } from '@/lib/orderStatus';

const formatEventDate = (value) => {
    if (!value) return '';
    try {
        return new Intl.DateTimeFormat('en-AE', { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' }).format(new Date(value));
    } catch {
        return '';
    }
};

// The single shared status timeline (same vocabulary as the CRM/admin). Presentational.
export function OrderTimeline({ status, timeline = [] }) {
    const eventByStatus = new Map(timeline.map((event) => [event.status, event]));

    if (status === 'cancelled') {
        const cancelledAt = eventByStatus.get('cancelled')?.at;
        return (
            <div className="rounded-2xl border border-red-100 bg-red-50 p-4">
                <div className="flex items-center gap-2 font-bold text-red-700"><span className="h-2.5 w-2.5 rounded-full bg-red-500" /> Order cancelled</div>
                {cancelledAt && <p className="mt-1 pl-[18px] text-xs text-red-600/70">{formatEventDate(cancelledAt)}</p>}
            </div>
        );
    }

    const currentIndex = ORDER_STATUS_FLOW.indexOf(status);

    return (
        <ol>
            {ORDER_STATUS_FLOW.map((step, index) => {
                const current = step === status;
                const done = index < currentIndex || eventByStatus.has(step);
                const eventDate = formatEventDate(eventByStatus.get(step)?.at);
                return (
                    <li key={step} className="flex items-stretch gap-3">
                        <div className="flex w-6 flex-col items-center">
                            <span className={`grid h-5 w-5 shrink-0 place-items-center rounded-full border-2 ${current ? 'border-accent-500 bg-accent-500 text-neutral-950 ring-4 ring-accent-500/15' : done ? 'border-emerald-500 bg-emerald-500 text-white' : 'border-neutral-200 bg-white text-transparent'}`}>
                                {done && !current && <FiCheck size={11} strokeWidth={3} />}
                                {current && <span className="h-1.5 w-1.5 rounded-full bg-neutral-950" />}
                            </span>
                            {index < ORDER_STATUS_FLOW.length - 1 && <span className={`min-h-7 w-0.5 flex-1 ${index < currentIndex ? 'bg-emerald-300' : 'bg-neutral-200'}`} />}
                        </div>
                        <div className="min-h-12 flex-1 pb-3">
                            <div className="flex items-start justify-between gap-3">
                                <span className={`text-sm ${current ? 'font-extrabold text-neutral-950' : done ? 'font-semibold text-emerald-700' : 'font-medium text-neutral-400'}`}>{ORDER_STATUS_LABELS[step]}</span>
                                {eventDate && <span className="shrink-0 text-[10px] text-neutral-400">{eventDate}</span>}
                            </div>
                            {current && <p className="mt-0.5 text-[11px] text-neutral-500">Your order is currently at this stage.</p>}
                        </div>
                    </li>
                );
            })}
        </ol>
    );
}
