'use client';

import { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { CartProvider } from '@/context/CartContext';
import { WishlistProvider } from '@/context/WishlistContext';

export function Providers({ children }) {
    const [queryClient] = useState(() => new QueryClient({
        defaultOptions: { queries: { refetchOnWindowFocus: false, staleTime: 60_000, retry: 1 } },
    }));

    return (
        <QueryClientProvider client={queryClient}>
            <CartProvider>
                <WishlistProvider>{children}</WishlistProvider>
            </CartProvider>
        </QueryClientProvider>
    );
}
