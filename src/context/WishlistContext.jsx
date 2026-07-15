'use client';

import { createContext, useContext, useEffect, useReducer, useState } from 'react';

// Minimal wishlist by product slug (localStorage). Guest-friendly, no login.
const WishlistContext = createContext(null);
const KEY = 'smauto_wishlist_v1';

function reducer(state, action) {
    switch (action.type) {
        case 'HYDRATE':
            return Array.isArray(action.slugs) ? action.slugs : [];
        case 'TOGGLE':
            return state.includes(action.slug) ? state.filter((s) => s !== action.slug) : [...state, action.slug];
        default:
            return state;
    }
}

export function WishlistProvider({ children }) {
    const [slugs, dispatch] = useReducer(reducer, []);
    const [hydrated, setHydrated] = useState(false);

    useEffect(() => {
        try {
            const raw = localStorage.getItem(KEY);
            if (raw) dispatch({ type: 'HYDRATE', slugs: JSON.parse(raw) });
        } catch { /* ignore */ }
        setHydrated(true);
    }, []);

    useEffect(() => {
        if (!hydrated) return;
        try { localStorage.setItem(KEY, JSON.stringify(slugs)); } catch { /* ignore */ }
    }, [hydrated, slugs]);

    useEffect(() => {
        const syncWishlist = (event) => {
            if (event.key !== KEY || event.newValue === null) return;
            try { dispatch({ type: 'HYDRATE', slugs: JSON.parse(event.newValue) }); } catch { /* ignore */ }
        };
        window.addEventListener('storage', syncWishlist);
        return () => window.removeEventListener('storage', syncWishlist);
    }, []);

    const value = {
        slugs,
        hydrated,
        has: (slug) => slugs.includes(slug),
        toggle: (slug) => dispatch({ type: 'TOGGLE', slug }),
        count: slugs.length,
    };
    return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
}

export const useWishlist = () => useContext(WishlistContext);
