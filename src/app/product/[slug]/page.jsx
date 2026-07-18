import { notFound } from 'next/navigation';
import { fetchProduct, fetchRelated } from '@/lib/catalog';
import { formatMoney } from '@/lib/money';
import { ProductActions } from '@/components/ProductActions';
import { ResponsiveProductGrid } from '@/components/ProductGrid';
import { ProductGallery } from '@/components/ProductGallery';
import Breadcrumbs from '@/components/ui/Breadcrumbs';
import AvailabilityBadge from '@/components/ui/AvailabilityBadge';

const SITE = process.env.NEXT_PUBLIC_SITE_URL || 'https://sparemec.ae';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }) {
    try {
        const p = await fetchProduct(params.slug);
        if (!p) return { title: 'Product not found' };
        const title = p.seo?.title || p.name;
        const description = p.seo?.description || p.shortDescription || `${p.name}${p.brand ? ' — ' + p.brand : ''}`;
        return {
            title,
            description,
            alternates: { canonical: `/product/${p.slug}` },
            openGraph: { title, description, images: p.image ? [p.image] : [] },
        };
    } catch {
        return {};
    }
}

export default async function ProductPage({ params }) {
    let product = null;
    let related = [];
    try {
        product = await fetchProduct(params.slug);
    } catch (e) {
        // A genuine "no such product" (404) should render the 404 page. But an API outage / 5xx
        // must NOT be turned into a 404 — that would deindex a real product. Re-throw so it
        // surfaces as a 5xx (which crawlers retry) instead of a soft-404.
        if (e?.response?.status === 404) notFound();
        throw e;
    }
    if (!product) notFound();
    try { related = await fetchRelated(params.slug); } catch { /* optional */ }

    const showPrice = product.price != null && !product.priceOnRequest;

    const crumbs = [
        { label: 'Home', to: '/' },
        { label: 'Catalogue', to: '/catalogue' },
        ...(product.categoryName ? [{ label: product.categoryName, to: product.category ? `/category/${product.category}` : '/catalogue' }] : []),
        { label: product.name },
    ];

    const jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'Product',
        name: product.name,
        sku: product.sku || undefined,
        mpn: product.partNumber || undefined,
        brand: product.brand ? { '@type': 'Brand', name: product.brand } : undefined,
        description: product.shortDescription || product.description || undefined,
        image: product.images?.length ? product.images : (product.image ? [product.image] : undefined),
        offers: showPrice
            ? {
                '@type': 'Offer',
                price: product.price,
                priceCurrency: product.currency,
                availability: product.inStock ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
            }
            : undefined,
    };

    const breadcrumbJsonLd = {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: crumbs.map((c, i) => ({
            '@type': 'ListItem',
            position: i + 1,
            name: c.label,
            item: c.to ? `${SITE}${c.to}` : undefined,
        })),
    };

    return (
        <div className="pb-24 md:pb-0">
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />

            <div className="container-x pt-6">
                <Breadcrumbs items={crumbs} />
            </div>

            <div className="container-x py-8 grid grid-cols-1 md:grid-cols-2 gap-8">
                <ProductGallery
                    images={product.images}
                    primaryImage={product.image}
                    productName={product.name}
                />

                <div>
                    {product.brand && <div className="eyebrow">{product.brand}</div>}
                    <h1 className="mt-2 text-2xl md:text-3xl font-display font-extrabold text-ink">{product.name}</h1>
                    {product.partNumber && (
                        <div className="mt-1 text-sm text-neutral-500 font-mono">
                            Part No: {product.partNumber}{product.oemNumber ? ` · OEM: ${product.oemNumber}` : ''}
                        </div>
                    )}
                    <div className="mt-4 text-2xl font-bold">
                        {showPrice ? formatMoney(product.price, product.currency) : <span className="text-accent-500 text-xl">Best price on request</span>}
                        {showPrice && product.compareAtPrice != null && product.compareAtPrice > product.price && (
                            <span className="ml-2 text-base text-neutral-400 line-through">{formatMoney(product.compareAtPrice, product.currency)}</span>
                        )}
                    </div>
                    <div className="mt-2">
                        <AvailabilityBadge availability={product.inStock ? 'In Stock' : 'Made to Order'} />
                    </div>
                    {product.shortDescription && <p className="mt-4 text-neutral-600">{product.shortDescription}</p>}

                    <ProductActions product={product} />

                    {product.highlights?.length > 0 && (
                        <ul className="mt-5 space-y-1.5">
                            {product.highlights.map((h, i) => (
                                <li key={i} className="text-sm text-neutral-600 flex gap-2"><span className="text-accent-500">✓</span>{h}</li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>

            <div className="container-x grid grid-cols-1 md:grid-cols-2 gap-8 pb-8">
                {product.description && (
                    <div>
                        <h2 className="font-display font-bold text-lg mb-2">Description</h2>
                        <p className="text-neutral-600 whitespace-pre-line">{product.description}</p>
                    </div>
                )}
                {product.specs?.length > 0 && (
                    <div>
                        <h2 className="font-display font-bold text-lg mb-2">Specifications</h2>
                        <dl className="text-sm divide-y divide-neutral-100 border border-neutral-100 rounded-xl overflow-hidden">
                            {product.specs.map((s, i) => (
                                <div key={i} className="flex justify-between px-3 py-2"><dt className="text-neutral-500">{s.label}</dt><dd className="text-ink font-medium">{s.value}</dd></div>
                            ))}
                        </dl>
                    </div>
                )}
                {product.fitment?.length > 0 && (
                    <div>
                        <h2 className="font-display font-bold text-lg mb-2">Vehicle Fitment</h2>
                        <ul className="text-sm text-neutral-600 space-y-1">
                            {product.fitment.map((f, i) => <li key={i}>• {f}</li>)}
                        </ul>
                    </div>
                )}
            </div>

            {related.length > 0 && (
                <div className="container-x py-8">
                    <h2 className="text-xl font-display font-bold mb-4">Related Products</h2>
                    <ResponsiveProductGrid products={related} />
                </div>
            )}
        </div>
    );
}
