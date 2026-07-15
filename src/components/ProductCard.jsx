'use client';

import Link from 'next/link';
import { motion, useReducedMotion } from 'framer-motion';
import { FiCheck, FiHeart, FiShoppingCart } from 'react-icons/fi';
import { useProductCard } from '@/hooks/useProductCard';
import { ProductCardBadges } from './ProductCardBadges';
import StarRating from './ui/StarRating';

// Client card — ported 1:1 from the CRA storefront (wishlist heart, star rating, add-to-cart,
// mobile-row / desktop-column / forceCol layouts). Still SSR'd to crawlable HTML by Next.
export function LargeProductCard({ product, index = 0, forceCol = false }) {
    const reduce = useReducedMotion();
    const { added, badges, compareAtLabel, handleAdd, handleWishlist, href, image, isWished, priceLabel } = useProductCard(product);
    // Only render a rating when the product actually has real review data — no fabricated stars.
    const rating = product.rating ?? null;
    const reviewCount = product.reviewCount ?? null;
    const hasRating = rating != null;

    return (
        <motion.article
            initial={reduce ? false : { y: 24 }}
            animate={{ y: 0 }}
            transition={{ duration: 0.5, delay: (index % 4) * 0.07, ease: [0.22, 1, 0.36, 1] }}
            className={`group relative flex overflow-hidden rounded-[24px] border border-neutral-200/80 bg-white transition-all duration-500 hover:border-neutral-300 hover:shadow-[0_16px_36px_-12px_rgba(10,10,10,0.05)] hover:-translate-y-1 ${
                forceCol ? 'flex-col p-0 min-h-0' : 'flex-row md:flex-col p-4 md:p-0 min-h-[148px] md:min-h-0'
            }`}
        >
            <Link
                href={href}
                aria-label={`View ${product.name}`}
                className="absolute inset-0 z-10 rounded-[24px] outline-none focus-visible:ring-2 focus-visible:ring-neutral-950 focus-visible:ring-offset-2"
            />
            <div className={`flex flex-1 gap-5 md:gap-0 w-full ${forceCol ? 'flex-col' : 'flex-row md:flex-col'}`}>
                {/* Image */}
                <div className={`relative aspect-square overflow-hidden bg-neutral-50/65 shrink-0 ${forceCol ? 'w-full h-auto rounded-none' : 'rounded-xl md:rounded-none w-28 h-28 sm:w-32 sm:h-32 md:w-full md:h-auto'}`}>
                    <div className="absolute inset-0 bg-grid-light bg-[size:22px_22px] opacity-25" />
                    <ProductCardBadges badges={badges} />
                    {image ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={image} alt={product.name} loading="lazy" decoding="async" className={`relative h-full w-full object-contain transition-transform duration-700 ease-out group-hover:scale-105 ${forceCol ? 'p-4' : 'p-0 sm:p-0.5 md:p-1.5'}`} />
                    ) : (
                        <div className="relative h-full w-full grid place-items-center text-neutral-300 text-xs">No image</div>
                    )}
                </div>

                {/* MOBILE VIEW BODY */}
                <div className={forceCol ? 'hidden' : 'flex flex-1 flex-col justify-between md:hidden pt-2.5 pb-2.5 pl-1 pr-1.5 relative'}>
                    <div className="flex justify-between items-start w-full">
                        <span className="text-[9px] font-bold text-neutral-500 uppercase tracking-widest block pt-0.5">{product.categoryName}</span>
                        <button onClick={handleWishlist} aria-label={isWished ? 'Remove from wishlist' : 'Add to wishlist'} className="relative z-20 text-neutral-400 hover:text-neutral-800 transition-colors duration-300 shrink-0 -mt-1 -mr-1">
                            <FiHeart size={18} className={isWished ? 'fill-neutral-900 text-neutral-900' : ''} />
                        </button>
                    </div>

                    <div className="flex justify-between items-start w-full mt-1 gap-2">
                        <h3 className="text-[13px] font-bold leading-snug text-neutral-900 line-clamp-2 flex-1 h-[36px]">{product.name}</h3>
                        <div className="flex flex-col items-end shrink-0 text-right -mt-0.5 min-w-[72px]">
                            {priceLabel ? (
                                <>
                                    {compareAtLabel && <span className="text-[10px] text-neutral-400 line-through leading-none">{compareAtLabel}</span>}
                                    <span className="text-[14px] text-neutral-950 font-black leading-none mt-0.5">{priceLabel}</span>
                                </>
                            ) : (
                                <span className="text-[9.5px] font-semibold text-neutral-500 leading-tight">Price on request</span>
                            )}
                        </div>
                    </div>

                    <div className="flex justify-between items-end w-full mt-2">
                        {hasRating ? <StarRating rating={rating} size={9} starClassName="text-amber-400" count={reviewCount} countClassName="text-[9px] text-neutral-500 font-semibold" /> : <span />}
                        <button onClick={handleAdd} className={`relative z-20 px-3 py-1.5 -mr-3 rounded-lg border text-[10px] font-bold flex items-center gap-1.5 transition-all duration-300 shadow-sm ${added ? 'border-neutral-950 bg-neutral-950 text-white' : 'border-neutral-200 bg-neutral-50 text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900 hover:border-neutral-300'}`}>
                            <span>{added ? 'Added' : 'Add to Cart'}</span>
                            {added ? <FiCheck size={11} /> : <FiShoppingCart size={11} />}
                        </button>
                    </div>
                </div>

                {/* DESKTOP / FORCED-VERTICAL VIEW BODY */}
                <div className={`${forceCol ? 'flex animate-fadeIn' : 'hidden md:flex'} flex-1 flex-col p-4 md:p-4.5 relative`}>
                    <span className="text-[9px] md:text-[10px] font-bold text-neutral-500 uppercase tracking-widest block mb-1">{product.categoryName}</span>
                    <h3 className="mt-1.5 md:mt-2 text-xs md:text-sm font-bold leading-snug text-neutral-800 transition-colors duration-300 group-hover:text-neutral-950 line-clamp-2 pr-6 h-[32px] md:h-[40px]">{product.name}</h3>
                    <div className="mt-1.5 md:mt-2 min-h-[17px]">
                        {hasRating && (
                            <StarRating rating={rating} size={12} starClassName="text-amber-400" count={reviewCount} countClassName="text-[11px] text-neutral-500 font-semibold" />
                        )}
                    </div>
                    <div className="mt-2 md:mt-2.5">
                        {priceLabel ? (
                            <div className="flex items-baseline gap-2">
                                {compareAtLabel && <span className="text-[12px] md:text-[13px] text-neutral-400 line-through">{compareAtLabel}</span>}
                                <span className="text-[15px] md:text-[18px] text-neutral-950 font-black">{priceLabel}</span>
                            </div>
                        ) : (
                            <span className="text-[11px] font-medium text-neutral-500 leading-snug block">Price on request</span>
                        )}
                    </div>
                </div>
            </div>

            {/* ACTION BUTTON AREA (desktop / forceCol) */}
            <div className={`${forceCol ? 'flex' : 'hidden md:flex'} relative z-20 items-center w-full px-4 pb-4 md:px-4.5 md:pb-4.5 mt-auto`}>
                <button onClick={handleAdd} className={`w-full py-2 md:py-2.5 rounded-xl border text-[10px] md:text-xs font-bold flex items-center justify-center gap-1.5 md:gap-2 transition-all duration-300 shadow-sm ${added ? 'border-neutral-950 bg-neutral-950 text-white shadow-sm' : 'border-neutral-200 bg-white text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900 hover:border-neutral-300'}`}>
                    <span>{added ? 'Added' : 'Add to Cart'}</span>
                    {added ? <FiCheck size={13} /> : <FiShoppingCart size={13} />}
                </button>
            </div>

            {/* Floating Wishlist Heart (desktop / forceCol) */}
            <button onClick={handleWishlist} aria-label={isWished ? 'Remove from wishlist' : 'Add to wishlist'} className={`absolute right-4 top-4 z-30 ${forceCol ? 'flex' : 'hidden md:flex'} text-neutral-400 hover:text-neutral-800 transition-colors duration-300`}>
                <FiHeart size={18} className={isWished ? 'fill-neutral-900 text-neutral-900' : ''} />
            </button>
        </motion.article>
    );
}

// Backwards-compatible export for catalogue, category, wishlist, and related-product pages.
export function ProductCard(props) {
    return <LargeProductCard {...props} />;
}
