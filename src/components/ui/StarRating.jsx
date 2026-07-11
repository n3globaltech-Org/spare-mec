import { FaStar, FaStarHalfAlt, FaRegStar } from 'react-icons/fa';

export default function StarRating({
    rating = 5,
    size = 14,
    className = '',
    starClassName = 'text-ink',
    count,
    countClassName = 'text-[11px] text-neutral-500 font-semibold',
}) {
    const filled = Math.floor(rating);
    const hasHalf = rating - filled >= 0.5;

    return (
        <div className={`flex items-center gap-1.5 ${className}`} aria-label={`${rating} out of 5 stars`}>
            <div className="flex items-center gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => {
                    if (i < filled) return <FaStar key={i} size={size} className={starClassName} />;
                    if (i === filled && hasHalf) return <FaStarHalfAlt key={i} size={size} className={starClassName} />;
                    return <FaRegStar key={i} size={size} className="text-neutral-300" />;
                })}
            </div>
            {count != null && <span className={countClassName}>({count})</span>}
        </div>
    );
}
