import Link from 'next/link';
import { FiArrowRight } from 'react-icons/fi';
import { fetchCategories, buildCategoryTree } from '@/lib/catalog';
import PageHero from '@/components/ui/PageHero';
import { getCategoryArt } from '@/config/categoryArt';

export const dynamic = 'force-dynamic';

export const metadata = {
    title: 'Categories',
    description: 'Browse auto spare parts by system — engine, transmission, cooling, brakes, electrical and more — for luxury European and American vehicles.',
    alternates: { canonical: '/categories' },
};

const isReal = (c) => c.slug && !/test/i.test(c.name || '');

/**
 * A single category card matching the reference design:
 * White (or dark) card with category name top-left, tagline below,
 * product image bottom-right, and a round arrow CTA.
 */
function CategoryGridCard({ category, index }) {
    const art = getCategoryArt(category.slug);
    const isDark = art.type === 'tall-black';
    const hasImage = !!art.image;

    return (
        <Link
            href={`/category/${category.slug}`}
            className={`group relative flex flex-col justify-between overflow-hidden rounded-2xl border p-6 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl ${
                isDark
                    ? 'border-transparent bg-neutral-950 text-white'
                    : 'border-neutral-100 bg-white text-neutral-950 hover:border-neutral-200'
            }`}
            style={{ minHeight: '300px' }}
        >
            {/* Text content */}
            <div className="relative z-10 max-w-[55%]">
                <h2 className={`font-display text-xl font-black leading-tight tracking-tight ${isDark ? 'text-white' : 'text-neutral-950'}`}>
                    {category.name}
                </h2>
                {art.tagline && (
                    <p className={`mt-1.5 text-[13px] leading-snug ${isDark ? 'text-neutral-400' : 'text-neutral-500'}`}>
                        {art.tagline}
                    </p>
                )}
                {/* Sub-categories as small chips */}
                {category.children?.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-1.5">
                        {category.children.slice(0, 3).map((ch) => (
                            <span
                                key={ch.id}
                                className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${
                                    isDark ? 'bg-white/10 text-white/70' : 'bg-neutral-100 text-neutral-600'
                                }`}
                            >
                                {ch.name}
                            </span>
                        ))}
                        {category.children.length > 3 && (
                            <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${isDark ? 'bg-white/10 text-white/70' : 'bg-neutral-100 text-neutral-500'}`}>
                                +{category.children.length - 3} more
                            </span>
                        )}
                    </div>
                )}
            </div>

            {/* Arrow CTA */}
            <div className="relative z-10 mt-6">
                <span className={`inline-flex h-10 w-10 items-center justify-center rounded-full transition-all duration-300 group-hover:scale-110 ${
                    isDark ? 'bg-white text-neutral-950' : 'bg-neutral-950 text-white'
                }`}>
                    <FiArrowRight size={16} />
                </span>
            </div>

            {/* Product image — positioned bottom-right */}
            {hasImage && (
                <div className="absolute bottom-0 right-0 h-[96%] w-[68%] pointer-events-none overflow-visible">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                        src={art.image}
                        alt={category.name}
                        loading="lazy"
                        decoding="async"
                        className="absolute bottom-0 right-[-8%] h-full w-[128%] object-contain object-bottom transition-transform duration-500 group-hover:scale-105"
                    />
                </div>
            )}

            {/* Subtle gradient overlay for dark cards to blend image into bg */}
            {isDark && hasImage && (
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-neutral-950 via-neutral-950/70 to-transparent" />
            )}
        </Link>
    );
}

export default async function CategoriesPage() {
    let categories = null;
    try { categories = await fetchCategories(); } catch { /* Render a recoverable error state below. */ }

    const tree = categories ? buildCategoryTree(categories).filter(isReal) : [];

    return (
        <>
            <PageHero
                eyebrow="Browse by System"
                title="Part Categories"
                subtitle="Explore our catalogue organised by vehicle system to quickly find the components you need."
                breadcrumbs={[{ label: 'Home', to: '/' }, { label: 'Categories' }]}
            />

            <section className="bg-[#FAF9F6]/55 pt-6 pb-16 md:py-16 border-t border-neutral-200/30">
                <div className="container-x lg:max-w-[96rem]">
                    {tree.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-5">
                            {tree.map((parent, index) => (
                                <CategoryGridCard key={parent.id} category={parent} index={index} />
                            ))}
                        </div>
                    ) : categories === null ? (
                        <div className="py-16 text-center" role="alert">
                            <p className="font-semibold text-neutral-800">We couldn&apos;t load the categories.</p>
                            <p className="mt-1 text-sm text-neutral-500">Please check your connection and try again.</p>
                            <Link href="/categories" className="btn-primary mt-5 inline-flex">Try again</Link>
                        </div>
                    ) : (
                        <p className="py-16 text-center text-neutral-500">No product categories are available yet.</p>
                    )}
                </div>
            </section>
        </>
    );
}
