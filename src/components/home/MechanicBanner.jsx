'use client';

import Image from 'next/image';
import { motion, useReducedMotion } from 'framer-motion';

const mechanicImg = '/assets/sections/mechanic.png';

export default function MechanicBanner() {
    const reduce = useReducedMotion();
    return (
        <section className="relative overflow-hidden bg-white pt-14 pb-16 md:pt-24 md:pb-24 lg:pb-36 border-t border-neutral-200/20">
            <div className="container-x relative flex flex-col items-center justify-center">
                <div className="relative w-full flex flex-col items-center select-none z-0 text-center">
                    {/* Line 1 */}
                    <motion.div
                        initial={reduce ? false : { y: 30 }}
                        animate={{ y: 0 }}
                        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                        className="flex items-center justify-center gap-3 sm:gap-5 w-full text-neutral-850 font-mechanic-header text-[15px] xs:text-[18px] sm:text-[20px] md:text-[24px] lg:text-[28px] tracking-[0.14em] uppercase italic"
                    >
                        <span className="hidden sm:inline-block w-12 sm:w-16 md:w-20 lg:w-24 shrink-0 text-neutral-900 opacity-90 pb-0.5">
                            <svg viewBox="0 0 100 10" fill="none" preserveAspectRatio="none" className="w-full h-1.5 sm:h-2">
                                <path d="M 0 5 L 100 2 L 100 8 Z" fill="currentColor" />
                            </svg>
                        </span>
                        <span>ALL KINDS OF PARTS THAT YOU</span>
                        <span className="hidden sm:inline-block w-12 sm:w-16 md:w-20 lg:w-24 shrink-0 text-neutral-900 opacity-90 pb-0.5">
                            <svg viewBox="0 0 100 10" fill="none" preserveAspectRatio="none" className="w-full h-1.5 sm:h-2">
                                <path d="M 0 2 L 100 5 L 0 8 Z" fill="currentColor" />
                            </svg>
                        </span>
                    </motion.div>

                    {/* Line 2 */}
                    <motion.h2
                        initial={reduce ? false : { y: 45 }}
                        animate={{ y: 0 }}
                        transition={{ duration: 0.8, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
                        className="text-[96px] xs:text-[110px] sm:text-[130px] md:text-[160px] lg:text-[210px] xl:text-[250px] font-mechanic-header text-3d-glossy-red leading-[0.78] tracking-tight uppercase select-none mt-3 md:mt-5"
                    >
                        NEED
                    </motion.h2>

                    {/* Line 3 */}
                    <motion.h3
                        initial={reduce ? false : { y: 45 }}
                        animate={{ y: 0 }}
                        transition={{ duration: 0.8, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
                        className="text-[40px] xs:text-[50px] sm:text-[62px] md:text-[80px] lg:text-[104px] xl:text-[124px] font-mechanic-header text-3d-glossy-black leading-[0.8] tracking-tight uppercase select-none mt-2 md:mt-3"
                    >
                        CAN FIND HERE
                    </motion.h3>
                </div>

                {/* Overlapping mechanic image */}
                <motion.div
                    initial={reduce ? false : { y: 150 }}
                    animate={{ y: 0 }}
                    transition={{ type: 'spring', stiffness: 40, damping: 14, delay: 0.3 }}
                    className="relative z-10 w-full max-w-6xl mx-auto -mt-24 xs:-mt-28 sm:-mt-40 md:-mt-52 lg:-mt-[320px] xl:-mt-[390px] select-none pointer-events-none"
                >
                    <Image src={mechanicImg} alt="Professional mechanics servicing a luxury sports car" width={1536} height={1024} quality={90} loading="lazy" className="w-full h-auto object-contain mx-auto drop-shadow-[0_30px_60px_rgba(0,0,0,0.15)] scale-[1.3] sm:scale-100 transition-transform origin-center duration-700" />
                </motion.div>
            </div>
        </section>
    );
}
