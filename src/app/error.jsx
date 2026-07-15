'use client';

import Link from 'next/link';
import { FiAlertCircle, FiRefreshCw } from 'react-icons/fi';

export default function StorefrontError({ reset }) {
    return (
        <div className="container-x py-20 text-center" role="alert">
            <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-red-50 text-red-500">
                <FiAlertCircle className="h-6 w-6" />
            </div>
            <h1 className="mt-5 font-display text-2xl font-bold text-neutral-950">We couldn&apos;t load this page</h1>
            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-neutral-500">
                The storefront may be temporarily unavailable. Try again, or return to the catalogue.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
                <button type="button" onClick={reset} className="btn btn-primary px-5 py-3">
                    <FiRefreshCw /> Try again
                </button>
                <Link href="/catalogue" className="btn btn-outline px-5 py-3">Browse catalogue</Link>
            </div>
        </div>
    );
}
