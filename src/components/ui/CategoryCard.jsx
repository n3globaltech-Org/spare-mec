'use client';

import Link from 'next/link';
import { motion, useReducedMotion } from 'framer-motion';
import { FiArrowUpRight, FiArrowRight } from 'react-icons/fi';

// Ported 1:1 from the CRA. `isListPage` = the Categories page (uniform premium tall cards, left
// text + right image); otherwise the homepage "Shop by Category" bento layout.
export default function CategoryCard({ category, index = 0, isListPage = false }) {
    const reduce = useReducedMotion();
    const href = category.type === 'yellow-cta' ? '/categories' : `/catalogue?category=${category.slug}`;

    // ── Categories page: unified premium tall portrait layout ──
    if (isListPage && category.type) {
        const dark = category.type === 'tall-black';
        const cardClasses = dark
            ? 'relative block overflow-hidden rounded-2xl bg-[#0A0A0A] transition-all duration-500 hover:-translate-y-1.5 hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.25)] group h-full w-full border border-white/5'
            : 'relative block overflow-hidden rounded-2xl border border-neutral-200/50 bg-white transition-all duration-500 hover:-translate-y-1.5 hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.06)] group h-full w-full';
        return (
            <motion.div
                initial={reduce ? false : { y: 24 }}
                animate={{ y: 0 }}
                transition={{ duration: 0.5, delay: (index % 4) * 0.06, ease: [0.22, 1, 0.36, 1] }}
                className="h-full w-full"
            >
                <Link href={href} className={cardClasses}>
                    <div className="h-full w-full flex items-stretch gap-2 p-4 sm:p-5 lg:p-7">
                        <div className="w-[38%] lg:w-[36%] shrink-0 min-w-0 flex flex-col justify-between">
                            <div className="min-w-0">
                                <h3 className={`font-display font-black leading-[1.15] tracking-tight text-[22px] sm:text-2xl lg:text-[2rem] break-normal ${dark ? 'text-white' : 'text-neutral-900'}`}>
                                    {category.name}
                                </h3>
                                <p className={`font-semibold leading-relaxed mt-1.5 lg:mt-2 text-[12px] lg:text-[13.5px] break-normal ${dark ? 'text-neutral-400' : 'text-neutral-500'}`}>
                                    {category.tagline}
                                </p>
                            </div>
                            <div className={`w-10 h-10 lg:w-12 lg:h-12 rounded-full flex items-center justify-center transition-all duration-300 group-hover:scale-105 shadow-md shrink-0 mt-3 ${dark ? 'bg-white/10 border border-white/10 text-white group-hover:bg-white/15' : 'bg-neutral-950 text-white group-hover:bg-neutral-800'}`}>
                                <FiArrowRight size={17} className="lg:w-5 lg:h-5" />
                            </div>
                        </div>
                        <div className="w-[62%] lg:w-[64%] min-w-0 flex items-end justify-center pb-2">
                            {category.image && (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img src={category.image} alt={category.name} className="w-full h-[92%] object-contain object-bottom transition-transform duration-700 ease-out group-hover:scale-105" />
                            )}
                        </div>
                    </div>
                </Link>
            </motion.div>
        );
    }

    if (category.type) {
        const isTallWhite = category.type === 'tall-white';
        const isTallBlack = category.type === 'tall-black';
        const isSmallWhite = category.type === 'small-white';
        const isYellowCta = category.type === 'yellow-cta';

        let cardClasses = '';
        if (isTallWhite) {
            cardClasses = 'relative block overflow-hidden rounded-2xl border border-neutral-200/50 bg-white transition-all duration-500 hover:-translate-y-1.5 hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.06)] group h-full w-full';
        } else if (isTallBlack) {
            cardClasses = 'relative block overflow-hidden rounded-2xl bg-[#0A0A0A] transition-all duration-500 hover:-translate-y-1.5 hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.25)] group h-full w-full border border-white/5';
        } else if (isSmallWhite) {
            cardClasses = 'relative block overflow-hidden rounded-2xl border border-neutral-200/50 bg-white px-5 pt-3.5 pb-5 sm:p-6 lg:p-7 transition-all duration-500 hover:-translate-y-1.5 hover:shadow-[0_16px_36px_-12px_rgba(0,0,0,0.05)] group h-full w-full';
        } else if (isYellowCta) {
            cardClasses = 'relative block overflow-hidden rounded-2xl bg-[#F4E100] p-5 sm:p-6 lg:p-7 transition-all duration-500 hover:-translate-y-1.5 hover:shadow-[0_16px_36px_-12px_rgba(244,225,0,0.2)] group h-full w-full border border-[#D5CC00]';
        }

        const cardContent = (
            <>
                {isTallWhite && (
                    <div className="h-full w-full relative">
                        <div className="absolute top-3 left-5 lg:top-9 lg:left-9 z-20 max-w-[62%] md:max-w-[52%] pointer-events-none">
                            <h3 className="font-display font-black text-[17px] sm:text-lg lg:text-[2.35rem] text-neutral-900 leading-[1.08] lg:leading-[1.05] tracking-tight">
                                Engine &amp;<br />
                                Powertrain
                            </h3>
                            <p className="text-neutral-500 text-[10px] sm:text-xs lg:text-[14px] font-medium mt-1 lg:mt-2.5 leading-relaxed">
                                {category.tagline}
                            </p>
                        </div>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={category.image} alt={category.name} className="absolute left-1/2 -translate-x-1/2 bottom-[1%] md:bottom-[-4%] md:w-[68%] lg:bottom-auto lg:top-[56%] lg:-translate-y-1/2 w-[121%] sm:w-[98%] lg:w-[78%] max-w-[130%] object-contain transition-all duration-700 ease-out group-hover:scale-105 z-10" />
                        <div className="absolute bottom-3 left-3 lg:bottom-9 lg:left-9 z-20">
                            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-neutral-950 flex items-center justify-center text-white transition-all duration-300 group-hover:bg-neutral-800 group-hover:scale-105 shadow-md">
                                <FiArrowRight size={18} className="sm:w-5 sm:h-5" />
                            </div>
                        </div>
                    </div>
                )}

                {isTallBlack && (
                    <div className="h-full w-full relative">
                        <div className="absolute top-3 left-5 lg:top-9 lg:left-9 z-20 max-w-[62%] md:max-w-[52%] pointer-events-none">
                            <h3 className="font-display font-black text-[17px] sm:text-lg lg:text-[2.35rem] text-white leading-[1.08] lg:leading-[1.05] tracking-tight">
                                {category.name}
                            </h3>
                            <p className="text-neutral-400 text-[10px] sm:text-xs lg:text-[14px] font-medium mt-1 lg:mt-2">
                                {category.tagline}
                            </p>
                        </div>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={category.image} alt={category.name} className="absolute bottom-[5%] md:bottom-[8%] md:w-[72%] lg:bottom-[9%] left-1/2 -translate-x-1/2 w-[121%] sm:w-[98%] lg:w-[100%] xl:w-[105%] max-w-[116%] object-contain transition-all duration-700 ease-out group-hover:scale-105 group-hover:translate-y-[-4px] z-10" />
                        <div className="absolute bottom-3 left-3 lg:bottom-9 lg:left-9 z-20">
                            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white/10 border border-white/10 flex items-center justify-center text-white transition-all duration-300 group-hover:bg-white/15 group-hover:scale-105 shadow-md">
                                <FiArrowRight size={18} className="sm:w-5 sm:h-5" />
                            </div>
                        </div>
                    </div>
                )}

                {isSmallWhite && (
                    <div className="flex flex-col h-full relative w-full">
                        <div className="z-20 max-w-[85%] md:max-w-[62%] lg:max-w-[70%]">
                            <h3 className="font-display font-black text-[13.5px] sm:text-base lg:text-[1.3rem] text-neutral-900 leading-[1.1] lg:leading-[1.12] tracking-tight">
                                {category.name}
                            </h3>
                            <p className="text-neutral-500 text-[9.5px] sm:text-xs lg:text-[13px] font-medium mt-1 leading-snug">
                                {category.tagline}
                            </p>
                        </div>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={category.image} alt={category.name} className={category.imageClass || 'absolute right-[-4%] lg:right-[-6%] bottom-1/2 lg:bottom-1/2 translate-y-[52%] lg:translate-y-[50%] w-[54%] sm:w-[52%] lg:w-[65%] max-w-none object-contain transition-all duration-700 ease-out group-hover:scale-105 group-hover:translate-x-1 z-10'} />
                        <div className="absolute bottom-[-8px] left-[-8px] sm:bottom-[-12px] sm:left-[-12px] lg:bottom-[-14px] lg:left-[-14px] z-20">
                            <div className="w-8 h-8 sm:w-9 sm:h-9 lg:w-10 lg:h-10 rounded-full bg-neutral-950 flex items-center justify-center text-white transition-all duration-300 group-hover:bg-neutral-800 group-hover:scale-105 shadow-md">
                                <FiArrowRight size={14} className="sm:w-[15px] sm:h-[15px] lg:w-[18px] lg:h-[18px]" />
                            </div>
                        </div>
                    </div>
                )}

                {isYellowCta && (
                    <div className="h-full w-full flex items-center justify-between">
                        <div className="flex items-center justify-between w-full lg:hidden">
                            <span className="font-display font-black text-neutral-950 text-base">View All Categories</span>
                            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-neutral-950 flex items-center justify-center text-[#F4E100]">
                                <FiArrowUpRight size={18} className="stroke-[2.5]" />
                            </div>
                        </div>
                        <div className="hidden lg:flex flex-col items-center justify-center w-full h-full text-center py-6">
                            <div className="w-12 h-12 rounded-full bg-neutral-950 flex items-center justify-center text-[#F4E100] mb-4 transition-transform duration-300 group-hover:scale-110">
                                <FiArrowUpRight size={22} className="stroke-[2.5]" />
                            </div>
                            <span className="font-display font-black text-neutral-950 text-lg">View All</span>
                        </div>
                    </div>
                )}
            </>
        );

        return (
            <motion.div
                initial={reduce ? false : { y: 24 }}
                animate={{ y: 0 }}
                transition={{ duration: 0.5, delay: (index % 4) * 0.06, ease: [0.22, 1, 0.36, 1] }}
                className="h-full w-full"
            >
                <Link href={isYellowCta ? '/categories' : `/catalogue?category=${category.slug}`} className={cardClasses}>
                    {cardContent}
                </Link>
            </motion.div>
        );
    }

    // Plain fallback (not used by the homepage bento).
    return (
        <motion.div
            initial={reduce ? false : { y: 24 }}
            animate={{ y: 0 }}
            transition={{ duration: 0.5, delay: (index % 4) * 0.06, ease: [0.22, 1, 0.36, 1] }}
            className="h-full"
        >
            <Link
                href={`/catalogue?category=${category.slug}`}
                className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-neutral-200/80 bg-white p-6 transition-all duration-500 hover:-translate-y-1 hover:border-accent-500/25 hover:shadow-[0_16px_36px_-12px_rgba(10,10,10,0.04)]"
            >
                <h3 className="relative mt-5 text-base font-bold text-ink transition-colors duration-300 group-hover:text-accent-500">{category.name}</h3>
                {category.tagline && <p className="relative mt-1 text-xs font-semibold leading-relaxed text-neutral-500">{category.tagline}</p>}
            </Link>
        </motion.div>
    );
}
