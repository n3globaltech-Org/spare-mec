// Curated 3D render + tagline per category slug (assets in /public/assets/sections/category).
// Data-driven category surfaces (home "Shop by Category", /categories) look up art here by slug;
// categories without a curated entry fall back to a clean image-less tile. Keys cover both the
// legacy demo slugs and the auto-generated slugs of the seeded recommended categories.
const IMG = '/assets/sections/category';

export const CATEGORY_ART = {
    engine: { type: 'tall-white', image: `${IMG}/engine.png`, tagline: 'Peak engine performance & components' },
    brakes: { type: 'tall-black', image: `${IMG}/brakes.png`, tagline: 'Superior stopping & ride control' },
    'brakes-suspension': { type: 'tall-black', image: `${IMG}/brakes.png`, tagline: 'Superior stopping & ride control' },
    steering: { type: 'tall-white', image: `${IMG}/suspension.png`, tagline: 'Precision steering & response' },
    'suspension-steering': { type: 'tall-white', image: `${IMG}/suspension.png`, tagline: 'Smooth road control' },
    transmission: { type: 'tall-white', image: `${IMG}/transmission.png`, tagline: 'Smooth, seamless gear changes' },
    'cooling-heating': { type: 'tall-white', image: `${IMG}/cooling.png`, tagline: 'Optimal temperature, always' },
    electrical: { type: 'tall-white', image: `${IMG}/electrical.png`, tagline: 'Reliable power & maximum safety' },
    'electrical-lighting': { type: 'tall-white', image: `${IMG}/electrical.png`, tagline: 'Reliable power & maximum safety' },
    'fuel-air': { type: 'tall-white', image: `${IMG}/fuel-air.png`, tagline: 'Clean air & efficient fuel delivery' },
    lubricants: { type: 'tall-white', image: `${IMG}/oils.png`, tagline: 'Maximum protection & longevity' },
    'oils-lubricants': { type: 'tall-white', image: `${IMG}/oils.png`, tagline: 'Maximum protection & longevity' },
};

/** Art + tagline for a slug, with a clean image-less fallback so any category renders. */
export function getCategoryArt(slug) {
    return CATEGORY_ART[slug] || { type: 'tall-white', tagline: 'Browse parts' };
}
