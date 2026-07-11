import Link from 'next/link';
import { FaWhatsapp } from 'react-icons/fa';
import { FiSearch, FiHeart, FiClock } from 'react-icons/fi';
import { siteConfig } from '@/config/siteConfig';
import { genericWaLink } from '@/lib/whatsapp';

export const metadata = {
    title: 'Account',
    description: 'Track orders, save parts, and reorder — no account needed at Spare Mec.',
    alternates: { canonical: '/account' },
};

const TILES = [
    { icon: FiClock, title: 'Track an order', text: 'Check the status of any order with your Order ID — no login required.', href: '/track', cta: 'Track order' },
    { icon: FiHeart, title: 'Your wishlist', text: 'Parts you save are kept on this device, ready whenever you are.', href: '/wishlist', cta: 'View wishlist' },
    { icon: FiSearch, title: 'Find parts fast', text: 'Search by part number, name, or vehicle to reorder in seconds.', href: '/catalogue', cta: 'Browse catalogue' },
];

export default function AccountPage() {
    return (
        <div className="container-x py-12 max-w-3xl">
            <h1 className="text-2xl md:text-3xl font-display font-bold">Your account</h1>
            <p className="mt-2 text-neutral-500">
                No sign-up needed — order, track, and save parts as a guest. Just keep your Order ID to follow any order.
            </p>

            <div className="mt-8 grid sm:grid-cols-3 gap-4">
                {TILES.map((t) => (
                    <div key={t.title} className="card p-5 flex flex-col">
                        <t.icon className="w-6 h-6 text-accent-500" />
                        <h2 className="mt-3 font-semibold text-ink">{t.title}</h2>
                        <p className="mt-1 text-sm text-neutral-500 flex-1">{t.text}</p>
                        <Link href={t.href} className="mt-4 text-sm font-semibold text-accent-500 hover:underline">{t.cta} →</Link>
                    </div>
                ))}
            </div>

            <div className="mt-8 card p-6 bg-neutral-50 text-center">
                <p className="text-neutral-600">Prefer to order personally? We're one message away.</p>
                <a href={genericWaLink()} target="_blank" rel="noopener noreferrer" className="btn btn-wa mt-4"><FaWhatsapp className="w-5 h-5" /> Chat on WhatsApp</a>
                <p className="mt-4 text-xs text-neutral-500">Customer logins &amp; order history are coming soon.</p>
            </div>
        </div>
    );
}
