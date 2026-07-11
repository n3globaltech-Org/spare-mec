'use client';

import { FaWhatsapp } from 'react-icons/fa';
import { genericWaLink } from '@/lib/whatsapp';

export function WhatsAppFloat() {
    return (
        <a
            href={genericWaLink()}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Chat on WhatsApp"
            className="fixed bottom-4 right-4 z-40 grid place-items-center w-14 h-14 rounded-full bg-[#25D366] text-white shadow-lg hover:bg-[#1FB457] hover:scale-105 transition-transform"
        >
            <FaWhatsapp className="w-7 h-7" />
        </a>
    );
}
