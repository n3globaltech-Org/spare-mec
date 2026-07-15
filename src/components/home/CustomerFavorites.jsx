import Link from 'next/link';
import { FiArrowUpRight } from 'react-icons/fi';
import { ProductGrid } from '@/components/ProductGrid';

export default function CustomerFavorites({ products = [], variant = 'compact' }) {
    const list = products.slice(0, 8);

    if (!list.length) return null;

    return (
        <section className="bg-white py-10 md:py-16" aria-labelledby="customer-favorites-title">
            <div className="container-x lg:max-w-[96rem]">
                <div className="mb-6 flex items-end justify-between gap-4 md:mb-9">
                    <div>
                        <div className="mb-2 flex items-center gap-2">
                            <span className="text-[10px] font-extrabold uppercase tracking-widest text-accent-500 md:text-[11px]">CUSTOMER PICKS</span>
                            <span className="h-0.5 w-8 bg-accent-500" />
                        </div>
                        <h2 id="customer-favorites-title" className="font-display text-2xl font-black tracking-tight text-neutral-950 sm:text-3xl md:text-[2.4rem]">
                            Customer Favourites
                        </h2>
                        <p className="mt-2 max-w-lg text-xs font-medium text-neutral-500 sm:text-sm">
                            Popular parts chosen by SpareMec customers.
                        </p>
                    </div>

                    <Link href="/catalogue" className="hidden items-center gap-1.5 text-xs font-extrabold text-neutral-700 transition-colors hover:text-neutral-950 sm:flex">
                        View all <FiArrowUpRight size={15} />
                    </Link>
                </div>

                <ProductGrid products={list} variant={variant} />

                <Link href="/catalogue" className="mt-6 flex items-center justify-center gap-1.5 rounded-xl border border-neutral-200 px-4 py-3 text-xs font-extrabold text-neutral-700 transition-colors hover:border-neutral-300 hover:bg-neutral-50 sm:hidden">
                    View all products <FiArrowUpRight size={15} />
                </Link>
            </div>
        </section>
    );
}
