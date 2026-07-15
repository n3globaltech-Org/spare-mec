import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { fetchAllProducts, fetchCategories } from '@/lib/catalog';
import { ProductGrid } from '@/components/ProductGrid';
import { genericWaLink } from '@/lib/whatsapp';

const SITE = process.env.NEXT_PUBLIC_SITE_URL || 'https://sparemec.ae';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params, searchParams }) {
    try {
        const cats = await fetchCategories();
        const c = cats.find((x) => x.slug === params.slug);
        // Unknown slug (API reachable) → don't index a soft-404.
        if (!c) return { title: 'Category', robots: { index: false } };
        return {
            title: c.name,
            description: `Shop ${c.name} — genuine & OEM-quality auto spare parts.`,
            alternates: { canonical: `/category/${params.slug}` },
            ...(Number(searchParams?.page) > 1 ? { robots: { index: false, follow: true } } : {}),
        };
    } catch {
        return {};
    }
}

export default async function CategoryPage({ params, searchParams }) {
    const requestedPage = Number(searchParams?.page);
    const page = Number.isFinite(requestedPage) ? Math.max(1, Math.floor(requestedPage)) : 1;
    // Distinguish a genuine "no such category" (→ real 404) from an API outage (→ error state).
    // `null` means the fetch failed; an empty array means "reachable but no such category".
    const [categoriesResult, productsResult] = await Promise.allSettled([
        fetchCategories(),
        fetchAllProducts({ categorySlug: params.slug, page, limit: 24 }),
    ]);
    const cats = categoriesResult.status === 'fulfilled' ? categoriesResult.value : null;
    const category = cats ? cats.find((c) => c.slug === params.slug) : null;
    if (cats && !category) notFound();

    // Hierarchy context for breadcrumb and sub-nav chips.
    const isReal = (c) => c.slug && !/test/i.test(c.name || '');
    const parent = category?.parentId && cats ? cats.find((c) => c.id === category.parentId) || null : null;
    const children = cats && category ? cats.filter((c) => c.parentId === category.id).filter(isReal) : [];
    const siblings = parent && cats ? cats.filter((c) => c.parentId === parent.id).filter(isReal) : [];
    // Drill-down when viewing a parent (its children); sibling nav when viewing a child.
    const subNav = children.length ? children : siblings;
    const subParent = children.length ? category : parent; // "All X" target for the chip row

    const products = productsResult.status === 'fulfilled' ? productsResult.value.products : null;
    const pagination = productsResult.status === 'fulfilled' ? productsResult.value.pagination : null;

    if (pagination?.totalPages > 0 && page > pagination.totalPages) {
        redirect(`/category/${params.slug}?page=${pagination.totalPages}`);
    }

    const apiDown = cats === null || products === null;
    const name = category?.name || params.slug;

    const collectionJsonLd = category ? {
        '@context': 'https://schema.org',
        '@type': 'CollectionPage',
        name: category.name,
        url: `${SITE}/category/${params.slug}`,
    } : null;
    // Breadcrumb trail: Home › Categories › [Parent] › Current.
    const crumbs = [
        { label: 'Home', href: '/' },
        { label: 'Categories', href: '/categories' },
        ...(parent ? [{ label: parent.name, href: `/category/${parent.slug}` }] : []),
        { label: name, href: `/category/${params.slug}` },
    ];
    const breadcrumbJsonLd = {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: crumbs.map((c, i) => ({ '@type': 'ListItem', position: i + 1, name: c.label, item: `${SITE}${c.href}` })),
    };

    const chipCls = (on) => `inline-flex items-center rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-colors ${on ? 'border-[#EF4444] bg-[#FEF2F2] text-[#EF4444]' : 'border-neutral-200 bg-white text-neutral-600 hover:border-neutral-400 hover:text-neutral-900'}`;

    return (
        <div className="container-x py-8">
            {collectionJsonLd && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionJsonLd) }} />}
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />

            {/* Breadcrumb */}
            <nav className="mb-5 flex flex-wrap items-center gap-1.5 text-xs text-neutral-500">
                {crumbs.map((c, i) => (
                    <span key={c.href} className="flex items-center gap-1.5">
                        {i < crumbs.length - 1
                            ? <Link href={c.href} className="hover:text-[#EF4444] transition-colors">{c.label}</Link>
                            : <span className="font-semibold text-neutral-800">{c.label}</span>}
                        {i < crumbs.length - 1 && <span className="text-neutral-300">/</span>}
                    </span>
                ))}
            </nav>


            {/* Active category header */}
            <div className="mb-5 flex flex-wrap items-end justify-between gap-3 border-b border-neutral-100 pb-4">
                <div className="min-w-0">
                    {parent && <p className="text-[11px] font-bold uppercase tracking-wide text-neutral-400">{parent.name}</p>}
                    <h1 className="font-display text-2xl md:text-3xl font-black tracking-tight text-neutral-950">{category?.name || 'Category'}</h1>
                </div>
                {!apiDown && (
                    <p className="text-sm text-neutral-500"><span className="font-black text-neutral-950">{pagination?.total ?? products.length}</span> part{(pagination?.total ?? products.length) === 1 ? '' : 's'}</p>
                )}
            </div>

            {/* Sub-category / sibling chip row */}
            {subNav.length > 0 && subParent && (
                <div className="mb-6 flex flex-wrap items-center gap-2.5">
                    <Link href={`/category/${subParent.slug}`} className={chipCls(params.slug === subParent.slug) + ' font-bold'}>All {subParent.name}</Link>
                    {subNav.map((ch) => (
                        <Link key={ch.id} href={`/category/${ch.slug}`} className={chipCls(params.slug === ch.slug)}>{ch.name}</Link>
                    ))}
                </div>
            )}

            {/* Products */}
            {apiDown ? (
                <div className="py-16 text-center text-neutral-600">
                    <p className="mb-1 font-semibold text-neutral-800">We couldn&apos;t load this category right now.</p>
                    <p className="mb-4 text-sm text-neutral-500">There was a problem reaching our catalog. Please try again in a moment.</p>
                    <a href={genericWaLink()} target="_blank" rel="noopener noreferrer" className="btn btn-wa">Ask us on WhatsApp</a>
                </div>
            ) : products.length > 0 ? (
                <ProductGrid products={products} variant="large" desktopColumns="catalogue" />
            ) : (
                <div className="py-16 text-center text-neutral-600">
                    <p className="mb-3">No products in this category yet.</p>
                    <a href={genericWaLink()} target="_blank" rel="noopener noreferrer" className="btn btn-wa">Ask us on WhatsApp</a>
                </div>
            )}

            {pagination && pagination.totalPages > 1 && (
                <nav className="mt-10 flex items-center justify-center gap-3 text-sm" aria-label="Category pagination">
                    {page > 1 && <Link href={`/category/${params.slug}?page=${page - 1}`} className="btn btn-outline py-2">← Previous</Link>}
                    <span className="text-neutral-500">Page {page} of {pagination.totalPages}</span>
                    {page < pagination.totalPages && <Link href={`/category/${params.slug}?page=${page + 1}`} className="btn btn-outline py-2">Next →</Link>}
                </nav>
            )}
        </div>
    );
}
