import { publicApi } from "./api";

/**
 * Orders — website checkout AND WhatsApp orders flow through the SAME endpoint into the same
 * Orders domain; they differ only in how much customer info is supplied. Prices are resolved
 * server-side from the catalog (never sent by the client), so items carry only { productId, quantity }.
 *
 * createOrder → { orderNumber, status, currency, total, itemCount }
 */
export async function createOrder({ source = "website", items, customer, delivery, notes, sourceReference } = {}) {
    const payload = {
        source,
        items: (items || []).map((i) => ({ productId: i.productId, quantity: i.quantity || 1 })),
    };
    if (customer && (customer.name || customer.phone || customer.email)) payload.customer = customer;
    if (delivery) payload.delivery = delivery;
    if (notes) payload.notes = notes;
    if (sourceReference) payload.sourceReference = sourceReference;
    const { data } = await publicApi.post("/orders", payload);
    return data.data;
}

/**
 * Public order tracking by Order ID only — no login. Returns the PII-safe view:
 * { orderNumber, status, source, placedAt, currency, subtotal, taxAmount, total, items, timeline, delivery }.
 */
export async function trackOrder(orderNumber) {
    const { data } = await publicApi.get(`/orders/${encodeURIComponent(String(orderNumber).trim())}`);
    return data.data;
}
