import Breadcrumbs from './Breadcrumbs';
import Grain from './Grain';

// Dark metallic inner-page hero. Static (no entrance animation) — it's above-the-fold content, so
// it renders immediately and reliably (avoids the framer-motion SSR opacity-stick issue).
export default function PageHero({ eyebrow, title, subtitle, breadcrumbs, children }) {
    return (
        <section className="relative overflow-hidden bg-metal-radial text-white">
            <div className="pointer-events-none absolute inset-0 bg-grid-dark bg-[size:46px_46px] opacity-[0.15]" />
            <div className="pointer-events-none absolute -right-24 -top-24 h-80 w-80 rounded-full bg-accent-500/15 blur-3xl" />
            <Grain opacity={0.07} />
            <div className="container-x relative py-12 md:py-16">
                {breadcrumbs && (
                    <div className="mb-5">
                        <Breadcrumbs items={breadcrumbs} light />
                    </div>
                )}
                {eyebrow && <span className="eyebrow text-neutral-400">{eyebrow}</span>}
                <h1 className="mt-3 max-w-3xl font-display text-3xl font-extrabold leading-tight md:text-4xl lg:text-5xl">{title}</h1>
                {subtitle && <p className="mt-4 max-w-2xl text-base leading-relaxed text-neutral-300 md:text-lg">{subtitle}</p>}
                {children && <div className="mt-6">{children}</div>}
            </div>
        </section>
    );
}
