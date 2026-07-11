import { publicApi } from "./api";

/**
 * Map a Service Book public catalog DTO → the legacy shape the storefront components expect,
 * so the existing UI (ProductCard, ProductDetail, …) ports 1:1 with no rewrites.
 *
 * Key contract changes vs the old sm-api:
 *   - price is a PLAIN number (no fils / ÷100), or null for "price on request"
 *   - brand/category are objects → flattened to name/slug strings
 *   - fitments use snake_case keys (year_start/year_end/engine)
 *   - specs → attributes ([{label,value}])
 *   - images are [{url,alt}] → flattened to url strings; primary is `image`
 */
export function mapProduct(dto) {
    if (!dto) return dto;
    const images = (dto.images || []).map((i) => (typeof i === "string" ? i : i.url)).filter(Boolean);
    return {
        id: dto.id,
        slug: dto.slug,
        name: dto.name,
        sku: dto.sku,
        partNumber: dto.partNumber || "",
        oemNumber: dto.oemNumber || "",
        brand: dto.brand?.name || "",
        brandSlug: dto.brand?.slug || "",
        category: dto.category?.slug || "",
        categoryName: dto.category?.name || "",
        categoryId: dto.category?.id || "",
        type: dto.productType || "",
        kind: dto.kind || "physical",
        availability: dto.inStock ? "Available" : "OnRequest",
        inStock: !!dto.inStock,
        condition: dto.condition,
        warranty: dto.warranty,
        featured: !!dto.isFeatured,
        trending: false,
        shortDescription: dto.shortDescription,
        description: dto.description,
        highlights: dto.highlights || [],
        specs: dto.attributes || [],
        fitment: (dto.fitments || []).map((f) =>
            [
                f.make, f.model, f.generation, f.engine,
                f.year_start && f.year_end ? `${f.year_start}-${f.year_end}` : (f.year_start || f.year_end || ""),
            ].filter(Boolean).join(" ")
        ),
        fitments: dto.fitments || [],
        images,
        image: dto.image || images[0] || null,
        // Plain number — NOT fils. null ⇒ show "Price on request".
        price: dto.price ?? null,
        priceOnRequest: !!dto.priceOnRequest,
        compareAtPrice: dto.mrp ?? null,
        currency: dto.currency || "AED",
        tax: dto.tax || null,
        seo: dto.seo || {},
    };
}

// ── Reads (Service Book public catalog) ────────────────────────────────────────
// List envelope: { success, products, pagination }.  Detail/related/etc: { success, data }.

export async function fetchAllProducts(params = {}) {
    const { data } = await publicApi.get("/catalog/products", { params: { limit: 60, ...params } });
    return { products: (data.products || []).map(mapProduct), pagination: data.pagination };
}

export async function fetchProductsByCategory(categoryId, params = {}) {
    const { data } = await publicApi.get("/catalog/products", { params: { categoryId, limit: 60, ...params } });
    return { products: (data.products || []).map(mapProduct), pagination: data.pagination };
}

export async function fetchProduct(slug) {
    const { data } = await publicApi.get(`/catalog/products/${slug}`);
    return mapProduct(data.data);
}

export async function fetchRelated(slug) {
    const { data } = await publicApi.get(`/catalog/products/${slug}/related`);
    return (data.data || []).map(mapProduct);
}

export async function searchProducts(q, params = {}) {
    const { data } = await publicApi.get("/catalog/products", { params: { q, limit: 60, ...params } });
    return (data.products || []).map(mapProduct);
}

export async function fetchCategories() {
    const { data } = await publicApi.get("/catalog/categories");
    return data.data || [];
}

/**
 * Build a one-level category tree from the flat list the API returns.
 * Each category is `{ id, name, slug, parentId, sortOrder }`. Returns top-level parents sorted by
 * sortOrder→name, each with a `children` array (also sorted). Categories are matched to their parent
 * by `parentId`; orphans (parent missing/inactive) are surfaced as top-level so nothing disappears.
 */
export function buildCategoryTree(categories = []) {
    const bySort = (a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0) || String(a.name).localeCompare(String(b.name));
    const byId = new Map(categories.map((c) => [c.id, { ...c, children: [] }]));
    const roots = [];
    for (const c of byId.values()) {
        const parent = c.parentId ? byId.get(c.parentId) : null;
        if (parent) parent.children.push(c);
        else roots.push(c);
    }
    roots.sort(bySort);
    roots.forEach((r) => r.children.sort(bySort));
    return roots;
}

/** Top-level (parent) categories only, sorted — the flat list with children stripped. */
export function topLevelCategories(categories = []) {
    return buildCategoryTree(categories).map(({ children, ...c }) => c);
}

/** Find a category by slug and resolve its parent (for breadcrumbs / sub-nav). */
export function resolveCategoryPath(categories = [], slug) {
    const current = categories.find((c) => c.slug === slug) || null;
    if (!current) return { current: null, parent: null, children: [] };
    const parent = current.parentId ? categories.find((c) => c.id === current.parentId) || null : null;
    const children = categories.filter((c) => c.parentId === current.id);
    return { current, parent, children };
}

export async function fetchBrands() {
    const { data } = await publicApi.get("/catalog/brands");
    return data.data || [];
}

export async function fetchFilters() {
    const { data } = await publicApi.get("/catalog/filters");
    return data.data || { categories: [], brands: [] };
}

export async function fetchStore() {
    const { data } = await publicApi.get("/store");
    return data.data;
}
