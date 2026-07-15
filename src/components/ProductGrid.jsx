import { LargeProductCard } from './ProductCard';
import { CompactProductCard } from './CompactProductCard';

export function ProductCardByVariant({ variant = 'large', ...props }) {
    const Card = variant === 'compact' ? CompactProductCard : LargeProductCard;
    return <Card {...props} />;
}

const DESKTOP_COLUMNS = {
    three: 'md:grid-cols-3',
    four: 'md:grid-cols-4',
    catalogue: 'md:grid-cols-3 xl:grid-cols-4',
};

export function ProductGrid({ products = [], variant = 'large', desktopColumns = 'four', className = '' }) {
    const compact = variant === 'compact';
    const columns = DESKTOP_COLUMNS[desktopColumns] || DESKTOP_COLUMNS.four;
    const layout = compact
        ? `grid grid-cols-2 gap-3 sm:gap-4 ${columns} md:gap-6`
        : `flex flex-col gap-3.5 md:grid ${columns} md:gap-6`;

    return (
        <div className={`${layout} ${className}`.trim()}>
            {products.map((product, index) => (
                <ProductCardByVariant key={product.slug} variant={variant} product={product} index={index} />
            ))}
        </div>
    );
}

export function ResponsiveProductGrid({
    products = [],
    mobileVariant = 'compact',
    desktopVariant = 'large',
    desktopColumns = 'four',
}) {
    return (
        <>
            <div className="md:hidden">
                <ProductGrid products={products} variant={mobileVariant} />
            </div>
            <div className="hidden md:block">
                <ProductGrid products={products} variant={desktopVariant} desktopColumns={desktopColumns} />
            </div>
        </>
    );
}
