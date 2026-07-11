'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { FaWhatsapp } from 'react-icons/fa';
import { FiCheckCircle } from 'react-icons/fi';
import { trackOrder } from '@/lib/orders';
import { orderWaLink } from '@/lib/whatsapp';
import { formatMoney } from '@/lib/money';
import { statusLabel } from '@/lib/orderStatus';

export function ConfirmationClient({ orderNumber }) {
    const { data: order } = useQuery({
        queryKey: ['order-confirm', orderNumber],
        queryFn: () => trackOrder(orderNumber),
        enabled: !!orderNumber,
        retry: 0,
    });

    const waHref = order
        ? orderWaLink({
            orderNumber,
            items: (order.items || []).map((i) => ({ name: i.name, partNumber: i.partNumber, quantity: i.quantity, unitPrice: i.unitPrice })),
            currency: order.currency,
        })
        : undefined;

    return (
        <div className="container-x py-16 max-w-lg mx-auto text-center">
            <FiCheckCircle className="w-14 h-14 text-emerald-500 mx-auto" />
            <h1 className="mt-4 text-2xl font-display font-bold">Thank you — your order is in!</h1>
            <p className="mt-2 text-neutral-500">Our team will confirm and follow up personally, usually within a few hours.</p>

            {orderNumber && (
                <div className="card p-5 mt-6 text-left">
                    <div className="text-xs uppercase tracking-wide text-neutral-500">Your Order ID</div>
                    <div className="text-2xl font-display font-extrabold text-ink tracking-tight">{orderNumber}</div>
                    {order && (
                        <div className="mt-2 text-sm text-neutral-600">
                            Status: <span className="font-medium text-ink">{statusLabel(order.status)}</span>
                            {order.total != null && <> · Total: <span className="font-medium">{formatMoney(order.total, order.currency)}</span></>}
                        </div>
                    )}
                    <p className="mt-2 text-xs text-neutral-500">Save this Order ID — you can track your order anytime with it, no account needed.</p>
                </div>
            )}

            <div className="mt-6 flex flex-col gap-2.5">
                {orderNumber && <Link href={`/track?order=${encodeURIComponent(orderNumber)}`} className="btn btn-primary w-full py-3">Track my order</Link>}
                {waHref && <a href={waHref} target="_blank" rel="noopener noreferrer" className="btn btn-wa w-full py-3"><FaWhatsapp className="w-5 h-5" /> Continue on WhatsApp</a>}
                <Link href="/catalogue" className="btn btn-outline w-full py-3">Continue shopping</Link>
            </div>
        </div>
    );
}
