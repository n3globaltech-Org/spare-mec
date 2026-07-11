'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FiSearch, FiX } from 'react-icons/fi';

// Prominent catalogue search (in the showroom hero). Submits to /catalogue?q=…
export function HeroSearch({ initial = '' }) {
    const router = useRouter();
    const [q, setQ] = useState(initial);

    const submit = (e) => {
        e.preventDefault();
        const term = q.trim();
        router.push(term ? `/catalogue?q=${encodeURIComponent(term)}` : '/catalogue');
    };

    return (
        <form onSubmit={submit} className="relative mt-6 md:mt-8 w-full">
            <FiSearch className="pointer-events-none absolute left-5 top-1/2 -translate-y-1/2 text-neutral-400 z-30" size={18} />
            <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search part name or number (e.g. LR011593)"
                className="w-full rounded-full border border-neutral-100 bg-white py-3.5 md:py-4 pl-12 pr-12 text-xs md:text-sm text-neutral-850 placeholder:text-neutral-400 outline-none shadow-sm focus:shadow-md transition-shadow relative z-10"
            />
            {q && (
                <button type="button" onClick={() => setQ('')} aria-label="Clear search" className="absolute right-5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 z-30">
                    <FiX size={16} />
                </button>
            )}
        </form>
    );
}
