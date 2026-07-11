'use client';

import { useRef, useState } from 'react';
import Link from 'next/link';
import { AnimatePresence, motion } from 'framer-motion';
import { FiChevronDown } from 'react-icons/fi';
import { useCategories } from '@/lib/useCategories';

const catHref = (slug) => `/catalogue?category=${slug}`;

/**
 * Desktop "Categories" mega-menu: a full-width hover panel listing parent categories as columns,
 * each with its sub-categories. Data-driven from the public catalog. Renders a plain link to
 * /categories when there are no categories yet (so the nav item never dead-ends).
 */
export function CategoryMegaMenu({ active }) {
    const { tree, loading } = useCategories();
    const [open, setOpen] = useState(false);
    const closeTimer = useRef(null);

    const openNow = () => { if (closeTimer.current) clearTimeout(closeTimer.current); setOpen(true); };
    const closeSoon = () => { closeTimer.current = setTimeout(() => setOpen(false), 120); };

    const hasTree = tree.length > 0;
    const linkCls = `relative flex items-center gap-1 text-[12px] font-extrabold uppercase tracking-widest transition-all duration-300 py-6 ${
        active ? 'text-[#EF4444]' : 'text-neutral-500 hover:text-[#EF4444]'
    }`;

    return (
        <div className="h-[72px] flex items-center" onMouseEnter={openNow} onMouseLeave={closeSoon}>
            {/* Trigger — links to /categories, but hovering reveals the panel. */}
            <Link href="/categories" className={linkCls} aria-haspopup="true" aria-expanded={open}>
                <span>Categories</span>
                {hasTree && <FiChevronDown size={13} className={`transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />}
            </Link>

            <AnimatePresence>
                {open && hasTree && (
                    <motion.div
                        initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 6 }}
                        transition={{ duration: 0.16 }}
                        className="fixed left-0 right-0 top-[72px] z-[105] border-t border-neutral-100 bg-white shadow-[0_20px_50px_rgba(0,0,0,0.08)]"
                        onMouseEnter={openNow} onMouseLeave={closeSoon}
                    >
                        <div className="container-x lg:max-w-[96rem] py-8">
                            {loading ? (
                                <div className="text-sm text-neutral-400">Loading categories…</div>
                            ) : (
                                <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-x-8 gap-y-7">
                                    {tree.map((parent) => (
                                        <div key={parent.id} className="min-w-0">
                                            <Link href={catHref(parent.slug)} className="block text-[13px] font-black uppercase tracking-wide text-neutral-900 hover:text-[#EF4444] transition-colors">
                                                {parent.name}
                                            </Link>
                                            {parent.children.length > 0 && (
                                                <ul className="mt-3 space-y-2">
                                                    {parent.children.slice(0, 8).map((child) => (
                                                        <li key={child.id}>
                                                            <Link href={catHref(child.slug)} className="block text-[13px] font-medium text-neutral-500 hover:text-neutral-900 transition-colors truncate">
                                                                {child.name}
                                                            </Link>
                                                        </li>
                                                    ))}
                                                    {parent.children.length > 8 && (
                                                        <li>
                                                            <Link href={catHref(parent.slug)} className="block text-[12px] font-bold text-[#EF4444] hover:underline">
                                                                View all {parent.children.length} →
                                                            </Link>
                                                        </li>
                                                    )}
                                                </ul>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                            <div className="mt-8 pt-5 border-t border-neutral-100">
                                <Link href="/categories" className="text-[12px] font-extrabold uppercase tracking-widest text-[#EF4444] hover:underline">
                                    Browse all categories →
                                </Link>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
