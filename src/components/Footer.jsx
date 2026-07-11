import Link from 'next/link';
import { siteConfig, navLinks } from '@/config/siteConfig';

export function Footer() {
    return (
        <footer className="mt-16 border-t border-neutral-200 bg-white">
            <div className="container-x py-12 grid grid-cols-2 md:grid-cols-5 gap-8">
                <div className="col-span-2">
                    <div className="font-display font-extrabold text-lg text-ink">{siteConfig.brand.name}<span className="text-accent-500">.</span></div>
                    <p className="mt-2 text-sm text-neutral-500 max-w-sm">{siteConfig.brand.tagline}</p>
                    <p className="mt-4 text-sm text-neutral-500">{siteConfig.contact.address}</p>
                    <p className="text-sm text-neutral-500">{siteConfig.contact.hours}</p>
                </div>
                <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-500 mb-3">Explore</h4>
                    <ul className="space-y-2 text-sm">
                        {navLinks.map((l) => (
                            <li key={l.to}><Link href={l.to} className="text-neutral-600 hover:text-accent-500">{l.label}</Link></li>
                        ))}
                    </ul>
                </div>
                <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-500 mb-3">Help</h4>
                    <ul className="space-y-2 text-sm">
                        <li><Link href="/faqs" className="text-neutral-600 hover:text-accent-500">FAQs</Link></li>
                        <li><Link href="/returns" className="text-neutral-600 hover:text-accent-500">Returns &amp; Warranty</Link></li>
                        <li><Link href="/wishlist" className="text-neutral-600 hover:text-accent-500">Wishlist</Link></li>
                        <li><Link href="/account" className="text-neutral-600 hover:text-accent-500">Account</Link></li>
                    </ul>
                </div>
                <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-500 mb-3">Contact</h4>
                    <ul className="space-y-2 text-sm text-neutral-600">
                        <li><a href={`tel:${siteConfig.contact.phoneNumber}`} className="hover:text-accent-500">{siteConfig.contact.phoneDisplay}</a></li>
                        <li><a href={`mailto:${siteConfig.contact.email}`} className="hover:text-accent-500">{siteConfig.contact.email}</a></li>
                        <li><Link href="/track" className="hover:text-accent-500">Track your order</Link></li>
                    </ul>
                </div>
            </div>
            <div className="border-t border-neutral-100 py-4 text-center text-xs text-neutral-500">
                © {siteConfig.brand.foundedYear} {siteConfig.brand.legalName}. All rights reserved.
            </div>
        </footer>
    );
}
