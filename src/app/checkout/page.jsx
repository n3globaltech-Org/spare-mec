'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FaWhatsapp } from 'react-icons/fa';
import { FiArrowLeft, FiCheck, FiCheckCircle, FiChevronDown, FiClipboard, FiMinus, FiPlus, FiSearch, FiTrash2 } from 'react-icons/fi';
import { allCountries } from 'country-region-data';
import { getCountryCallingCode, parsePhoneNumberFromString } from 'libphonenumber-js/min';
import { useCart } from '@/context/CartContext';
import { createOrder } from '@/lib/orders';
import { orderWaLink } from '@/lib/whatsapp';
import { formatMoney } from '@/lib/money';

const inputCls = 'w-full rounded-xl border border-neutral-200 bg-white px-3.5 py-3 text-sm text-neutral-900 outline-none transition-colors placeholder:text-neutral-400 focus:border-neutral-950';
const UAE = 'United Arab Emirates';
const flagFor = (code) => String.fromCodePoint(...code.toUpperCase().split('').map((char) => 127397 + char.charCodeAt(0)));
const COUNTRIES = allCountries
    .map(([name, code, regions]) => {
        try {
            return { name, code, regions, flag: flagFor(code), callingCode: getCountryCallingCode(code) };
        } catch {
            return { name, code, regions, flag: flagFor(code), callingCode: null };
        }
    })
    .sort((a, b) => a.name.localeCompare(b.name));
const PHONE_COUNTRIES = COUNTRIES.filter((country) => country.callingCode);
const COUNTRY_OPTIONS = COUNTRIES.map((country) => ({
    value: country.code,
    label: `${country.flag} ${country.name}`,
    search: `${country.name} ${country.code}`,
}));
const PHONE_COUNTRY_OPTIONS = PHONE_COUNTRIES.map((country) => ({
    value: country.code,
    label: `${country.flag} ${country.name}`,
    displayLabel: `${country.flag} +${country.callingCode}`,
    meta: `+${country.callingCode}`,
    search: `${country.name} ${country.code} +${country.callingCode} ${country.callingCode}`,
}));
const initialForm = {
    name: '', phone: '', phoneCountryCode: 'AE', email: '', countryCode: 'AE', country: UAE,
    state: '', city: '', address: '', postalCode: '', notes: '',
};

