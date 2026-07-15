'use client';

import Link from 'next/link';
import { useQueries } from '@tanstack/react-query';
import { FiHeart } from 'react-icons/fi';
import { useWishlist } from '@/context/WishlistContext';
import { fetchProduct } from '@/lib/catalog';
import { ProductCard } from '@/components/ProductCard';

export default function WishlistPage() {
    const { slugs, count, hydrated } = useWishlist();

    const results = useQueries({
        queries: slugs.map((slug) => ({
            queryKey: ['product', slug],
            queryFn: () => fetchProduct(slug),
            staleTime: 5 * 60 * 1000,
        })),
    });

    const loading = results.some((r) => r.isLoading);
    const failed = results.filter((r) => r.isError).length;
    const products = results.map((r) => r.data).filter(Boolean);

    return (
        <div className="container-x py-12">
            <h1 className="text-2xl md:text-3xl font-display font-bold">Your wishlist</h1>
            <p className="mt-2 text-neutral-500">Saved parts, ready when you are.</p>

            {!hydrated ? (
                <div className="mt-8 grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-5" aria-label="Loading wishlist">
                    {Array.from({ length: 4 }, (_, index) => <div key={index} className="card aspect-[3/4] animate-pulse bg-neutral-100" />)}
                </div>
            ) : count === 0 ? (
                <div className="mt-10 card p-10 text-center">
                    <FiHeart className="w-10 h-10 mx-auto text-neutral-300" />
                    <p className="mt-4 text-neutral-500">Your wishlist is empty.</p>
                    <Link href="/catalogue" className="btn btn-primary mt-5">Browse Catalogue</Link>
                </div>
            ) : loading ? (
                <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-5">
                    {slugs.map((s) => <div key={s} className="card aspect-[3/4] animate-pulse bg-neutral-100" />)}
                </div>
            ) : (
                <>
                    {failed > 0 && (
                        <div role="status" className="mt-6 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                            {failed} saved {failed === 1 ? 'product is' : 'products are'} temporarily unavailable. Refresh to try again.
                        </div>
                    )}
                    <div className="mt-8 grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-5">
                        {products.map((p) => <ProductCard key={p.slug} product={p} forceCol />)}
                    </div>
                </>
            )}
        </div>
    );
}
