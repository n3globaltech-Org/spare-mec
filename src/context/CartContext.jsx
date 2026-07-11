'use client';

import { createContext, useContext, useEffect, useReducer, useRef } from 'react';

// Cart line: { id, slug, name, partNumber, price (plain number|null), currency, image, quantity }
const CartContext = createContext(null);
const KEY = 'smauto_cart_v1';

function reducer(state, action) {
    switch (action.type) {
        case 'HYDRATE':
            return Array.isArray(action.items) ? action.items : [];
        case 'ADD': {
            const p = action.product;
            const existing = state.find((i) => i.id === p.id);
            if (existing) {
                return state.map((i) => (i.id === p.id ? { ...i, quantity: i.quantity + (action.qty || 1) } : i));
            }
            return [...state, {
                id: p.id, slug: p.slug, name: p.name, partNumber: p.partNumber || null,
                price: p.price ?? null, currency: p.currency || 'AED', image: p.image || null,
                quantity: action.qty || 1,
            }];
        }
        case 'SET_QTY':
            return state.map((i) => (i.id === action.id ? { ...i, quantity: Math.max(1, action.qty) } : i));
        case 'REMOVE':
            return state.filter((i) => i.id !== action.id);
        case 'CLEAR':
            return [];
        default:
            return state;
    }
}

export function CartProvider({ children }) {
    const [items, dispatch] = useReducer(reducer, []);
    const hydrated = useRef(false);

    // Load once on mount (client only) — keeps SSR markup stable (no hydration mismatch).
    useEffect(() => {
        try {
            const raw = localStorage.getItem(KEY);
            if (raw) dispatch({ type: 'HYDRATE', items: JSON.parse(raw) });
        } catch { /* ignore */ }
        hydrated.current = true;
    }, []);

    useEffect(() => {
        if (!hydrated.current) return;
        try { localStorage.setItem(KEY, JSON.stringify(items)); } catch { /* ignore */ }
    }, [items]);

    const pricedItems = items.filter((i) => i.price != null);
    const value = {
        items,
        add: (product, qty = 1) => dispatch({ type: 'ADD', product, qty }),
        setQty: (id, qty) => dispatch({ type: 'SET_QTY', id, qty }),
        remove: (id) => dispatch({ type: 'REMOVE', id }),
        clear: () => dispatch({ type: 'CLEAR' }),
        count: items.reduce((s, i) => s + i.quantity, 0),
        subtotal: pricedItems.reduce((s, i) => s + i.price * i.quantity, 0),
        currency: items[0]?.currency || 'AED',
    };

    return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export const useCart = () => useContext(CartContext);
