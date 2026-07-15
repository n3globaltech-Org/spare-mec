/** @type {import('next').NextConfig} */

const { PHASE_PRODUCTION_BUILD, PHASE_DEVELOPMENT_SERVER } = require('next/constants');

// Derive the public API origin so client-side calls (React Query, order intake) pass CSP connect-src.
// Kept as '' when unset so the production-build gate below can fail loudly; dev adds localhost:5000
// explicitly (the api client's dev fallback) so browser calls aren't CSP-blocked locally.
let apiOrigin = '';
try { apiOrigin = new URL(process.env.NEXT_PUBLIC_API_URL || '').origin; } catch { /* no/invalid API URL at build */ }

module.exports = (phase) => {
    const isDev = phase === PHASE_DEVELOPMENT_SERVER;

    // Pragmatic CSP. 'unsafe-inline' on script/style is required by Next's hydration bootstrap +
    // Tailwind/slick inline styles without a nonce pipeline. In DEVELOPMENT we additionally allow
    // 'unsafe-eval' (React Fast Refresh), the HMR websocket (ws://localhost:3001) and the local API
    // (http://localhost:5000), and we DROP upgrade-insecure-requests — otherwise the browser upgrades
    // ws:// → wss:// and http → https on localhost and breaks HMR + local API calls (forcing a manual
    // restart on every edit). Production stays locked down.
    const csp = [
        "default-src 'self'",
        `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ''} https://www.googletagmanager.com`,
        "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
        "font-src 'self' https://fonts.gstatic.com data:",
        "img-src 'self' data: blob: https:",
        `connect-src 'self' https://www.google-analytics.com${isDev ? ' ws://localhost:3001 http://localhost:5000' : ''}${apiOrigin ? ' ' + apiOrigin : ''}`,
        "frame-ancestors 'none'",
        "base-uri 'self'",
        "form-action 'self'",
        "object-src 'none'",
        ...(isDev ? [] : ['upgrade-insecure-requests']),
    ].join('; ');

    const securityHeaders = [
        { key: 'Content-Security-Policy', value: csp },
        // HSTS only in production — no point (and confusing) on http://localhost.
        ...(isDev ? [] : [{ key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' }]),
        { key: 'X-Content-Type-Options', value: 'nosniff' },
        { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
        { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
        { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(), interest-cohort=()' },
        { key: 'X-DNS-Prefetch-Control', value: 'on' },
    ];

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

    const nextConfig = {
        // Keep `next dev` and `next build` from deleting/replacing each other's
        // webpack packs when both are used during local development.
        distDir: isDev ? '.next-dev' : '.next',
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
    return nextConfig;
};
