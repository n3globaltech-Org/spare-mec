import { brands as staticBrands } from '@/data/brands';

// Auto-scrolling brand-logo marquee. Static brand set (served from /public/assets/Brands).
export default function BrandMarquee({ className = '', speed = 'animate-marquee-slow', reverse = false }) {
    const sortedList = [...staticBrands].sort((a, b) => a.name.localeCompare(b.name));
    const finalList = reverse ? [...sortedList].reverse() : sortedList;
    const row = [...finalList, ...finalList];
    return (
        <div className={`relative overflow-hidden mask-fade-x ${className}`}>
            <div
                className={`flex w-max items-center gap-10 md:gap-16 ${speed} hover:[animation-play-state:paused]`}
                style={reverse ? { animationDirection: 'reverse' } : undefined}
            >
                {row.map((b, i) => (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                        key={i}
                        src={b.src}
                        alt={b.name}
                        title={b.name}
                        loading="lazy"
                        decoding="async"
                        className="h-9 w-auto shrink-0 object-contain opacity-80 hover:opacity-100 transition-all duration-300 md:h-11"
                    />
                ))}
            </div>
        </div>
    );
}
