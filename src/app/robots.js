const SITE = process.env.NEXT_PUBLIC_SITE_URL || 'https://sparemec.ae';

export default function robots() {
    return {
        rules: [{
            userAgent: '*',
            allow: '/',
            // Private / per-customer routes shouldn't be indexed.
            disallow: ['/checkout', '/order-confirmation', '/account'],
        }],
        sitemap: `${SITE}/sitemap.xml`,
    };
}
