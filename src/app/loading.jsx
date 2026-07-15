export default function StorefrontLoading() {
    return (
        <div className="container-x py-8" role="status" aria-label="Loading page">
            <div className="h-5 w-28 animate-pulse rounded bg-neutral-100" />
            <div className="mt-5 h-10 w-2/3 max-w-lg animate-pulse rounded-xl bg-neutral-100" />
            <div className="mt-3 h-4 w-1/2 max-w-sm animate-pulse rounded bg-neutral-100" />
            <div className="mt-9 grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-6">
                {Array.from({ length: 8 }, (_, index) => (
                    <div key={index} className="overflow-hidden rounded-2xl border border-neutral-100 bg-white">
                        <div className="aspect-square animate-pulse bg-neutral-100" />
                        <div className="space-y-3 p-4">
                            <div className="h-3 w-1/3 animate-pulse rounded bg-neutral-100" />
                            <div className="h-4 w-4/5 animate-pulse rounded bg-neutral-100" />
                            <div className="h-4 w-1/2 animate-pulse rounded bg-neutral-100" />
                        </div>
                    </div>
                ))}
            </div>
            <span className="sr-only">Loading storefront content…</span>
        </div>
    );
}
