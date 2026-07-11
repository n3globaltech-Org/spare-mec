'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { FiSearch } from 'react-icons/fi';
import { trackOrder } from '@/lib/orders';
import { OrderTimeline } from '@/components/OrderTimeline';
import { formatMoney } from '@/lib/money';
import { statusLabel } from '@/lib/orderStatus';

export function TrackClient({ initialOrderNumber = '' }) {
    const [input, setInput] = useState(initialOrderNumber);
    const [submitted, setSubmitted] = useState(initialOrderNumber);

    const { data: order, isLoading, isError, isFetched } = useQuery({
        queryKey: ['track', submitted],
        queryFn: () => trackOrder(submitted),
        enabled: !!submitted,
        retry: 0,
    });

    return (
        <div className="container-x py-10 max-w-2xl mx-auto">
            <h1 className="text-2xl font-display font-bold">Track your order</h1>
            <p className="mt-1 text-neutral-500 text-sm">Enter your Order ID — no account or login needed.</p>

            <form onSubmit={(e) => { e.preventDefault(); setSubmitted(input.trim()); }} className="mt-5 flex gap-2">
                <div className="relative flex-1">
                    <FiSearch className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input value={input} onChange={(e) => setInput(e.target.value)} placeholder="e.g. ORD-000042" className="w-full pl-9 pr-3 py-2.5 rounded-full border border-neutral-300 outline-none focus:border-accent-500" />
                </div>
                <button type="submit" className="btn btn-primary py-2.5">Track</button>
            </form>

            {isLoading && <div className="mt-8 text-center text-neutral-500">Looking up your order…</div>}
            {isError && isFetched && <div className="mt-8 text-center text-neutral-500">We couldn’t find an order with that ID. Please check and try again.</div>}

            {order && (
                <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="card p-5">
                        <div className="flex items-center justify-between">
                            <div className="text-lg font-display font-bold">{order.orderNumber}</div>
                            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-accent-500/10 text-accent-600">{statusLabel(order.status)}</span>
                        </div>
                        <div className="mt-4"><OrderTimeline status={order.status} timeline={order.timeline} /></div>
                    </div>
                    <div className="card p-5">
                        <h2 className="font-display font-bold mb-3">Items</h2>
                        <ul className="space-y-2 text-sm">
                            {(order.items || []).map((i, idx) => (
                                <li key={idx} className="flex justify-between gap-2">
                                    <span className="text-neutral-700">{i.name} <span className="text-neutral-500">×{i.quantity}</span></span>
                                    <span className="tabular-nums text-neutral-600">{i.total != null ? formatMoney(i.total, order.currency) : '—'}</span>
                                </li>
                            ))}
                        </ul>
                        {order.total != null && (
                            <div className="mt-3 pt-3 border-t border-neutral-100 flex justify-between font-semibold">
                                <span>Total</span><span className="tabular-nums">{formatMoney(order.total, order.currency)}</span>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
