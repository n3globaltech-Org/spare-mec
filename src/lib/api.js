import axios from "axios";
import { siteConfig } from "@/config/siteConfig";

// Service Book public storefront API. All catalog/order/tracking calls are tenant-scoped by the
// store slug and require NO auth — the storefront never holds credentials or business logic.
//   base = ${NEXT_PUBLIC_API_URL}/public/${NEXT_PUBLIC_STORE_SLUG}
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
const STORE_SLUG = process.env.NEXT_PUBLIC_STORE_SLUG || siteConfig.storeSlug || "sparemec";

export const PUBLIC_BASE = `${API_URL}/public/${STORE_SLUG}`;

export const publicApi = axios.create({
    baseURL: PUBLIC_BASE,
    // Shorter than the old 20s so a slow/unresponsive API can't balloon SSR homepage TTFB
    // (perf item in the readiness register). Still safe for the order-POST mutation on this
    // shared instance.
    timeout: 10000,
    headers: { "Content-Type": "application/json" },
});

export default publicApi;
