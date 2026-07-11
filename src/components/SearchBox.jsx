'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FiSearch } from 'react-icons/fi';

export function SearchBox({ big = false, defaultValue = '' }) {
    const router = useRouter();
    const [q, setQ] = useState(defaultValue);

    const submit = (e) => {
        e.preventDefault();
        const term = q.trim();
        router.push(term ? `/catalogue?q=${encodeURIComponent(term)}` : '/catalogue');
    };

    return (
        <form onSubmit={submit} className="relative w-full">
            <FiSearch className={`absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400 ${big ? 'w-5 h-5' : 'w-4 h-4'}`} />
            <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search by part number, name, or brand…"
                aria-label="Search products"
                className={`w-full rounded-full border border-neutral-300 bg-white outline-none focus:border-accent-500 ${big ? 'pl-12 pr-28 py-4 text-base' : 'pl-9 pr-3 py-2 text-sm'}`}
            />
            <button type="submit" className="btn btn-accent absolute right-1.5 top-1/2 -translate-y-1/2 py-2 px-5">Search</button>
        </form>
    );
}
