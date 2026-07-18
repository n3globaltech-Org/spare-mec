'use client';

import Link from 'next/link';
import { motion, useReducedMotion } from 'framer-motion';
import { FiCheck, FiHeart, FiShoppingCart } from 'react-icons/fi';
import { useProductCard } from '@/hooks/useProductCard';
import { ProductCardBadges } from './ProductCardBadges';

export function CompactProductCard({ product, index = 0 }) {
    const reduce = useReducedMotion();
    const { added, badges, compareAtLabel, handleAdd, handleWishlist, href, image, isWished, priceLabel } = useProductCard(product);

    return (
        <motion.article
            initial={reduce ? false : { y: 18 }}
            animate={{ y: 0 }}
            transition={{ duration: 0.45, delay: (index % 4) * 0.05, ease: [0.22, 1, 0.36, 1] }}
            className="group relative flex min-w-0 flex-col overflow-hidden rounded-[20px] border border-neutral-200/80 bg-white transition-all duration-300 hover:-translate-y-1 hover:border-neutral-300 hover:shadow-[0_16px_36px_-12px_rgba(10,10,10,0.08)] md:rounded-[24px]"
        >
            <Link href={href} className="flex min-w-0 flex-1 flex-col">
                <div className="relative aspect-square w-full overflow-hidden bg-neutral-50/65">
                    <div className="absolute inset-0 bg-grid-light bg-[size:20px_20px] opacity-25" />
                    <ProductCardBadges badges={badges} compact />
                    {image ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                            src={image}
                            alt={product.name}
                            loading="lazy"
                            decoding="async"
                            className="relative h-full w-full object-contain p-2.5 transition-transform duration-700 ease-out group-hover:scale-105 sm:p-3 md:p-4"
                        />
                    ) : (
                        <div className="relative grid h-full w-full place-items-center text-[10px] text-neutral-300">No image</div>
                    )}
                </div>

                <div className="flex flex-1 flex-col p-3 pb-3.5 sm:p-3.5 md:p-4">
                    <span className="truncate text-[8px] font-extrabold uppercase tracking-[0.14em] text-neutral-500 sm:text-[9px]">
                        {product.categoryName}
                    </span>
                    <h3 className="mt-1.5 line-clamp-2 min-h-[34px] text-[12px] font-bold leading-[1.4] text-neutral-900 sm:text-[13px] md:min-h-[40px] md:text-sm">
                        {product.name}
                    </h3>
                    {product.partNumber && (
                        <p className="mt-1 truncate font-mono text-[10.5px] font-semibold leading-tight text-neutral-400 md:text-[11px]">Part No: {product.partNumber}</p>
                    )}

                    <div className="mt-auto min-h-[38px] pr-10 pt-2.5 sm:pr-11">
                        {priceLabel ? (
                            <div className="flex flex-col">
                                {compareAtLabel && <span className="text-[9px] leading-none text-neutral-400 line-through sm:text-[10px]">{compareAtLabel}</span>}
                                <span className="mt-0.5 truncate text-[13px] font-black leading-tight text-neutral-950 sm:text-sm md:text-base">{priceLabel}</span>
                            </div>
                        ) : (
                            <span className="block max-w-[75px] text-[9px] font-semibold leading-tight text-neutral-500 sm:text-[10px]">Price on request</span>
                        )}
                    </div>
                </div>
            </Link>

            <button
                type="button"
                onClick={handleWishlist}
                aria-label={isWished ? 'Remove from wishlist' : 'Add to wishlist'}
                className="absolute right-2.5 top-2.5 z-20 grid h-8 w-8 place-items-center rounded-full border border-white/80 bg-white/90 text-neutral-500 shadow-sm backdrop-blur transition-colors hover:text-neutral-950 sm:right-3 sm:top-3"
            >
                <FiHeart size={15} className={isWished ? 'fill-neutral-950 text-neutral-950' : ''} />
            </button>

            <button
                type="button"
                onClick={handleAdd}
                aria-label={added ? `View ${product.name} in checkout` : `Add ${product.name} to cart`}
                title={added ? 'Go to checkout' : 'Add to cart'}
                className={`absolute bottom-3 right-3 z-20 grid h-9 w-9 place-items-center rounded-xl border shadow-sm transition-all duration-300 sm:bottom-3.5 sm:right-3.5 sm:h-10 sm:w-10 ${
                    added
                        ? 'border-neutral-950 bg-neutral-950 text-white'
                        : 'border-neutral-200 bg-neutral-50 text-neutral-700 hover:border-neutral-950 hover:bg-neutral-950 hover:text-white'
                }`}
            >
                {added ? <FiCheck size={15} /> : <FiShoppingCart size={15} />}
            </button>
        </motion.article>
    );
}
