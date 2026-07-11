/** @type {import('next').NextConfig} */

const { PHASE_PRODUCTION_BUILD } = require('next/constants');

// Derive the public API origin so client-side calls (React Query, order intake) pass CSP connect-src.
let apiOrigin = '';
try { apiOrigin = new URL(process.env.NEXT_PUBLIC_API_URL || '').origin; } catch { /* no/invalid API URL at build */ }

// Pragmatic CSP. Tighten img-src/connect-src to specific hosts once media + API hosts are fixed.
// 'unsafe-inline' on script/style is required by Next's hydration bootstrap + Tailwind/slick inline
// styles without a nonce pipeline; everything else is locked down.
const csp = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' https://www.googletagmanager.com",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com data:",
    "img-src 'self' data: blob: https:",
    `connect-src 'self' https://www.google-analytics.com${apiOrigin ? ' ' + apiOrigin : ''}`,
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "object-src 'none'",
    'upgrade-insecure-requests',
].join('; ');

const securityHeaders = [
    { key: 'Content-Security-Policy', value: csp },
    { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
    { key: 'X-Content-Type-Options', value: 'nosniff' },
    { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
    { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
    { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(), interest-cohort=()' },
    { key: 'X-DNS-Prefetch-Control', value: 'on' },
];

const nextConfig = {
    reactStrictMode: true,
    poweredByHeader: false,
    images: {
        // Product images come from the tenant CDN. Prefer setting NEXT_PUBLIC_MEDIA_HOST to your
        // exact media host in production and narrowing this list to it.
        remotePatterns: [
            ...(process.env.NEXT_PUBLIC_MEDIA_HOST
                ? [{ protocol: 'https', hostname: process.env.NEXT_PUBLIC_MEDIA_HOST }]
                : []),
            { protocol: 'https', hostname: '**.amazonaws.com' },
            { protocol: 'https', hostname: 'res.cloudinary.com' },
            { protocol: 'https', hostname: '**.cloudfront.net' },
        ],
    },
    async headers() {
        return [{ source: '/:path*', headers: securityHeaders }];
    },
    // Preserve inbound links / SEO from the old CRA storefront's legacy paths.
    async redirects() {
        return [
            { source: '/aboutus', destination: '/about', permanent: true },
            { source: '/products', destination: '/catalogue', permanent: true },
            { source: '/shop', destination: '/catalogue', permanent: true },
        ];
    },
};

module.exports = (phase) => {
    // H2/H3 launch gate: a production build MUST bake in a valid NEXT_PUBLIC_API_URL. Without it,
    // the deployed storefront ships a CSP that blocks every client API call (H2) and fetches that
    // silently fall back to localhost (H3) — i.e. an empty store. Fail the build loudly instead.
    // Dev/start are unaffected (dev intentionally falls back to localhost).
    if (phase === PHASE_PRODUCTION_BUILD && !apiOrigin) {
        throw new Error(
            '[storefront build] NEXT_PUBLIC_API_URL is missing or invalid.\n' +
            'Set it to your API origin (e.g. https://api.yourdomain.com/api) before running `next build`.\n' +
            'Otherwise the deployed site\'s CSP blocks all API calls and fetches fall back to localhost (empty store).'
        );
    }
    return nextConfig;
};
