import Link from 'next/link';
import { FiArrowRight } from 'react-icons/fi';
import { fetchCategories, buildCategoryTree } from '@/lib/catalog';
import PageHero from '@/components/ui/PageHero';
import CategoryCard from '@/components/ui/CategoryCard';
import { getCategoryArt } from '@/config/categoryArt';

export const dynamic = 'force-dynamic';

export const metadata = {
    title: 'Categories',
    description: 'Browse auto spare parts by system — engine, transmission, cooling, brakes, electrical and more — for luxury European and American vehicles.',
    alternates: { canonical: '/categories' },
};

const isReal = (c) => c.slug && !/test/i.test(c.name || '');

export default async function CategoriesPage() {
    let categories = [];
    try { categories = await fetchCategories(); } catch { /* API optional at render */ }

    const tree = buildCategoryTree(categories).filter(isReal);

    return (
        <>
            <PageHero
                eyebrow="Browse by System"
                title="Part Categories"
                subtitle="Explore our catalogue organised by vehicle system to quickly find the components you need."
                breadcrumbs={[{ label: 'Home', to: '/' }, { label: 'Categories' }]}
            />

            <section className="bg-[#FAF9F6]/55 pt-6 pb-16 md:py-24 border-t border-neutral-200/30">
                <div className="container-x lg:max-w-[96rem]">
                    {tree.length > 0 ? (
                        <div className="space-y-8 lg:space-y-12">
                            {tree.map((parent, index) => {
                                const art = getCategoryArt(parent.slug);
                                const kids = parent.children.filter(isReal);
                                return (
                                    <div key={parent.id} className="grid gap-5 lg:gap-8 md:grid-cols-[minmax(0,340px)_1fr] items-start">
                                        <div className="h-[220px] sm:h-[240px]">
                                            <CategoryCard category={{ ...parent, ...art }} index={index} isListPage />
                                        </div>
                                        {kids.length > 0 ? (
                                            <div className="flex flex-wrap gap-2.5 content-start md:pt-1">
                                                {kids.map((ch) => (
                                                    <Link
                                                        key={ch.id}
                                                        href={`/catalogue?category=${ch.slug}`}
                                                        className="inline-flex items-center rounded-full border border-neutral-200 bg-white px-4 py-2 text-[13px] font-semibold text-neutral-700 transition-colors hover:border-neutral-900 hover:text-neutral-900"
                                                    >
                                                        {ch.name}
                                                    </Link>
                                                ))}
                                                <Link
                                                    href={`/catalogue?category=${parent.slug}`}
                                                    className="inline-flex items-center gap-1 rounded-full bg-neutral-950 px-4 py-2 text-[13px] font-bold text-white transition-colors hover:bg-neutral-800"
                                                >
                                                    All {parent.name} <FiArrowRight size={14} />
                                                </Link>
                                            </div>
                                        ) : (
                                            <Link
                                                href={`/catalogue?category=${parent.slug}`}
                                                className="inline-flex items-center gap-1.5 text-sm font-bold text-[#EF4444] hover:underline md:pt-1"
                                            >
                                                Browse all {parent.name} <FiArrowRight size={15} />
                                            </Link>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <p className="text-center text-neutral-500 py-16">Categories are loading — please check back shortly.</p>
                    )}
                </div>
            </section>
        </>
    );
}
