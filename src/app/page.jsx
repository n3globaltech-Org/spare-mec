import { fetchAllProducts } from '@/lib/catalog';
import Hero from '@/components/home/Hero';
import CategoriesSection from '@/components/home/CategoriesSection';
import FeaturedProducts from '@/components/home/FeaturedProducts';
import CustomerFavorites from '@/components/home/CustomerFavorites';
import PromoBanners from '@/components/home/PromoBanners';
import TrustBar from '@/components/home/TrustBar';
import MechanicBanner from '@/components/home/MechanicBanner';
import BrandsSection from '@/components/home/BrandsSection';
import TestimonialsSection from '@/components/home/TestimonialsSection';
import BrakeAnimation from '@/components/home/BrakeAnimation';
import FaqPreview from '@/components/home/FaqPreview';

// Rendered per request (SSR) — crawlable HTML without a build-time API call.
export const dynamic = 'force-dynamic';

export const metadata = {
    alternates: { canonical: '/' },
};

export default async function HomePage() {
    const [trendingResult, favoritesResult] = await Promise.allSettled([
        fetchAllProducts({ trending: 'true', limit: 6 }),
        fetchAllProducts({ customerFavorite: 'true', limit: 8 }),
    ]);
    let featured = trendingResult.status === 'fulfilled' ? trendingResult.value.products : [];
    const customerFavorites = favoritesResult.status === 'fulfilled' ? favoritesResult.value.products : [];
    if (!featured.length) { try { featured = (await fetchAllProducts({ featured: 'true', limit: 6 })).products; } catch { /* ignore */ } }
    if (!featured.length) { try { featured = (await fetchAllProducts({ limit: 6 })).products; } catch { /* ignore */ } }

    return (
        <>
            <Hero />
            <CategoriesSection />
            <FeaturedProducts products={featured} variant="large" />
            <CustomerFavorites products={customerFavorites} variant="compact" />
            <PromoBanners />
            <TrustBar />
            <MechanicBanner />
            <BrandsSection />
            <TestimonialsSection />
            <BrakeAnimation />
            <FaqPreview />
        </>
    );
}
