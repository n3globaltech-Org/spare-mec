import './globals.css';
import { Providers } from './providers';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { WhatsAppFloat } from '@/components/WhatsAppFloat';
import { MecAssist } from '@/components/MecAssist';
import { Analytics } from '@/components/Analytics';
import { siteConfig } from '@/config/siteConfig';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://sparemec.ae';

export const metadata = {
    metadataBase: new URL(SITE_URL),
    title: {
        default: `${siteConfig.brand.fullName} — Genuine & OEM Auto Spare Parts`,
        template: `%s | ${siteConfig.brand.name}`,
    },
    description: siteConfig.brand.tagline,
    openGraph: {
        type: 'website',
        siteName: siteConfig.brand.fullName,
        title: siteConfig.brand.fullName,
        description: siteConfig.brand.tagline,
        url: SITE_URL,
        // Default share image. Replace with a purpose-built 1200×630 OG asset when available.
        images: [{ url: '/assets/sections/featured_car.png', alt: siteConfig.brand.fullName }],
    },
    twitter: {
        card: 'summary_large_image',
        title: siteConfig.brand.fullName,
        description: siteConfig.brand.tagline,
        images: ['/assets/sections/featured_car.png'],
    },
    robots: { index: true, follow: true },
    // Google Search Console verification — set NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION in prod.
    verification: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION
        ? { google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION }
        : undefined,
};

// Site-wide structured data (Organization + WebSite) — improves brand knowledge panel eligibility.
const orgJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: siteConfig.brand.fullName,
    legalName: siteConfig.brand.legalName,
    url: SITE_URL,
    logo: `${SITE_URL}/icon.svg`,
    telephone: `+${siteConfig.contact.phoneNumber}`,
    email: siteConfig.contact.email,
    address: { '@type': 'PostalAddress', addressLocality: 'Dubai', addressCountry: 'AE' },
    sameAs: [siteConfig.social.instagram, siteConfig.social.facebook, siteConfig.social.tiktok, siteConfig.social.youtube].filter(Boolean),
};
const websiteJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: siteConfig.brand.name,
    url: SITE_URL,
    potentialAction: {
        '@type': 'SearchAction',
        target: `${SITE_URL}/catalogue?q={search_term_string}`,
        'query-input': 'required name=search_term_string',
    },
};

export default function RootLayout({ children }) {
    return (
        <html lang="en">
            <body>
                <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJsonLd) }} />
                <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }} />
                <Providers>
                    <Navbar />
                    <main className="min-h-screen">{children}</main>
                    <Footer />
                    <MecAssist />
                    <WhatsAppFloat />
                </Providers>
                <Analytics />
            </body>
        </html>
    );
}