function SearchableSelect({
    id, value, onChange, options, placeholder = 'Select an option',
    searchPlaceholder = 'Type to search…', className = '', menuClassName = '',
}) {
    const rootRef = useRef(null);
    const inputRef = useRef(null);
    const [open, setOpen] = useState(false);
    const [query, setQuery] = useState('');
    const [activeIndex, setActiveIndex] = useState(0);
    const selected = options.find((option) => option.value === value);
    const filtered = useMemo(() => {
        const term = query.trim().toLocaleLowerCase();
        if (!term) return options;
        return options.filter((option) => (option.search || option.label).toLocaleLowerCase().includes(term));
    }, [options, query]);

    useEffect(() => {
        const closeOnOutsideClick = (event) => {
            if (!rootRef.current?.contains(event.target)) {
                setOpen(false);
                setQuery('');
            }
        };
        document.addEventListener('mousedown', closeOnOutsideClick);
        return () => document.removeEventListener('mousedown', closeOnOutsideClick);
    }, []);

    useEffect(() => setActiveIndex(0), [query]);

    const choose = (option) => {
        onChange(option.value);
        setOpen(false);
        setQuery('');
        inputRef.current?.blur();
    };

    const onKeyDown = (event) => {
        if (event.key === 'Escape') {
            setOpen(false);
            setQuery('');
            inputRef.current?.blur();
        } else if (event.key === 'ArrowDown') {
            event.preventDefault();
            setOpen(true);
            setActiveIndex((index) => Math.min(index + 1, filtered.length - 1));
        } else if (event.key === 'ArrowUp') {
            event.preventDefault();
            setActiveIndex((index) => Math.max(index - 1, 0));
        } else if (event.key === 'Enter' && open && filtered[activeIndex]) {
            event.preventDefault();
            choose(filtered[activeIndex]);
        }
    };

    return (
        <div ref={rootRef} className={`relative ${className}`}>
            <div className={`relative rounded-xl border bg-white shadow-sm transition-all ${open ? 'border-neutral-950 ring-4 ring-neutral-950/5' : 'border-neutral-200 hover:border-neutral-300'}`}>
                {open && <FiSearch aria-hidden="true" className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />}
                <input
                    ref={inputRef}
                    id={id}
                    role="combobox"
                    aria-expanded={open}
                    aria-controls={`${id}-options`}
                    aria-autocomplete="list"
                    autoComplete="off"
                    value={open ? query : (selected?.displayLabel || selected?.label || '')}
                    placeholder={open ? searchPlaceholder : placeholder}
                    onFocus={() => { setOpen(true); setQuery(''); }}
                    onClick={() => setOpen(true)}
                    onChange={(event) => { setQuery(event.target.value); setOpen(true); }}
                    onKeyDown={onKeyDown}
                    className={`w-full rounded-xl bg-transparent py-3 pr-10 text-sm text-neutral-900 outline-none placeholder:text-neutral-400 ${open ? 'pl-10' : 'pl-3.5'} cursor-text`}
                />
                <FiChevronDown aria-hidden="true" className={`pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-500 transition-transform ${open ? 'rotate-180' : ''}`} />
            </div>

            {open && (
                <div className={`absolute left-0 top-[calc(100%+0.5rem)] z-50 w-full overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-xl shadow-neutral-900/10 ${menuClassName}`}>
                    <ul id={`${id}-options`} role="listbox" className="max-h-64 overflow-y-auto p-1.5 overscroll-contain">
                        {filtered.length ? filtered.map((option, index) => (
                            <li
                                key={option.value}
                                role="option"
                                aria-selected={option.value === value}
                                onMouseEnter={() => setActiveIndex(index)}
                                onMouseDown={(event) => { event.preventDefault(); choose(option); }}
                                className={`flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors ${index === activeIndex ? 'bg-neutral-100' : 'hover:bg-neutral-50'}`}
                            >
                                <span className="min-w-0 flex-1 truncate font-medium text-neutral-800">{option.label}</span>
                                {option.meta && <span className="shrink-0 text-xs font-semibold tabular-nums text-neutral-400">{option.meta}</span>}
                                {option.value === value && <FiCheck className="h-4 w-4 shrink-0 text-neutral-950" />}
                            </li>
                        )) : (
                            <li className="px-3 py-6 text-center text-sm text-neutral-500">No matching result</li>
                        )}
                    </ul>
                    <p className="border-t border-neutral-100 px-3.5 py-2 text-[11px] text-neutral-400">Type to search · ↑↓ to navigate · Enter to select</p>
                </div>
            )}
        </div>
    );
}

