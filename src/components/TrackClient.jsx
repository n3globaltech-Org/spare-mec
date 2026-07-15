'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { FaWhatsapp } from 'react-icons/fa';
import { FiAlertCircle, FiCheckCircle, FiClock, FiMapPin, FiPackage, FiRefreshCw, FiSearch, FiShield } from 'react-icons/fi';
import { trackOrder } from '@/lib/orders';
import { OrderTimeline } from '@/components/OrderTimeline';
import { formatMoney } from '@/lib/money';
import { statusLabel } from '@/lib/orderStatus';
import { genericWaLink } from '@/lib/whatsapp';

const formatDate = (value) => {
    if (!value) return '';
    try {
        return new Intl.DateTimeFormat('en-AE', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value));
    } catch {
        return '';
    }
};

export function TrackClient({ initialOrderNumber = '' }) {
    const router = useRouter();
    const initial = String(initialOrderNumber || '').trim().toUpperCase();
    const [input, setInput] = useState(initial);
    const [submitted, setSubmitted] = useState(initial);
    const [validationError, setValidationError] = useState('');

    const { data: order, error, isError, isFetching, refetch } = useQuery({
        queryKey: ['track', submitted],
        queryFn: () => trackOrder(submitted),
        enabled: !!submitted,
        retry: 0,
    });

    const submitLookup = (event) => {
        event.preventDefault();
        const value = input.trim().toUpperCase();
        if (!value) {
            setValidationError('Enter the Order ID from your confirmation screen or WhatsApp message.');
            return;
        }
        setValidationError('');
        setInput(value);
        setSubmitted(value);
        router.replace(`/track?order=${encodeURIComponent(value)}`, { scroll: false });
    };

    const notFound = isError && error?.response?.status === 404;
    const hasPricedItems = order?.items?.some((item) => item.unitPrice != null);
    const hasOnRequestItems = order?.items?.some((item) => item.unitPrice == null);
    const deliveryLabel = order?.delivery
        ? [order.delivery.city, order.delivery.state, order.delivery.country].filter(Boolean).join(', ')
        : '';

    return (
        <main className="bg-white pb-16 pt-6 md:pb-24 md:pt-10">
            <div className="container-x max-w-6xl">
                <section className="relative overflow-hidden rounded-[28px] bg-neutral-950 px-5 py-8 text-white sm:px-8 md:px-12 md:py-12">
                    <div className="pointer-events-none absolute inset-0 bg-grid-light bg-[size:24px_24px] opacity-[0.04]" />
                    <div className="pointer-events-none absolute -right-20 -top-24 h-72 w-72 rounded-full bg-accent-500/15 blur-3xl" />

                    <div className="relative z-10 mx-auto max-w-3xl text-center">
                        <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-accent-500 text-neutral-950 shadow-lg shadow-accent-500/10">
                            <FiPackage size={22} />
                        </div>
                        <div className="mt-4 inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-neutral-300">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" /> Live order updates
                        </div>
                        <h1 className="mt-3 font-display text-3xl font-black tracking-tight sm:text-4xl md:text-5xl">Track your order</h1>
                        <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-neutral-400 md:text-base">
                            Enter your Order ID to see the latest progress, ordered parts, and delivery stage. No account or login is required.
                        </p>

                        <form onSubmit={submitLookup} className="mx-auto mt-7 max-w-2xl rounded-2xl border border-white/10 bg-white p-2 shadow-2xl shadow-black/20">
                            <div className="flex flex-col gap-2 sm:flex-row">
                                <div className="relative min-w-0 flex-1">
                                    <FiSearch className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
                                    <input
                                        value={input}
                                        onChange={(event) => { setInput(event.target.value); if (validationError) setValidationError(''); }}
                                        placeholder="ORD-000001-AB12CD34"
                                        aria-label="Order ID"
                                        autoCapitalize="characters"
                                        autoComplete="off"
                                        className="h-12 w-full rounded-xl bg-neutral-50 pl-10 pr-3 font-mono text-sm font-semibold uppercase tracking-wide text-neutral-950 outline-none ring-1 ring-transparent transition focus:bg-white focus:ring-neutral-300"
                                    />
                                </div>
                                <button type="submit" disabled={isFetching || !input.trim()} className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-neutral-950 px-6 text-sm font-extrabold text-white transition hover:bg-neutral-800 disabled:cursor-wait disabled:opacity-60 sm:min-w-[130px]">
                                    {isFetching ? <><FiRefreshCw className="animate-spin" /> Checking</> : <>Track order <FiSearch /></>}
                                </button>
                            </div>
                        </form>
                        {validationError && <p role="alert" className="mt-2 text-xs font-medium text-red-300">{validationError}</p>}
                        <p className="mt-3 flex items-center justify-center gap-1.5 text-[11px] text-neutral-500"><FiShield size={12} /> Your tracking view never exposes contact or street-address details.</p>
                    </div>
                </section>

                {isFetching && (
                    <section className="mx-auto mt-8 max-w-4xl" aria-live="polite">
                        <div className="animate-pulse rounded-[24px] border border-neutral-200 bg-neutral-50 p-6">
                            <div className="h-4 w-28 rounded bg-neutral-200" />
                            <div className="mt-3 h-7 w-56 rounded bg-neutral-200" />
                            <div className="mt-6 grid gap-4 md:grid-cols-2">
                                <div className="h-48 rounded-2xl bg-neutral-200/70" />
                                <div className="h-48 rounded-2xl bg-neutral-200/70" />
                            </div>
                        </div>
                        <p className="mt-3 text-center text-sm font-medium text-neutral-500">Looking up the latest order status…</p>
                    </section>
                )}

                {!isFetching && notFound && (
                    <section className="mx-auto mt-8 max-w-xl rounded-[24px] border border-neutral-200 bg-neutral-50 px-6 py-10 text-center">
                        <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-white text-neutral-500 shadow-sm"><FiSearch size={21} /></div>
                        <h2 className="mt-4 font-display text-xl font-bold text-neutral-950">Order not found</h2>
                        <p className="mt-2 text-sm leading-relaxed text-neutral-500">We couldn&apos;t find <span className="font-mono font-semibold text-neutral-700">{submitted}</span>. Check every letter and number, then try again.</p>
                        <button onClick={() => { setInput(''); setSubmitted(''); router.replace('/track', { scroll: false }); }} className="btn btn-primary mt-5 px-5 py-2.5">Enter another Order ID</button>
                    </section>
                )}

                {!isFetching && isError && !notFound && (
                    <section className="mx-auto mt-8 max-w-xl rounded-[24px] border border-red-100 bg-red-50/70 px-6 py-10 text-center">
                        <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-white text-red-500 shadow-sm"><FiAlertCircle size={22} /></div>
                        <h2 className="mt-4 font-display text-xl font-bold text-neutral-950">Tracking is temporarily unavailable</h2>
                        <p className="mt-2 text-sm text-neutral-600">Your order is safe. Please try the lookup again, or contact our team if you need an immediate update.</p>
                        <div className="mt-5 flex flex-col justify-center gap-2 sm:flex-row">
                            <button onClick={() => refetch()} className="btn btn-primary px-5 py-2.5"><FiRefreshCw /> Try again</button>
                            <a href={genericWaLink()} target="_blank" rel="noopener noreferrer" className="btn btn-wa px-5 py-2.5"><FaWhatsapp /> Ask on WhatsApp</a>
                        </div>
                    </section>
                )}

                {!isFetching && order && (
                    <section className="mt-8 md:mt-10">
                        <div className="overflow-hidden rounded-[24px] border border-neutral-200 bg-white shadow-[0_18px_45px_-30px_rgba(0,0,0,0.25)]">
                            <div className="flex flex-col gap-5 border-b border-neutral-100 bg-neutral-50/70 p-5 sm:flex-row sm:items-center sm:justify-between md:p-7">
                                <div>
                                    <div className="flex items-center gap-2 text-[10px] font-extrabold uppercase tracking-widest text-neutral-500"><FiCheckCircle className="text-emerald-500" /> Order located</div>
                                    <h2 className="mt-2 break-all font-mono text-xl font-black tracking-tight text-neutral-950 sm:text-2xl">{order.orderNumber}</h2>
                                    <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-neutral-500">
                                        {order.placedAt && <span className="inline-flex items-center gap-1.5"><FiClock /> Placed {formatDate(order.placedAt)}</span>}
                                        {deliveryLabel && <span className="inline-flex items-center gap-1.5"><FiMapPin /> {deliveryLabel}</span>}
                                    </div>
                                </div>
                                <div className="sm:text-right">
                                    <span className={`inline-flex rounded-full px-3.5 py-2 text-xs font-extrabold ${order.status === 'cancelled' ? 'bg-red-100 text-red-700' : order.status === 'delivered' ? 'bg-emerald-100 text-emerald-700' : 'bg-accent-500/20 text-neutral-900'}`}>{statusLabel(order.status)}</span>
                                    <p className="mt-2 text-[11px] text-neutral-500">Current live status</p>
                                </div>
                            </div>

                            <div className="grid gap-0 lg:grid-cols-[0.9fr_1.1fr]">
                                <div className="border-b border-neutral-100 p-5 md:p-7 lg:border-b-0 lg:border-r">
                                    <h3 className="font-display text-lg font-bold text-neutral-950">Order progress</h3>
                                    <p className="mt-1 text-xs text-neutral-500">Updates appear here as our team processes your request.</p>
                                    <div className="mt-6"><OrderTimeline status={order.status} timeline={order.timeline} /></div>
                                </div>

                                <div className="p-5 md:p-7">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h3 className="font-display text-lg font-bold text-neutral-950">Ordered parts</h3>
                                            <p className="mt-1 text-xs text-neutral-500">{order.items?.length || 0} line item{order.items?.length === 1 ? '' : 's'}</p>
                                        </div>
                                        <div className="grid h-10 w-10 place-items-center rounded-xl bg-neutral-100 text-neutral-600"><FiPackage size={18} /></div>
                                    </div>

                                    <ul className="mt-5 divide-y divide-neutral-100 rounded-2xl border border-neutral-100">
                                        {(order.items || []).map((item, index) => (
                                            <li key={`${item.partNumber || item.name}-${index}`} className="flex items-start justify-between gap-4 p-4">
                                                <div className="min-w-0">
                                                    <p className="font-semibold leading-snug text-neutral-900">{item.name}</p>
                                                    <div className="mt-1 flex flex-wrap gap-x-3 text-[11px] text-neutral-500">
                                                        {item.partNumber && <span className="font-mono">Part No: {item.partNumber}</span>}
                                                        <span>Quantity: {item.quantity}</span>
                                                    </div>
                                                </div>
                                                <span className="shrink-0 text-sm font-bold tabular-nums text-neutral-700">{item.total != null ? formatMoney(item.total, order.currency) : 'On request'}</span>
                                            </li>
                                        ))}
                                    </ul>

                                    <div className="mt-5 space-y-2 rounded-2xl bg-neutral-950 p-4 text-sm text-white">
                                        {hasPricedItems && <div className="flex justify-between text-neutral-400"><span>{hasOnRequestItems ? 'Priced items estimate' : 'Subtotal'}</span><span className="tabular-nums">{formatMoney(order.subtotal, order.currency)}</span></div>}
                                        {hasPricedItems && order.taxAmount > 0 && <div className="flex justify-between text-neutral-400"><span>Estimated tax</span><span className="tabular-nums">{formatMoney(order.taxAmount, order.currency)}</span></div>}
                                        <div className="flex items-end justify-between border-t border-white/10 pt-3">
                                            <span className="font-bold">{hasOnRequestItems ? 'Confirmed total' : 'Order total'}</span>
                                            <span className="text-right text-lg font-black tabular-nums">{hasOnRequestItems ? 'To be confirmed' : formatMoney(order.total, order.currency)}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="mt-5 flex flex-col items-center justify-between gap-3 rounded-2xl border border-neutral-200 bg-neutral-50 px-5 py-4 text-center sm:flex-row sm:text-left">
                            <div><p className="text-sm font-bold text-neutral-900">Need help with this order?</p><p className="mt-0.5 text-xs text-neutral-500">Share your Order ID with our team for faster assistance.</p></div>
                            <a href={genericWaLink()} target="_blank" rel="noopener noreferrer" className="btn btn-wa shrink-0 px-5 py-2.5"><FaWhatsapp /> Contact support</a>
                        </div>
                    </section>
                )}

                {!submitted && (
                    <section className="mx-auto mt-8 grid max-w-4xl gap-3 sm:grid-cols-3">
                        {[
                            [FiSearch, 'Find your Order ID', 'Check the confirmation screen or the WhatsApp order message.'],
                            [FiClock, 'See live progress', 'Status updates reflect the same workflow used by our support team.'],
                            [FiShield, 'Private by design', 'Tracking never displays your phone, email, or full street address.'],
                        ].map(([Icon, title, text]) => (
                            <div key={title} className="rounded-2xl border border-neutral-200 bg-neutral-50 p-4">
                                <Icon className="text-neutral-700" size={18} />
                                <h2 className="mt-3 text-sm font-bold text-neutral-900">{title}</h2>
                                <p className="mt-1 text-xs leading-relaxed text-neutral-500">{text}</p>
                            </div>
                        ))}
                    </section>
                )}
            </div>
        </main>
    );
}
