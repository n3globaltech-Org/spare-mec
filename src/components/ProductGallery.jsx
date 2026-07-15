'use client';

import { useEffect, useMemo, useState } from 'react';

export function ProductGallery({ images = [], primaryImage = null, productName }) {
    const gallery = useMemo(
        () => [...new Set([primaryImage, ...images].filter(Boolean))],
        [images, primaryImage]
    );
    const [selectedImage, setSelectedImage] = useState(gallery[0] || null);

    useEffect(() => {
        setSelectedImage(gallery[0] || null);
    }, [gallery]);

    return (
        <div>
            <div className="card aspect-square overflow-hidden bg-neutral-100">
                {selectedImage ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                        src={selectedImage}
                        alt={productName}
                        decoding="async"
                        className="h-full w-full object-contain"
                    />
                ) : (
                    <div className="grid h-full w-full place-items-center text-neutral-300">No image</div>
                )}
            </div>

            {gallery.length > 1 && (
                <div className="mt-3 flex gap-3 overflow-x-auto pb-1" aria-label={`${productName} image gallery`}>
                    {gallery.map((image, index) => {
                        const isActive = image === selectedImage;
                        return (
                            <button
                                key={image}
                                type="button"
                                onClick={() => setSelectedImage(image)}
                                aria-label={`View ${productName} image ${index + 1}`}
                                aria-pressed={isActive}
                                className={`relative h-16 w-16 shrink-0 overflow-hidden rounded-xl border-2 bg-neutral-50 transition sm:h-20 sm:w-20 ${
                                    isActive
                                        ? 'border-neutral-950 ring-2 ring-neutral-950/10'
                                        : 'border-transparent hover:border-neutral-300'
                                }`}
                            >
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img src={image} alt="" className="h-full w-full object-contain" loading="lazy" decoding="async" />
                            </button>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
