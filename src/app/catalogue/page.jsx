import Link from 'next/link';
import { redirect } from 'next/navigation';
import { fetchAllProducts, fetchFilters, buildCategoryTree } from '@/lib/catalog';
import { ResponsiveProductGrid } from '@/components/ProductGrid';
import { FilterBar } from '@/components/FilterBar';
import { HeroSearch } from '@/components/HeroSearch';
import { genericWaLink } from '@/lib/whatsapp';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ searchParams }) {
    // Facet variants (search / sort / brand / category / page>1) consolidate to the base
    // canonical and are noindex'd so they don't create duplicate, low-value indexable URLs.
    const hasFacets = !!(searchParams?.q || searchParams?.sort || searchParams?.brand
        || searchParams?.category || Number(searchParams?.page) > 1);
    return {
        title: 'Catalogue',
        description: 'Browse and search genuine & OEM-quality auto spare parts by part number, brand, or vehicle. Filter by category, brand and availability.',
        alternates: { canonical: '/catalogue' },
        ...(hasFacets ? { robots: { index: false, follow: true } } : {}),
    };
}

export default async function CataloguePage({ searchParams }) {
    const q = searchParams?.q || '';
    const category = searchParams?.category || '';
    const brand = searchParams?.brand || '';
    const sort = searchParams?.sort || '';
    const requestedPage = Number(searchParams?.page);
    const page = Number.isFinite(requestedPage) ? Math.max(1, Math.floor(requestedPage)) : 1;

    const [productsResult, filtersResult] = await Promise.allSettled([
        fetchAllProducts({ q, categorySlug: category, brandId: brand, sort, page, limit: 24 }),
        fetchFilters(),
    ]);
    const products = productsResult.status === 'fulfilled' ? productsResult.value.products : [];
    const pagination = productsResult.status === 'fulfilled' ? productsResult.value.pagination : null;
    const filters = filtersResult.status === 'fulfilled' ? filtersResult.value : { categories: [], brands: [] };
    const apiDown = productsResult.status === 'rejected';

    if (pagination?.totalPages > 0 && page > pagination.totalPages) {
        const params = new URLSearchParams();
        Object.entries({ q, category, brand, sort, page: pagination.totalPages })
            .forEach(([key, value]) => { if (value) params.set(key, String(value)); });
        redirect(`/catalogue?${params.toString()}`);
    }

    const count = pagination?.total ?? products.length;
    const allCats = (filters.categories || []).filter((c) => c.slug && !/test/i.test(c.name || ''));
    // Top-level pills only; a second "sub-category" row appears for the selected parent (or the
    // parent of the selected child). Selecting a child keeps its parent's pill highlighted.
    const tree = buildCategoryTree(allCats);
    const selected = allCats.find((c) => c.slug === category) || null;
    const activeParentId = selected ? (selected.parentId || selected.id) : null;
    const activeParent = tree.find((t) => t.id === activeParentId) || null;
    const subCats = activeParent ? activeParent.children : [];

    // Preserve q/brand/sort when switching category via a pill.
    const withParams = (over) => {
        const p = new URLSearchParams();
        Object.entries({ q, category, brand, sort, ...over }).forEach(([k, v]) => { if (v) p.set(k, String(v)); });
        const s = p.toString();
        return `/catalogue${s ? `?${s}` : ''}`;
    };
    const mkPageLink = (n) => withParams({ page: n });

    return (
        <>
            {/* Showroom hero */}
            <div className="container-x pt-6">
                <div className="relative overflow-hidden rounded-[24px] bg-neutral-950 text-white p-6 pb-8 md:p-10 md:pb-12 min-h-[200px] md:min-h-[250px]">
                    <div className="absolute right-0 top-0 bottom-0 w-[55%] md:w-[48%] pointer-events-none select-none z-0 overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-r from-neutral-950 via-neutral-950/70 to-transparent z-10" />
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src="/assets/sections/featured_car.png" alt="Sports car headlight close-up" className="w-full h-full object-cover object-right opacity-70 z-0 mix-blend-screen" />
                    </div>
                    <div className="relative z-20 flex flex-col justify-between h-full">
                        <div className="flex items-center gap-1.5 text-[11px] font-medium text-neutral-400 tracking-wide mb-3 md:mb-5">
                            <Link href="/" className="hover:text-white transition-colors">Home</Link>
                            <span>&gt;</span>
                            <span className="text-white">Catalogue</span>
                        </div>
                        <h1 className="text-xl sm:text-2xl md:text-[40px] font-black font-display tracking-tight leading-[1.05] max-w-[75%] md:max-w-[50%] text-white">
                            {q ? <>Results for<br className="md:hidden" /> &ldquo;{q}&rdquo;</> : <>Find the Right Part<br className="md:hidden" /> for Your Vehicle</>}
                        </h1>
                        <p className="hidden md:block mt-3.5 text-xs sm:text-sm text-neutral-400 font-medium max-w-[45%] leading-[1.4]">
                            Search by name or part number and filter by category, brand and availability. Every part is fitment-verified before it ships.
                        </p>
                        <HeroSearch initial={q} />
                    </div>
                </div>
            </div>

            <section className="bg-white py-8 md:py-12">
                <div className="container-x">
                    {/* Toolbar: count + brand/sort */}
                    <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-neutral-100 pb-5">
                        <p className="text-sm text-neutral-500 font-medium">
                            <span className="font-black text-neutral-950 text-base">{count}</span> part{count === 1 ? '' : 's'} found
                        </p>
                        <FilterBar categories={filters.categories} brands={filters.brands} current={{ q, category, brand, sort }} hideSearch hideCategory />
                    </div>

                    {/* Category pills — top level only */}
                    {tree.length > 0 && (
                        <div className="mb-4 flex gap-3 overflow-x-auto no-scrollbar pb-3 scroll-smooth">
                            <Link href={withParams({ category: '' })} className={`px-5 py-2.5 rounded-[16px] border text-xs sm:text-sm font-black shrink-0 shadow-sm transition-all ${!category ? 'border-neutral-950 bg-neutral-950 text-white' : 'border-neutral-200 bg-white text-neutral-800 hover:bg-neutral-50 hover:border-neutral-300'}`}>
                                All
                            </Link>
                            {tree.map((c) => {
                                const active = activeParentId === c.id;
                                return (
                                    <Link key={c.id} href={withParams({ category: active ? '' : c.slug })} className={`px-5 py-2.5 rounded-[16px] border text-xs sm:text-sm font-black shrink-0 shadow-sm transition-all ${active ? 'border-neutral-950 bg-neutral-950 text-white' : 'border-neutral-200 bg-white text-neutral-800 hover:bg-neutral-50 hover:border-neutral-300'}`}>
                                        {c.name}
                                    </Link>
                                );
                            })}
                        </div>
                    )}

                    {/* Sub-category chip row — children of the selected/active parent */}
                    {subCats.length > 0 && activeParent && (
                        <div className="mb-8 flex flex-wrap items-center gap-2.5">
                            <Link
                                href={withParams({ category: activeParent.slug })}
                                className={`inline-flex items-center rounded-full border px-3.5 py-1.5 text-xs font-bold transition-colors ${category === activeParent.slug ? 'border-[#EF4444] bg-[#FEF2F2] text-[#EF4444]' : 'border-neutral-200 bg-white text-neutral-600 hover:border-neutral-400 hover:text-neutral-900'}`}
                            >
                                All {activeParent.name}
                            </Link>
                            {subCats.map((ch) => {
                                const active = category === ch.slug;
                                return (
                                    <Link
                                        key={ch.id}
                                        href={withParams({ category: active ? activeParent.slug : ch.slug })}
                                        className={`inline-flex items-center rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-colors ${active ? 'border-[#EF4444] bg-[#FEF2F2] text-[#EF4444]' : 'border-neutral-200 bg-white text-neutral-600 hover:border-neutral-400 hover:text-neutral-900'}`}
                                    >
                                        {ch.name}
                                    </Link>
                                );
                            })}
                        </div>
                    )}

                    {/* Results */}
                    {products.length > 0 ? (
                        <ResponsiveProductGrid
                            products={products}
                            mobileVariant="compact"
                            desktopVariant="large"
                            desktopColumns="catalogue"
                        />
                    ) : apiDown ? (
                        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-neutral-300 py-20 text-center">
                            <h3 className="font-display text-xl font-bold text-ink">We couldn&apos;t load the catalogue</h3>
                            <p className="mt-2 max-w-sm text-sm text-neutral-500">There was a problem reaching our catalog. Please try again in a moment — or tell us the part you need and we&apos;ll source it for you.</p>
                            <div className="mt-6 flex flex-wrap justify-center gap-3">
                                <Link href="/catalogue" className="btn btn-outline px-6 py-3">Try again</Link>
                                <a href={genericWaLink()} target="_blank" rel="noopener noreferrer" className="btn btn-wa px-6 py-3">Ask on WhatsApp</a>
                            </div>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-neutral-300 py-20 text-center">
                            <h3 className="font-display text-xl font-bold text-ink">No parts match your search</h3>
                            <p className="mt-2 max-w-sm text-sm text-neutral-500">We supply far more than what&apos;s listed here. Tell us the part you need and we&apos;ll source it for you.</p>
                            <div className="mt-6 flex flex-wrap justify-center gap-3">
                                <Link href="/catalogue" className="btn btn-outline px-6 py-3">Clear filters</Link>
                                <a href={genericWaLink()} target="_blank" rel="noopener noreferrer" className="btn btn-wa px-6 py-3">Ask on WhatsApp</a>
                            </div>
                        </div>
                    )}

                    {pagination && pagination.totalPages > 1 && (
                        <div className="mt-8 flex items-center justify-center gap-3 text-sm">
                            {page > 1 && <Link href={mkPageLink(page - 1)} className="btn btn-outline py-2">← Prev</Link>}
                            <span className="text-neutral-500">Page {page} of {pagination.totalPages}</span>
                            {page < pagination.totalPages && <Link href={mkPageLink(page + 1)} className="btn btn-outline py-2">Next →</Link>}
                        </div>
                    )}
                </div>
            </section>
        </>
    );
}
