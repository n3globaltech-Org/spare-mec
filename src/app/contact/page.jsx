import { FaWhatsapp } from 'react-icons/fa';
import { FiPhone, FiMail, FiMapPin, FiClock } from 'react-icons/fi';
import { siteConfig } from '@/config/siteConfig';
import { genericWaLink } from '@/lib/whatsapp';
import { ContactForm } from '@/components/ContactForm';

export const metadata = {
    title: 'Contact',
    description: `Contact ${siteConfig.brand.fullName} — WhatsApp, phone, or email for auto spare parts in the UAE.`,
    alternates: { canonical: '/contact' },
};

export default function ContactPage() {
    const c = siteConfig.contact;
    const rows = [
        { icon: FiPhone, label: 'Phone', value: c.phoneDisplay, href: `tel:${c.phoneNumber}` },
        { icon: FiMail, label: 'Email', value: c.email, href: `mailto:${c.email}` },
        { icon: FiMapPin, label: 'Location', value: c.address, href: c.mapsUrl },
        { icon: FiClock, label: 'Hours', value: c.hours, href: null },
    ];

    return (
        <div className="container-x py-12">
            <h1 className="text-2xl md:text-3xl font-display font-bold">Get in touch</h1>
            <p className="mt-2 text-neutral-500">We're here to help you find the right part, fast.</p>

            <div className="mt-8 grid md:grid-cols-2 gap-8">
                <div className="space-y-5">
                    <a href={genericWaLink()} target="_blank" rel="noopener noreferrer" className="btn btn-wa w-full py-3.5"><FaWhatsapp className="w-5 h-5" /> Chat on WhatsApp</a>
                    <ul className="space-y-3">
                        {rows.map((r) => (
                            <li key={r.label} className="flex items-start gap-3">
                                <span className="mt-0.5 grid place-items-center w-9 h-9 rounded-full bg-neutral-100 text-accent-500"><r.icon className="w-4 h-4" /></span>
                                <div>
                                    <div className="text-xs uppercase tracking-wide text-neutral-500">{r.label}</div>
                                    {r.href ? <a href={r.href} target={r.href.startsWith('http') ? '_blank' : undefined} rel="noopener noreferrer" className="text-ink font-medium hover:text-accent-500">{r.value}</a> : <div className="text-ink font-medium">{r.value}</div>}
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
                <ContactForm />
            </div>
        </div>
    );
}