export default function CheckoutPage() {
    const router = useRouter();
    const { items, hydrated, setQty, remove, subtotal, currency, clear } = useCart();
    const [mode, setMode] = useState(null);
    const [form, setForm] = useState(initialForm);
    const [loading, setLoading] = useState('');
    const [error, setError] = useState('');
    const states = useMemo(
        () => COUNTRIES.find((country) => country.code === form.countryCode)?.regions || [],
        [form.countryCode]
    );
    const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));
    const setCountry = (countryCode) => {
        const country = COUNTRIES.find((item) => item.code === countryCode);
        setForm((current) => ({
            ...current,
            countryCode,
            country: country?.name || '',
            state: '',
        }));
    };
    const hasPricedItems = items.some((i) => i.price != null);
    const hasOnRequestItems = items.some((i) => i.price == null);

    if (!hydrated) {
        return (
            <div className="container-x py-12" aria-label="Loading cart">
                <div className="h-8 w-48 animate-pulse rounded-lg bg-neutral-100" />
                <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_380px]">
                    <div className="h-64 animate-pulse rounded-2xl bg-neutral-100" />
                    <div className="h-72 animate-pulse rounded-2xl bg-neutral-100" />
                </div>
            </div>
        );
    }

    if (items.length === 0) {
        return (
            <div className="container-x py-20 text-center">
                <h1 className="text-2xl font-display font-bold">Your cart is empty</h1>
                <p className="mt-2 text-neutral-500">Browse the catalogue to add parts.</p>
                <Link href="/catalogue" className="btn btn-primary mt-6 inline-flex">Browse Catalogue</Link>
            </div>
        );
    }

    const orderItems = () => items.map((item) => ({ productId: item.id, quantity: item.quantity }));
    const hasDelivery = () => Boolean(
        form.state || form.city || form.address || form.postalCode || (form.country && form.country !== UAE)
    );

    const websitePayload = () => ({
        source: 'website',
        items: orderItems(),
        customer: {
            name: form.name.trim(),
            phone: parsePhoneNumberFromString(form.phone.trim(), form.phoneCountryCode)?.number || form.phone.trim(),
            email: form.email.trim() || null,
        },
        delivery: hasDelivery() ? {
            country: form.country.trim() || null,
            state: form.state.trim() || null,
            city: form.city.trim() || null,
            address: form.address.trim() || null,
            postalCode: form.postalCode.trim() || null,
        } : null,
        notes: form.notes.trim() || null,
    });

    const placeWebsiteOrder = async (event) => {
        event.preventDefault();
        setError('');
        if (!form.name.trim()) { setError('Please enter your full name.'); return; }
        const phoneNumber = parsePhoneNumberFromString(form.phone.trim(), form.phoneCountryCode);
        if (!phoneNumber?.isPossible()) { setError('Please enter a valid mobile number.'); return; }
        if (form.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) { setError('Please correct the email address or leave it blank.'); return; }
        setLoading('web');
        try {
            const order = await createOrder(websitePayload());
            clear();
            router.push(`/order-confirmation?order=${encodeURIComponent(order.orderNumber)}`);
        } catch (requestError) {
            setLoading('');
            setError(requestError?.response?.data?.error?.message || 'Could not place the order. Please try again.');
        }
    };

    const placeWhatsAppOrder = async () => {
        setError('');
        setLoading('wa');
        const snapshot = items.map((item) => ({
            name: item.name,
            partNumber: item.partNumber,
            quantity: item.quantity,
            unitPrice: item.price,
            selectedOptions: item.selectedOptions || null,
        }));
        // Open the WhatsApp tab synchronously — inside the click gesture — so it isn't popup-blocked
        // after the awaited order call. If it IS blocked, the confirmation page has a WhatsApp button.
        const waWindow = typeof window !== 'undefined' ? window.open('', '_blank') : null;
        if (waWindow) { try { waWindow.opener = null; } catch { /* ignore */ } }
        try {
            const order = await createOrder({ source: 'whatsapp', items: orderItems() });
            clear();
            const href = orderWaLink({ orderNumber: order.orderNumber, items: snapshot, currency });
            if (waWindow) {
                waWindow.location.href = href;
                router.push(`/order-confirmation?order=${encodeURIComponent(order.orderNumber)}`);
            } else if (typeof window !== 'undefined') {
                // Popup blocked: navigate this tab to WhatsApp instead of racing it against Next navigation.
                window.location.href = href;
            }
        } catch (requestError) {
            if (waWindow) { try { waWindow.close(); } catch { /* ignore */ } }
            setLoading('');
            setError(requestError?.response?.data?.error?.message || 'Could not prepare the WhatsApp order. Please try again.');
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
                                ? <img src={i.image} alt={i.name} loading="lazy" decoding="async" className="w-full h-full object-cover" />
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

            {/* Summary + ordering choice/details */}
            <div className="space-y-4">
                <div className="card p-5">
                    <div className="flex justify-between text-sm mb-1"><span className="text-neutral-500">Subtotal</span><span className="tabular-nums font-medium">{hasPricedItems ? formatMoney(subtotal, currency) : 'On request'}</span></div>
                    {hasOnRequestItems && (
                        <p className="text-xs text-neutral-500 mb-1">{hasPricedItems ? 'Some items are priced on request — we confirm the full total with your order.' : 'These items are priced on request — we confirm pricing with your order.'}</p>
                    )}
                    <p className="text-xs text-neutral-500">Any applicable VAT is confirmed with your order.</p>
                </div>

                {mode === null ? (
                    <div className="card p-5 md:p-6">
                        <h2 className="font-display text-xl font-bold text-neutral-950">How would you like to order?</h2>
                        <p className="mt-1.5 text-sm text-neutral-500">Choose the fastest option for you. No account is required.</p>

                        {error && <div role="alert" className="mt-4 rounded-xl border border-red-200 bg-red-50 px-3.5 py-3 text-sm text-red-700">{error}</div>}

                        <button onClick={placeWhatsAppOrder} disabled={!!loading} className="mt-5 flex w-full items-center gap-3 rounded-2xl bg-[#25D366] p-4 text-left text-white shadow-sm transition-all hover:-translate-y-0.5 hover:bg-[#20bd5a] disabled:cursor-wait disabled:opacity-70">
                            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-white/20"><FaWhatsapp className="h-5 w-5" /></span>
                            <span className="min-w-0 flex-1">
                                <span className="block font-extrabold">{loading === 'wa' ? 'Creating your order…' : 'Order on WhatsApp'}</span>
                                <span className="mt-0.5 block text-xs text-white/85">One click—no details or address needed</span>
                            </span>
                        </button>

                        <button onClick={() => { setMode('website'); setError(''); }} disabled={!!loading} className="mt-3 flex w-full items-center gap-3 rounded-2xl border border-neutral-200 bg-white p-4 text-left text-neutral-900 shadow-sm transition-all hover:-translate-y-0.5 hover:border-neutral-300 hover:bg-neutral-50">
                            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-neutral-950 text-white"><FiClipboard className="h-5 w-5" /></span>
                            <span className="min-w-0 flex-1">
                                <span className="block font-extrabold">Place Order</span>
                                <span className="mt-0.5 block text-xs text-neutral-500">Enter your contact and delivery details</span>
                            </span>
                        </button>
                    </div>
                ) : (
                    <form onSubmit={placeWebsiteOrder} className="card p-5 md:p-6">
                        <button type="button" onClick={() => { setMode(null); setError(''); }} className="mb-4 inline-flex items-center gap-1.5 text-xs font-bold text-neutral-500 transition-colors hover:text-neutral-950">
                            <FiArrowLeft /> Change order method
                        </button>
                        <h2 className="font-display text-xl font-bold text-neutral-950">Your details</h2>
                        <p className="mt-1 text-xs text-neutral-500"><span className="text-red-500">*</span> Required fields</p>

                        <div className="mt-5 space-y-4">
                            <div>
                                <label htmlFor="checkout-name" className="mb-1.5 block text-xs font-bold text-neutral-700">Full Name <span className="text-red-500">*</span></label>
                                <input id="checkout-name" value={form.name} onChange={(e) => set('name', e.target.value)} placeholder="Your full name" autoComplete="name" className={inputCls} required />
                            </div>
                            <div>
                                <label htmlFor="checkout-phone" className="mb-1.5 block text-xs font-bold text-neutral-700">Mobile Number <span className="text-red-500">*</span></label>
                                <div className="flex gap-2">
                                    <label htmlFor="checkout-phone-country" className="sr-only">Mobile country code</label>
                                    <SearchableSelect
                                        id="checkout-phone-country"
                                        value={form.phoneCountryCode}
                                        onChange={(value) => set('phoneCountryCode', value)}
                                        options={PHONE_COUNTRY_OPTIONS}
                                        placeholder="Code"
                                        searchPlaceholder="Country or code…"
                                        className="w-[8.5rem] shrink-0 sm:w-[9.25rem]"
                                        menuClassName="min-w-[17rem]"
                                    />
                                    <input id="checkout-phone" value={form.phone} onChange={(e) => set('phone', e.target.value)} placeholder="50 123 4567" type="tel" inputMode="tel" autoComplete="tel-national" className={`${inputCls} min-w-0`} required />
                                </div>
                            </div>
                            <div>
                                <label htmlFor="checkout-email" className="mb-1.5 block text-xs font-bold text-neutral-700">Email Address <span className="font-normal text-neutral-400">(optional)</span></label>
                                <input id="checkout-email" value={form.email} onChange={(e) => set('email', e.target.value)} placeholder="you@example.com" type="email" inputMode="email" autoComplete="email" className={inputCls} />
                            </div>
                        </div>

                        <div className="my-6 border-t border-neutral-100" />
                        <h3 className="font-display font-bold text-neutral-950">Delivery address <span className="text-xs font-normal text-neutral-400">(optional)</span></h3>
                        <div className="mt-4 space-y-4">
                            <div>
                                <label htmlFor="checkout-country" className="mb-1.5 block text-xs font-bold text-neutral-700">Country</label>
                                <SearchableSelect
                                    id="checkout-country"
                                    value={form.countryCode}
                                    onChange={setCountry}
                                    options={COUNTRY_OPTIONS}
                                    placeholder="Select country"
                                    searchPlaceholder="Search country…"
                                />
                            </div>
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                <div>
                                    <label htmlFor="checkout-state" className="mb-1.5 block text-xs font-bold text-neutral-700">State / Emirate / Region</label>
                                    {states.length > 0 ? (
                                        <SearchableSelect
                                            id="checkout-state"
                                            value={form.state}
                                            onChange={(value) => set('state', value)}
                                            options={states.map(([name, code]) => ({ value: name, label: name, search: `${name} ${code || ''}` }))}
                                            placeholder={form.countryCode === 'AE' ? 'Select emirate' : 'Select state / region'}
                                            searchPlaceholder={form.countryCode === 'AE' ? 'Search emirate…' : 'Search state or region…'}
                                        />
                                    ) : (
                                        <input id="checkout-state" value={form.state} onChange={(e) => set('state', e.target.value)} placeholder="State or region" autoComplete="address-level1" className={inputCls} />
                                    )}
                                </div>
                                <div>
                                    <label htmlFor="checkout-city" className="mb-1.5 block text-xs font-bold text-neutral-700">City</label>
                                    <input id="checkout-city" value={form.city} onChange={(e) => set('city', e.target.value)} placeholder="Dubai" autoComplete="address-level2" className={inputCls} />
                                </div>
                            </div>
                            <div>
                                <label htmlFor="checkout-address" className="mb-1.5 block text-xs font-bold text-neutral-700">Full Address</label>
                                <textarea id="checkout-address" value={form.address} onChange={(e) => set('address', e.target.value)} placeholder="Building, street, area" autoComplete="street-address" rows={3} className={`${inputCls} resize-y`} />
                            </div>
                            <div>
                                <label htmlFor="checkout-postal" className="mb-1.5 block text-xs font-bold text-neutral-700">Postal / ZIP Code</label>
                                <input id="checkout-postal" value={form.postalCode} onChange={(e) => set('postalCode', e.target.value)} placeholder="Optional" autoComplete="postal-code" className={inputCls} />
                            </div>
                            <div>
                                <label htmlFor="checkout-notes" className="mb-1.5 block text-xs font-bold text-neutral-700">Additional Notes <span className="font-normal text-neutral-400">(optional)</span></label>
                                <textarea id="checkout-notes" value={form.notes} onChange={(e) => set('notes', e.target.value)} placeholder="Delivery instructions or anything else we should know" rows={3} className={`${inputCls} resize-y`} />
                            </div>
                        </div>

                        {error && <div role="alert" className="mt-5 rounded-xl border border-red-200 bg-red-50 px-3.5 py-3 text-sm text-red-700">{error}</div>}
                        <button type="submit" disabled={!!loading} className="btn btn-primary mt-5 w-full py-3.5">
                            {loading === 'web' ? 'Placing your order…' : <><FiCheckCircle className="h-4 w-4" /> Place Order</>}
                        </button>
                        <p className="mt-3 text-center text-xs text-neutral-500">We only use these details to process and confirm your order.</p>
                    </form>
                )}
            </div>
        </div>
    );
}
