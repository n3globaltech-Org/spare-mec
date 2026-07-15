'use client';

import { useRouter } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';
import { formatMoney } from '@/lib/money';

export function useProductCard(product) {
    const router = useRouter();
    const { items, add } = useCart();
    const { has, toggle } = useWishlist();

    const added = items.some((item) => item.slug === product.slug);
    const isWished = has(product.slug);
    const image = product.image || product.images?.[0] || null;
    const href = `/product/${product.slug}`;
    const badges = (Array.isArray(product.badges) ? product.badges : [])
        .map((badge) => (typeof badge === 'string' ? { label: badge } : badge))
        .filter((badge) => badge?.label);
    const showPrice = product.price != null && !product.priceOnRequest;
    const priceLabel = showPrice ? formatMoney(product.price, product.currency) : null;
    const compareAtLabel =
        showPrice && product.compareAtPrice != null && product.compareAtPrice > product.price
            ? formatMoney(product.compareAtPrice, product.currency)
            : null;

    const handleAdd = (event) => {
        event.preventDefault();
        event.stopPropagation();

        if (added) {
            router.push('/checkout');
            return;
        }

        add(product);
    };

    const handleWishlist = (event) => {
        event.preventDefault();
        event.stopPropagation();
        toggle(product.slug);
    };

    return {
        added,
        compareAtLabel,
        handleAdd,
        handleWishlist,
        href,
        image,
        isWished,
        priceLabel,
        badges,
    };
}
