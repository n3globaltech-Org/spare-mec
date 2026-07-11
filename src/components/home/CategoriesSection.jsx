import CategoryCard from '../ui/CategoryCard';
import { getCategoryArt } from '@/config/categoryArt';

/**
 * Home "Shop by Category" — data-driven from the tenant's top-level categories.
 * Premium tiles use curated art (categoryArt) when the slug matches, else a clean image-less tile.
 * Hidden entirely when the store has no categories yet. Caps at 6 tiles + a "View All" CTA.
 */
export default function CategoriesSection({ categories = [] }) {
    if (!categories.length) return null;
    const tiles = categories.slice(0, 6).map((c) => ({ ...c, ...getCategoryArt(c.slug) }));

    return (
        <section id="categories" className="bg-[#FAF9F6]/55 pt-10 pb-6 md:pt-16 md:pb-24 border-t border-neutral-200/30">
            <div className="container-x lg:max-w-[96rem]">
                <div className="text-center mb-12 lg:mb-16">
                    <h2 className="text-4xl md:text-5xl font-display font-light text-neutral-500 tracking-tight">
                        Shop by <span className="font-extrabold text-neutral-950">Category</span>
                    </h2>
                    <p className="text-neutral-500 text-sm md:text-base font-medium mt-4 max-w-xl mx-auto leading-relaxed">
                        Find the right spare parts faster through organized categories designed for easy browsing
                    </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 lg:gap-6">
                    {tiles.map((cat, index) => (
                        <div key={cat.id} className="h-[220px] sm:h-[240px]">
                            <CategoryCard category={cat} index={index} isListPage />
                        </div>
                    ))}
                    <div className="h-[220px] sm:h-[240px]">
                        <CategoryCard category={{ type: 'yellow-cta' }} index={tiles.length} />
                    </div>
                </div>
            </div>
        </section>
    );
}
