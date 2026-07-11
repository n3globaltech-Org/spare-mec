import Link from 'next/link';
import { notFound } from 'next/navigation';
import { fetchAllProducts, fetchCategories } from '@/lib/catalog';
import { ProductCard } from '@/components/ProductCard';
import { genericWaLink } from '@/lib/whatsapp';

const SITE = process.env.NEXT_PUBLIC_SITE_URL || 'https://sparemec.ae';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }) {
    try {
        const cats = await fetchCategories();
        const c = cats.find((x) => x.slug === params.slug);
        // Unknown slug (API reachable) → don't index a soft-404.
        if (!c) return { title: 'Category', robots: { index: false } };
        return {
            title: c.name,
            description: `Shop ${c.name} — genuine & OEM-quality auto spare parts.`,
            alternates: { canonical: `/category/${params.slug}` },
        };
    } catch {
        return {};
    }
}

export default async function CategoryPage({ params }) {
    // Distinguish a genuine "no such category" (→ real 404) from an API outage (→ error state).
    // Turning an outage into a 404 would deindex a real category; turning it into a misleading
    // "empty" state is confusing. `null` means the fetch failed.
    let cats = null;
    try { cats = await fetchCategories(); } catch { cats = null; }
    const category = cats ? cats.find((c) => c.slug === params.slug) : null;
    if (cats && !category) notFound();

    // Hierarchy context for breadcrumb + sub-nav.
    const parent = category?.parentId && cats ? cats.find((c) => c.id === category.parentId) || null : null;
    const children = cats && category ? cats.filter((c) => c.parentId === category.id) : [];
    const siblings = parent && cats ? cats.filter((c) => c.parentId === parent.id) : [];
    // Drill-down when viewing a parent (its children); sibling nav when viewing a child.
    const subNav = children.length ? children : siblings;
    const subParent = children.length ? category : parent; // the "All X" target for the chip row

    let products = null;
    try {
        const r = await fetchAllProducts({ categorySlug: params.slug, limit: 48 });
        products = r.products;
    } catch { products = null; }

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

    return (
        <div className="container-x py-8">
            {collectionJsonLd && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionJsonLd) }} />}
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />

            <nav className="text-xs text-neutral-500 mb-2 flex flex-wrap items-center gap-1.5">
                {crumbs.map((c, i) => (
                    <span key={c.href} className="flex items-center gap-1.5">
                        {i < crumbs.length - 1
                            ? <Link href={c.href} className="hover:text-accent-500">{c.label}</Link>
                            : <span className="text-neutral-800 font-semibold">{c.label}</span>}
                        {i < crumbs.length - 1 && <span className="text-neutral-300">/</span>}
                    </span>
                ))}
            </nav>
            <h1 className="text-2xl font-display font-bold mb-4">{category?.name || 'Category'}</h1>

            {/* Sub-category / sibling chip row */}
            {subNav.length > 0 && subParent && (
                <div className="mb-6 flex flex-wrap items-center gap-2.5">
                    <Link
                        href={`/category/${subParent.slug}`}
                        className={`inline-flex items-center rounded-full border px-3.5 py-1.5 text-xs font-bold transition-colors ${params.slug === subParent.slug ? 'border-[#EF4444] bg-[#FEF2F2] text-[#EF4444]' : 'border-neutral-200 bg-white text-neutral-600 hover:border-neutral-400 hover:text-neutral-900'}`}
                    >
                        All {subParent.name}
                    </Link>
                    {subNav.map((ch) => (
                        <Link
                            key={ch.id}
                            href={`/category/${ch.slug}`}
                            className={`inline-flex items-center rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-colors ${params.slug === ch.slug ? 'border-[#EF4444] bg-[#FEF2F2] text-[#EF4444]' : 'border-neutral-200 bg-white text-neutral-600 hover:border-neutral-400 hover:text-neutral-900'}`}
                        >
                            {ch.name}
                        </Link>
                    ))}
                </div>
            )}

            {apiDown ? (
                <div className="py-16 text-center text-neutral-600">
                    <p className="mb-1 font-semibold text-neutral-800">We couldn&apos;t load this category right now.</p>
                    <p className="mb-4 text-sm text-neutral-500">There was a problem reaching our catalog. Please try again in a moment.</p>
                    <a href={genericWaLink()} target="_blank" rel="noopener noreferrer" className="btn btn-wa">Ask us on WhatsApp</a>
                </div>
            ) : products.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {products.map((p) => <ProductCard key={p.id} product={p} />)}
                </div>
            ) : (
                <div className="py-16 text-center text-neutral-600">
                    <p className="mb-3">No products in this category yet.</p>
                    <a href={genericWaLink()} target="_blank" rel="noopener noreferrer" className="btn btn-wa">Ask us on WhatsApp</a>
                </div>
            )}
        </div>
    );
}
