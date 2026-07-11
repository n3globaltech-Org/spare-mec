import Link from 'next/link';
import { FaWhatsapp } from 'react-icons/fa';
import { genericWaLink } from '@/lib/whatsapp';

export const metadata = { title: 'Page not found' };

export default function NotFound() {
    return (
        <div className="container-x py-24 text-center">
            <div className="text-6xl font-display font-extrabold text-neutral-200">404</div>
            <h1 className="mt-4 text-2xl font-display font-bold">We couldn't find that page</h1>
            <p className="mt-2 text-neutral-500">The part or page may have moved. Let's get you back on track.</p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
                <Link href="/" className="btn btn-primary">Back home</Link>
                <Link href="/catalogue" className="btn btn-outline">Browse catalogue</Link>
                <a href={genericWaLink()} target="_blank" rel="noopener noreferrer" className="btn btn-wa"><FaWhatsapp className="w-5 h-5" /> Ask on WhatsApp</a>
            </div>
        </div>
    );
}
