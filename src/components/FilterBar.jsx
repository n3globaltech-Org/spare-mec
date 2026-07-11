'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FiSearch } from 'react-icons/fi';

const selectCls = 'px-3 py-2 rounded-full border border-neutral-300 bg-white text-sm outline-none focus:border-accent-500';

const SORTS = [
    { value: '', label: 'Featured' },
    { value: 'newest', label: 'Newest' },
    { value: 'price_asc', label: 'Price: Low → High' },
    { value: 'price_desc', label: 'Price: High → Low' },
    { value: 'name', label: 'Name A–Z' },
];

export function FilterBar({ categories = [], brands = [], current = {}, hideSearch = false, hideCategory = false }) {
    const router = useRouter();
    const [q, setQ] = useState(current.q || '');

    const push = (overrides) => {
        const merged = { q, category: current.category, brand: current.brand, sort: current.sort, ...overrides };
        const params = new URLSearchParams();
        Object.entries(merged).forEach(([k, v]) => { if (v) params.set(k, v); });
        router.push(`/catalogue?${params.toString()}`);
    };

    return (
        <div className="flex flex-wrap gap-2 items-center">
            {!hideSearch && (
                <form onSubmit={(e) => { e.preventDefault(); push({ q }); }} className="relative flex-1 min-w-[200px]">
                    <FiSearch className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search part number, name, brand…" className="w-full pl-9 pr-3 py-2 rounded-full border border-neutral-300 bg-white text-sm outline-none focus:border-accent-500" />
                </form>
            )}
            {!hideCategory && (
                <select value={current.category || ''} onChange={(e) => push({ category: e.target.value })} className={selectCls} aria-label="Category">
                    <option value="">All categories</option>
                    {categories.map((c) => <option key={c.id} value={c.slug || ''}>{c.name}</option>)}
                </select>
            )}
            <select value={current.brand || ''} onChange={(e) => push({ brand: e.target.value })} className={selectCls} aria-label="Brand">
                <option value="">All brands</option>
                {brands.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
            </select>
            <select value={current.sort || ''} onChange={(e) => push({ sort: e.target.value })} className={selectCls} aria-label="Sort">
                {SORTS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>
        </div>
    );
}
