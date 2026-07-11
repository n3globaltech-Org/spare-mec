import { FaWhatsapp } from 'react-icons/fa';
import { siteConfig } from '@/config/siteConfig';
import { genericWaLink } from '@/lib/whatsapp';

export const metadata = {
    title: 'Returns & Warranty',
    description: 'Our returns, exchange, and warranty policy for auto spare parts.',
    alternates: { canonical: '/returns' },
};

const SECTIONS = [
    { title: 'Returns & exchanges', body: 'If a part is faulty, incorrect, or doesn’t fit, contact us within 7 days of delivery. Items must be unused, in original packaging, and accompanied by your Order ID. We’ll arrange a replacement, exchange, or refund.' },
    { title: 'Fitment guarantee', body: 'Tell us your vehicle or part number and we’ll confirm fitment before you order. If we confirm a fit and it doesn’t match, the return is on us.' },
    { title: 'Warranty', body: 'Genuine and OEM-quality parts carry the manufacturer’s warranty where applicable. Warranty terms are shown on the product where available.' },
    { title: 'How to start a return', body: 'Message us on WhatsApp with your Order ID and a short description (and a photo if it’s a fault). We’ll guide you through the next steps quickly.' },
];

export default function ReturnsPage() {
    return (
        <div className="container-x py-12 max-w-3xl">
            <h1 className="text-2xl md:text-3xl font-display font-bold">Returns &amp; warranty</h1>
            <p className="mt-2 text-neutral-500">Straightforward and fair — because ordering the right part should be risk-free.</p>

            <div className="mt-8 space-y-6">
                {SECTIONS.map((s) => (
                    <div key={s.title} className="card p-6">
                        <h2 className="font-display font-bold text-lg">{s.title}</h2>
                        <p className="mt-2 text-neutral-600 leading-relaxed">{s.body}</p>
                    </div>
                ))}
            </div>

            <div className="mt-8 text-center">
                <a href={genericWaLink()} target="_blank" rel="noopener noreferrer" className="btn btn-wa"><FaWhatsapp className="w-5 h-5" /> Start a return on WhatsApp</a>
            </div>
        </div>
    );
}
