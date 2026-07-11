'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FaWhatsapp } from 'react-icons/fa';
import { FiTrash2, FiMinus, FiPlus } from 'react-icons/fi';
import { useCart } from '@/context/CartContext';
import { createOrder } from '@/lib/orders';
import { orderWaLink } from '@/lib/whatsapp';
import { formatMoney } from '@/lib/money';

const inputCls = 'w-full px-3 py-2.5 rounded-lg border border-neutral-300 text-sm outline-none focus:border-accent-500';

export default function CheckoutPage() {
    const router = useRouter();
    const { items, setQty, remove, subtotal, currency, clear } = useCart();
    const [form, setForm] = useState({ name: '', phone: '', email: '', address: '', city: '', emirate: '' });
    const [loading, setLoading] = useState('');
    const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));
    const hasPricedItems = items.some((i) => i.price != null);
    const hasOnRequestItems = items.some((i) => i.price == null);

    if (items.length === 0) {
        return (
            <div className="container-x py-20 text-center">
                <h1 className="text-2xl font-display font-bold">Your cart is empty</h1>
                <p className="mt-2 text-neutral-500">Browse the catalogue to add parts.</p>
                <Link href="/catalogue" className="btn btn-primary mt-6 inline-flex">Browse Catalogue</Link>
            </div>
        );
    }

    const payload = (source) => ({
        source,
        items: items.map((i) => ({ productId: i.id, quantity: i.quantity })),
        customer: { name: form.name || null, phone: form.phone || null, email: form.email || null },
        delivery: (form.address || form.city || form.emirate)
            ? { address: form.address || null, city: form.city || null, emirate: form.emirate || null }
            : null,
    });

    const place = async (viaWhatsApp) => {
        // A contactable lead needs a valid phone (we confirm every order personally); validate the
        // email format only if one was provided. Prevents uncontactable / malformed CRM leads.
        const phoneDigits = form.phone.replace(/\D/g, '');
        if (phoneDigits.length < 7) { alert('Please enter a valid phone number (with country/area code) so we can confirm your order.'); return; }
        if (form.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) { alert("That email doesn't look right — please fix it or leave it blank."); return; }
        setLoading(viaWhatsApp ? 'wa' : 'web');
        const snapshot = items.map((i) => ({ name: i.name, partNumber: i.partNumber, quantity: i.quantity, unitPrice: i.price }));
        // Open the WhatsApp tab synchronously — inside the click gesture — so it isn't popup-blocked
        // after the awaited order call. If it IS blocked, the confirmation page has a WhatsApp button.
        const waWindow = viaWhatsApp && typeof window !== 'undefined' ? window.open('', '_blank') : null;
        if (waWindow) { try { waWindow.opener = null; } catch { /* ignore */ } }
        try {
            const order = await createOrder(payload(viaWhatsApp ? 'whatsapp' : 'website'));
            clear();
            if (viaWhatsApp && waWindow) {
                waWindow.location.href = orderWaLink({ orderNumber: order.orderNumber, items: snapshot, currency });
            }
            router.push(`/order-confirmation?order=${encodeURIComponent(order.orderNumber)}`);
        } catch {
            if (waWindow) { try { waWindow.close(); } catch { /* ignore */ } }
            setLoading('');
            alert('Could not place the order. Please try again, or reach us on WhatsApp.');
        }
    };

    return (
        <div className="container-x py-8 grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Cart */}
            <div className="md:col-span-2 space-y-3">
                <h1 className="text-2xl font-display font-bold mb-2">Checkout</h1>
                {items.map((i) => (
                    <div key={i.id} className="card p-3 flex items-center gap-3">
                        <div className="w-16 h-16 rounded-lg bg-neutral-100 overflow-hidden shrink-0">
                            {i.image
                                // eslint-disable-next-line @next/next/no-img-element
                                ? <img src={i.image} alt={i.name} className="w-full h-full object-cover" />
                                : <div className="w-full h-full grid place-items-center text-neutral-300 text-[10px]">No image</div>}
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="font-medium text-ink truncate">{i.name}</div>
                            {i.partNumber && <div className="text-xs text-neutral-500 font-mono">{i.partNumber}</div>}
                            <div className="text-sm text-neutral-600 mt-0.5">{i.price != null ? formatMoney(i.price, i.currency) : 'Price on request'}</div>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <button onClick={() => setQty(i.id, i.quantity - 1)} className="p-1.5 rounded-md border border-neutral-200 hover:bg-neutral-50"><FiMinus className="w-3.5 h-3.5" /></button>
                            <span className="w-7 text-center tabular-nums">{i.quantity}</span>
                            <button onClick={() => setQty(i.id, i.quantity + 1)} className="p-1.5 rounded-md border border-neutral-200 hover:bg-neutral-50"><FiPlus className="w-3.5 h-3.5" /></button>
                            <button onClick={() => remove(i.id)} className="p-1.5 text-neutral-400 hover:text-red-500 ml-1"><FiTrash2 className="w-4 h-4" /></button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Summary + details */}
            <div className="space-y-4">
                <div className="card p-5">
                    <h2 className="font-display font-bold mb-3">Your details</h2>
                    <div className="space-y-2">
                        <input value={form.name} onChange={(e) => set('name', e.target.value)} placeholder="Name" aria-label="Name" autoComplete="name" className={inputCls} />
                        <input value={form.phone} onChange={(e) => set('phone', e.target.value)} placeholder="Phone (WhatsApp)" aria-label="Phone number" type="tel" inputMode="tel" autoComplete="tel" className={inputCls} />
                        <input value={form.email} onChange={(e) => set('email', e.target.value)} placeholder="Email (optional)" aria-label="Email (optional)" type="email" inputMode="email" autoComplete="email" className={inputCls} />
                        <input value={form.address} onChange={(e) => set('address', e.target.value)} placeholder="Delivery address (optional)" aria-label="Delivery address (optional)" autoComplete="street-address" className={inputCls} />
                        <div className="grid grid-cols-2 gap-2">
                            <input value={form.city} onChange={(e) => set('city', e.target.value)} placeholder="City" aria-label="City" autoComplete="address-level2" className={inputCls} />
                            <input value={form.emirate} onChange={(e) => set('emirate', e.target.value)} placeholder="Emirate" aria-label="Emirate" autoComplete="address-level1" className={inputCls} />
                        </div>
                    </div>
                </div>

                <div className="card p-5">
                    <div className="flex justify-between text-sm mb-1"><span className="text-neutral-500">Subtotal</span><span className="tabular-nums font-medium">{hasPricedItems ? formatMoney(subtotal, currency) : 'On request'}</span></div>
                    {hasOnRequestItems && (
                        <p className="text-xs text-neutral-500 mb-1">{hasPricedItems ? 'Some items are priced on request — we confirm the full total with your order.' : 'These items are priced on request — we confirm pricing with your order.'}</p>
                    )}
                    <p className="text-xs text-neutral-500 mb-4">Any applicable VAT is confirmed with your order.</p>
                    <button onClick={() => place(false)} disabled={!!loading} className="btn btn-primary w-full py-3">
                        {loading === 'web' ? 'Placing…' : 'Place Order'}
                    </button>
                    <button onClick={() => place(true)} disabled={!!loading} className="btn btn-wa w-full py-3 mt-2">
                        <FaWhatsapp className="w-5 h-5" /> {loading === 'wa' ? 'Preparing…' : 'Order on WhatsApp'}
                    </button>
                    <p className="text-xs text-neutral-500 text-center mt-3">No account needed — we confirm every order personally.</p>
                </div>
            </div>
        </div>
    );
}
