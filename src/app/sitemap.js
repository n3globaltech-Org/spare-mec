import { fetchAllProducts, fetchCategories } from '@/lib/catalog';

const SITE = process.env.NEXT_PUBLIC_SITE_URL || 'https://sparemec.ae';

// Static routes + (best-effort) product/category URLs. If the API is unreachable at build,
// the catch keeps the static routes so the build never fails on it.
export default async function sitemap() {
    const staticPaths = ['', '/catalogue', '/categories', '/track', '/about', '/contact', '/faqs', '/returns'];
    const routes = staticPaths.map((p) => ({
        url: `${SITE}${p}`,
        changeFrequency: p === '' ? 'daily' : 'weekly',
        priority: p === '' ? 1 : 0.7,
    }));

    try {
        const [prodRes, cats] = await Promise.all([
            fetchAllProducts({ limit: 500 }).catch(() => ({ products: [] })),
            fetchCategories().catch(() => []),
        ]);
        for (const p of prodRes.products || []) {
            if (p.slug) routes.push({ url: `${SITE}/product/${p.slug}`, changeFrequency: 'weekly', priority: 0.8 });
        }
        for (const c of cats || []) {
            if (c.slug) routes.push({ url: `${SITE}/category/${c.slug}`, changeFrequency: 'weekly', priority: 0.6 });
        }
    } catch { /* API optional at build — static routes still emitted */ }

    return routes;
}
