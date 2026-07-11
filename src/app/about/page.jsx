import Link from 'next/link';
import { FaWhatsapp } from 'react-icons/fa';
import { FiShield, FiTruck, FiTag, FiTool } from 'react-icons/fi';
import { siteConfig } from '@/config/siteConfig';
import { genericWaLink } from '@/lib/whatsapp';

export const metadata = {
    title: 'About',
    description: `About ${siteConfig.brand.fullName} — genuine & OEM-quality auto spare parts for luxury cars, serving the UAE and GCC.`,
    alternates: { canonical: '/about' },
};

const VALUES = [
    { icon: FiShield, title: 'Genuine & OEM-Quality', text: 'Every part is sourced for fit, reliability, and warranty — no compromises on quality.' },
    { icon: FiTag, title: 'Fair, Transparent Pricing', text: 'Clear prices online, and a quick best-price quote on WhatsApp when you need it.' },
    { icon: FiTruck, title: 'Fast Local Delivery', text: 'Based in Dubai and delivering across the UAE, with GCC shipping on request.' },
    { icon: FiTool, title: 'Fitment You Can Trust', text: 'Search by part number or vehicle so you order the exact part the first time.' },
];

export default function AboutPage() {
    return (
        <>
            <section className="bg-metal-radial text-white">
                <div className="container-x py-16 md:py-20 text-center">
                    <div className="eyebrow justify-center text-accent-400">Since {siteConfig.brand.foundedYear}</div>
                    <h1 className="mt-3 text-3xl md:text-5xl font-display font-extrabold text-balance">{siteConfig.brand.fullName}</h1>
                    <p className="mt-4 text-neutral-300 max-w-2xl mx-auto">{siteConfig.brand.tagline}. We help owners and workshops find the right spare parts for luxury and everyday vehicles — quickly, and at the right price.</p>
                </div>
            </section>

            <section className="container-x py-14">
                <div className="grid md:grid-cols-2 gap-10 items-start">
                    <div>
                        <h2 className="text-2xl font-display font-bold">Who we are</h2>
                        <p className="mt-3 text-neutral-600 leading-relaxed">
                            {siteConfig.brand.name} is a UAE-based auto spare parts specialist. We combine a searchable online catalogue with
                            personal service on WhatsApp — so whether you know the exact part number or just your vehicle, we get you the
                            correct part fast. Genuine and OEM-quality parts, honest pricing, and reliable local delivery.
                        </p>
                        <div className="mt-6 flex flex-wrap gap-3">
                            <Link href="/catalogue" className="btn btn-primary">Browse Catalogue</Link>
                            <a href={genericWaLink()} target="_blank" rel="noopener noreferrer" className="btn btn-wa"><FaWhatsapp className="w-5 h-5" /> Chat with us</a>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        {VALUES.map((v) => (
                            <div key={v.title} className="card p-5">
                                <v.icon className="w-6 h-6 text-accent-500" />
                                <h3 className="mt-3 font-semibold text-ink">{v.title}</h3>
                                <p className="mt-1 text-sm text-neutral-500">{v.text}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <section className="border-t border-neutral-100">
                <div className="container-x py-10">
                    <h2 className="text-lg font-display font-bold mb-3">Where we deliver</h2>
                    <div className="flex flex-wrap gap-2">
                        {siteConfig.serviceAreas.map((a) => (
                            <span key={a} className="px-3 py-1.5 rounded-full bg-neutral-100 text-sm text-neutral-700">{a}</span>
                        ))}
                    </div>
                </div>
            </section>
        </>
    );
}
