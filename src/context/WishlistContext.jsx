'use client';

import { createContext, useContext, useEffect, useReducer, useRef } from 'react';

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
    const hydrated = useRef(false);

    useEffect(() => {
        try {
            const raw = localStorage.getItem(KEY);
            if (raw) dispatch({ type: 'HYDRATE', slugs: JSON.parse(raw) });
        } catch { /* ignore */ }
        hydrated.current = true;
    }, []);

    useEffect(() => {
        if (!hydrated.current) return;
        try { localStorage.setItem(KEY, JSON.stringify(slugs)); } catch { /* ignore */ }
    }, [slugs]);

    const value = {
        slugs,
        has: (slug) => slugs.includes(slug),
        toggle: (slug) => dispatch({ type: 'TOGGLE', slug }),
        count: slugs.length,
    };
    return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
}

export const useWishlist = () => useContext(WishlistContext);
