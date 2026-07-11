'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FaWhatsapp } from 'react-icons/fa';
import { FiShoppingCart, FiCheck } from 'react-icons/fi';
import { useCart } from '@/context/CartContext';
import { createOrder } from '@/lib/orders';
import { orderWaLink, productWaLink } from '@/lib/whatsapp';

/**
 * The PDP action stack — the conversion core.
 *  • Add to Cart → website checkout.
 *  • Order on WhatsApp → creates a real Order (source=whatsapp) so it lands in the CRM with an
 *    Order ID, then opens WhatsApp pre-filled with that Order ID. Both flows use the same domain.
 * Rendered as a desktop stack + a mobile sticky bar.
 */
export function ProductActions({ product }) {
    const router = useRouter();
    const { add } = useCart();
    const [added, setAdded] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleAdd = () => {
        if (added) { router.push('/checkout'); return; }
        add(product, 1);
        setAdded(true);
    };

    const handleWhatsApp = async () => {
        setLoading(true);
        // Open the tab synchronously — inside the click gesture — so it isn't popup-blocked after
        // the awaited order call (Safari/Firefox block window.open that runs post-await).
        const waWindow = typeof window !== 'undefined' ? window.open('', '_blank') : null;
        if (waWindow) { try { waWindow.opener = null; } catch { /* ignore */ } }
        const go = (url) => { if (waWindow) waWindow.location.href = url; else window.location.href = url; };
        try {
            const order = await createOrder({ source: 'whatsapp', items: [{ productId: product.id, quantity: 1 }] });
            go(orderWaLink({ orderNumber: order.orderNumber, product, currency: product.currency }));
        } catch {
            // Never block the customer — fall back to a plain WhatsApp enquiry.
            go(productWaLink(product));
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <div className="hidden md:flex flex-col gap-2.5 mt-5">
                <button onClick={handleAdd} className={`${added ? 'btn btn-outline' : 'btn btn-primary'} w-full py-3`}>
                    {added ? <><FiCheck className="w-5 h-5" /> Added — View Cart</> : <><FiShoppingCart className="w-5 h-5" /> Add to Cart</>}
                </button>
                <button onClick={handleWhatsApp} disabled={loading} className="btn btn-wa w-full py-3">
                    <FaWhatsapp className="w-5 h-5" /> {loading ? 'Preparing…' : 'Order on WhatsApp'}
                </button>
            </div>

            {/* Mobile sticky action bar */}
            <div className="md:hidden fixed bottom-0 inset-x-0 z-40 flex gap-2 border-t border-neutral-200 bg-white/95 backdrop-blur p-3">
                <button onClick={handleAdd} className={`${added ? 'btn btn-outline' : 'btn btn-primary'} flex-1 py-3`}>
                    {added ? 'View Cart' : 'Add to Cart'}
                </button>
                <button onClick={handleWhatsApp} disabled={loading} className="btn btn-wa flex-1 py-3">
                    <FaWhatsapp className="w-5 h-5" /> WhatsApp
                </button>
            </div>
        </>
    );
}
