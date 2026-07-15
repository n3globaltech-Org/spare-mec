const TONES = {
    accent: 'bg-accent-500 text-neutral-950',
    dark: 'bg-neutral-950 text-white',
    neutral: 'border border-neutral-200 bg-white/90 text-neutral-700 backdrop-blur',
};

export function ProductCardBadges({ badges = [], compact = false }) {
    if (!badges.length) return null;

    return (
        <div className={`absolute left-2.5 top-2.5 z-20 flex max-w-[70%] flex-wrap gap-1 ${compact ? 'sm:left-3 sm:top-3' : 'md:left-4 md:top-4'}`}>
            {badges.slice(0, compact ? 1 : 2).map((badge) => (
                <span
                    key={`${badge.label}-${badge.tone || 'neutral'}`}
                    className={`rounded-full px-2 py-1 text-[8px] font-extrabold uppercase leading-none tracking-wider shadow-sm md:text-[9px] ${TONES[badge.tone] || TONES.neutral}`}
                >
                    {badge.label}
                </span>
            ))}
        </div>
    );
}
