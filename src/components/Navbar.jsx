'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiSearch, FiShoppingCart, FiHeart, FiUser, FiHome, FiPackage, FiGrid, FiInfo, FiPhone, FiArrowLeft, FiClock, FiChevronDown } from 'react-icons/fi';
import { FaWhatsapp } from 'react-icons/fa';
import { navLinks, siteConfig } from '@/config/siteConfig';
import { genericWaLink } from '@/lib/whatsapp';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';
import { CategoryMegaMenu } from './CategoryMegaMenu';
import { useCategories } from '@/lib/useCategories';

const ICON_MAP = { FiHome, FiPackage, FiGrid, FiClock, FiInfo, FiPhone };

// "Categories" scrolls to the homepage #categories section (from there, category cards open the
// catalogue filtered). Everything else is a normal route.
const hrefFor = (link) => (link.label === 'Categories' ? '/#categories' : link.to);

export function Navbar() {
    const pathname = usePathname();
    const router = useRouter();
    const { count } = useCart();
    const { count: wishlistCount } = useWishlist();

    const [scrolled, setScrolled] = useState(false);
    const [open, setOpen] = useState(false);
    const [showMobileSearch, setShowMobileSearch] = useState(false);
    const [mobileCatsOpen, setMobileCatsOpen] = useState(false);
    const headerRef = useRef(null);
    const { tree: categoryTree } = useCategories();

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 16);
        onScroll();
        window.addEventListener('scroll', onScroll, { passive: true });
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    // Close menus on navigation.
    useEffect(() => { setOpen(false); setShowMobileSearch(false); }, [pathname]);

    const submitSearch = (e) => {
        e.preventDefault();
        const q = e.target.search.value;
        if (q.trim()) { router.push(`/catalogue?q=${encodeURIComponent(q.trim())}`); setShowMobileSearch(false); }
    };

    const isActive = (to) => (to === '/' ? pathname === '/' : pathname.startsWith(to));

    return (
        <>
            <header
                ref={headerRef}
                className={`sticky top-0 z-[110] transition-all duration-300 bg-white border-b border-neutral-100 ${scrolled ? 'shadow-[0_8px_30px_rgb(0,0,0,0.02)]' : ''}`}
            >
                {showMobileSearch ? (
                    <div className="container-x lg:max-w-[96rem] flex h-[72px] items-center gap-3 w-full animate-fadeIn">
                        <form onSubmit={submitSearch} className="relative flex-1">
                            <FiSearch className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" size={16} />
                            <input name="search" autoFocus placeholder="Search for parts, brands or products..." className="w-full rounded-full border border-neutral-200/60 bg-[#F3F4F6] py-2.5 pl-9 pr-4 text-xs font-semibold text-neutral-850 outline-none focus:bg-white focus:border-neutral-300 focus:shadow-sm" />
                        </form>
                        <button onClick={() => setShowMobileSearch(false)} className="text-xs font-bold text-neutral-500 hover:text-neutral-900 px-3 py-1.5 rounded-full hover:bg-neutral-100 transition-colors shrink-0">Cancel</button>
                    </div>
                ) : (
                    <div className="container-x lg:max-w-[96rem] flex h-[72px] items-center justify-between gap-4">
                        {/* Left: back (mobile, non-home) + logo */}
                        <div className="flex items-center gap-2 shrink-0">
                            {pathname !== '/' && (
                                <button onClick={() => router.back()} aria-label="Go back" className="flex lg:hidden h-10 w-10 items-center justify-center rounded-full bg-neutral-50 border border-neutral-100 text-neutral-600 transition-all duration-300 hover:bg-neutral-100 hover:text-accent-500 mr-1">
                                    <FiArrowLeft size={18} />
                                </button>
                            )}
                            <Link href="/" className="flex items-center gap-2.5 group">
                                <span className="font-display text-2xl font-black tracking-tight text-neutral-900 group-hover:text-accent-500 transition-colors duration-300">
                                    Spare<span className="text-[#6B7280]">Mec</span>
                                </span>
                            </Link>
                        </div>

                        {/* Desktop nav links */}
                        <nav className="hidden lg:flex items-center gap-5 xl:gap-6 ml-4 shrink-0">
                            {navLinks.map((link) => (
                                link.label === 'Categories' ? (
                                    <CategoryMegaMenu key={link.to} active={isActive('/categories')} />
                                ) : (
                                    <div key={link.to} className="h-[72px] flex items-center">
                                        <Link
                                            href={hrefFor(link)}
                                            className={`relative flex items-center gap-1.5 text-[12px] font-extrabold uppercase tracking-widest transition-all duration-300 py-6 ${
                                                isActive(link.to)
                                                    ? 'text-[#EF4444] after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[3px] after:bg-[#EF4444] after:rounded-t-full'
                                                    : 'text-neutral-500 hover:text-[#EF4444]'
                                            }`}
                                        >
                                            <span>{link.label}</span>
                                        </Link>
                                    </div>
                                )
                            ))}
                        </nav>

                        {/* Desktop wide search (xl+) */}
                        <form onSubmit={submitSearch} className="hidden xl:flex relative w-[240px] xl:w-[280px] shrink-0 ml-auto mr-1">
                            <FiSearch className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" size={16} />
                            <input name="search" placeholder="Search for parts, brands or products..." className="w-full rounded-full border border-neutral-200/60 bg-[#F3F4F6] py-2.5 pl-9 pr-4 text-xs font-semibold text-neutral-850 placeholder:text-neutral-400 outline-none transition-all duration-300 focus:bg-white focus:border-neutral-300 focus:shadow-sm" />
                        </form>

                        {/* Right: mobile search, cart, wishlist, account, mobile menu */}
                        <div className="flex items-center gap-3 shrink-0 ml-auto xl:ml-0">
                            <button onClick={() => setShowMobileSearch(true)} aria-label="Search catalogue" className="flex xl:hidden h-10 w-10 items-center justify-center rounded-full bg-neutral-50 border border-neutral-100 text-neutral-600 transition-all duration-300 hover:bg-neutral-100 hover:text-accent-500">
                                <FiSearch size={18} />
                            </button>

                            <Link href="/checkout" aria-label="Cart" className="relative flex h-10 w-10 items-center justify-center rounded-full bg-neutral-50 border border-neutral-100 text-neutral-600 transition-all duration-300 hover:bg-neutral-100 hover:text-accent-500">
                                <FiShoppingCart size={18} />
                                {count > 0 && (
                                    <span className="absolute -right-1 -top-1 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-accent-500 px-1.5 text-[9px] font-bold text-white shadow-sm">
                                        {count}
                                        <span className="absolute inset-0 -z-10 rounded-full bg-accent-500/50 animate-ping" />
                                    </span>
                                )}
                            </Link>

                            <Link href="/wishlist" aria-label="Wishlist" className="hidden md:flex relative h-10 w-10 items-center justify-center rounded-full bg-neutral-50 border border-neutral-100 text-neutral-600 transition-all duration-300 hover:bg-neutral-100 hover:text-accent-500">
                                <FiHeart size={18} />
                                {wishlistCount > 0 && (
                                    <span className="absolute -right-1 -top-1 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-accent-500 px-1.5 text-[9px] font-bold text-white shadow-sm">
                                        {wishlistCount}
                                        <span className="absolute inset-0 -z-10 rounded-full bg-accent-500/50 animate-ping" />
                                    </span>
                                )}
                            </Link>

                            {/* Account (desktop) — points to the Account page (no customer login yet) */}
                            <Link href="/account" aria-label="My account" className="hidden md:flex items-center md:border-l md:border-neutral-200 md:pl-4 md:ml-1 shrink-0 h-10 w-10 md:w-auto justify-center text-neutral-600 hover:text-accent-500 transition-colors">
                                <FiUser size={18} />
                            </Link>

                            {/* Mobile menu toggle */}
                            <button onClick={() => setOpen((o) => !o)} aria-label="Toggle menu" aria-expanded={open} className="flex h-10 w-10 items-center justify-center rounded-full text-ink transition-colors hover:bg-neutral-100 lg:hidden">
                                {open ? <FiX size={22} /> : <FiUser size={22} />}
                            </button>
                        </div>
                    </div>
                )}
            </header>

            {/* Mobile slide-in drawer */}
            <AnimatePresence>
                {open && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            onClick={() => setOpen(false)}
                            className="fixed inset-0 z-[120] bg-ink/40 backdrop-blur-sm lg:hidden"
                        />
                        <motion.nav
                            initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
                            transition={{ type: 'spring', stiffness: 300, damping: 32 }}
                            className="fixed right-0 top-0 bottom-0 z-[121] w-[290px] sm:w-[320px] bg-white border-l border-neutral-100 p-6 flex flex-col shadow-[0_0_50px_rgba(0,0,0,0.08)] lg:hidden"
                        >
                            <div className="flex-1 overflow-y-auto space-y-2 pr-1">
                                {navLinks.map((link) => {
                                    const Icon = ICON_MAP[link.icon];
                                    // "Categories" becomes an expandable tree when we have category data.
                                    if (link.label === 'Categories' && categoryTree.length > 0) {
                                        return (
                                            <div key={link.to}>
                                                <button
                                                    onClick={() => setMobileCatsOpen((v) => !v)}
                                                    aria-expanded={mobileCatsOpen}
                                                    className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-300 ${isActive('/categories') ? 'bg-[#FEF2F2] text-neutral-900' : 'text-neutral-600 hover:text-neutral-900'}`}
                                                >
                                                    {Icon && <Icon size={18} className="flex-shrink-0" />}
                                                    <span className="flex-1 text-left">{link.label}</span>
                                                    <FiChevronDown size={16} className={`transition-transform duration-200 ${mobileCatsOpen ? 'rotate-180' : ''}`} />
                                                </button>
                                                {mobileCatsOpen && (
                                                    <div className="mt-1 ml-4 pl-4 border-l border-neutral-100 space-y-1">
                                                        {categoryTree.map((parent) => (
                                                            <div key={parent.id}>
                                                                <Link
                                                                    href={`/catalogue?category=${parent.slug}`}
                                                                    onClick={() => setOpen(false)}
                                                                    className="block rounded-md px-3 py-2 text-sm font-bold text-neutral-800 hover:text-[#EF4444] transition-colors"
                                                                >
                                                                    {parent.name}
                                                                </Link>
                                                                {parent.children.length > 0 && (
                                                                    <div className="ml-2 space-y-0.5">
                                                                        {parent.children.map((child) => (
                                                                            <Link
                                                                                key={child.id}
                                                                                href={`/catalogue?category=${child.slug}`}
                                                                                onClick={() => setOpen(false)}
                                                                                className="block rounded-md px-3 py-1.5 text-[13px] font-medium text-neutral-500 hover:text-neutral-900 transition-colors"
                                                                            >
                                                                                {child.name}
                                                                            </Link>
                                                                        ))}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        ))}
                                                        <Link href="/categories" onClick={() => setOpen(false)} className="block rounded-md px-3 py-2 text-[13px] font-extrabold uppercase tracking-wide text-[#EF4444]">
                                                            Browse all →
                                                        </Link>
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    }
                                    return (
                                        <Link
                                            key={link.to}
                                            href={hrefFor(link)}
                                            onClick={() => setOpen(false)}
                                            className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-300 ${
                                                isActive(link.to) && link.label !== 'Categories' ? 'bg-[#FEF2F2] text-neutral-900' : 'text-neutral-600 hover:text-neutral-900'
                                            }`}
                                        >
                                            {Icon && <Icon size={18} className="flex-shrink-0" />}
                                            <span>{link.label}</span>
                                        </Link>
                                    );
                                })}
                                <Link href="/wishlist" onClick={() => setOpen(false)} className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-neutral-600 hover:text-neutral-900 transition-all duration-300">
                                    <FiHeart size={18} className="flex-shrink-0" />
                                    <span>Wishlist</span>
                                </Link>
                                <Link href="/account" onClick={() => setOpen(false)} className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-neutral-600 hover:text-neutral-900 transition-all duration-300">
                                    <FiUser size={18} className="flex-shrink-0" />
                                    <span>My Account</span>
                                </Link>
                            </div>

                            <div className="mt-auto pt-4 border-t border-neutral-100 shrink-0 space-y-3">
                                <Link href="/account" onClick={() => setOpen(false)} className="block rounded-lg px-4 py-2.5 text-sm font-bold bg-[#EF4444] text-white text-center transition-all duration-300 hover:bg-[#DC2626]">
                                    Login
                                </Link>
                                <div className="text-[11px] text-neutral-500 text-center">Track orders • Save wishlist • Reorder fast</div>
                                <a href={genericWaLink()} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 bg-[#25D366] text-white font-bold text-sm transition-all duration-300 hover:bg-[#20BA60] w-full">
                                    <FaWhatsapp size={16} />
                                    <span>Chat on WhatsApp</span>
                                </a>
                            </div>
                        </motion.nav>
                    </>
                )}
            </AnimatePresence>
        </>
    );
}
