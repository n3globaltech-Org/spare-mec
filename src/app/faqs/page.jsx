import { siteConfig } from '@/config/siteConfig';
import { faqs as FAQS } from '@/data/faqs';

export const metadata = {
    title: 'FAQs',
    description: 'Frequently asked questions about ordering auto spare parts, WhatsApp orders, delivery, and returns.',
    alternates: { canonical: '/faqs' },
};

export default function FaqsPage() {
    const jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: FAQS.map((f) => ({
            '@type': 'Question',
            name: f.q,
            acceptedAnswer: { '@type': 'Answer', text: f.a },
        })),
    };

    return (
        <div className="container-x py-12 max-w-3xl">
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
            <h1 className="text-2xl md:text-3xl font-display font-bold">Frequently asked questions</h1>
            <p className="mt-2 text-neutral-500">Everything you need to know about ordering with {siteConfig.brand.name}.</p>

            <div className="mt-8 divide-y divide-neutral-200 border-y border-neutral-200">
                {FAQS.map((f, i) => (
                    <details key={i} className="group py-4">
                        <summary className="flex items-center justify-between cursor-pointer list-none font-semibold text-ink">
                            {f.q}
                            <span className="ml-4 text-accent-500 transition-transform group-open:rotate-45 text-xl leading-none">+</span>
                        </summary>
                        <p className="mt-3 text-neutral-600 leading-relaxed">{f.a}</p>
                    </details>
                ))}
            </div>
        </div>
    );
}
