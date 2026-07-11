import { siteConfig } from "@/config/siteConfig";
import { formatMoney } from "./money";

const NUMBER = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || siteConfig.contact.whatsappNumber;
const BASE = `https://wa.me/${NUMBER}`;

export const waLink = (text) => `${BASE}?text=${encodeURIComponent(text)}`;
export const genericWaLink = () => waLink(siteConfig.whatsappGreeting);

// Fallback single-product enquiry (no order record) — used only if order creation is unavailable.
export const productWaLink = (product) => {
    const lines = [
        `Hello ${siteConfig.brand.name} 👋, I'd like to order:`,
        "",
        `• ${product.name}`,
        product.partNumber ? `  Part No: ${product.partNumber}` : "",
        product.brand ? `  Vehicle Brand: ${product.brand}` : "",
        "",
        "Could you please confirm availability, price and fitment? Thank you.",
    ].filter(Boolean);
    return waLink(lines.join("\n"));
};

/**
 * Order-on-WhatsApp message AFTER the order is created — includes the Order ID so the CRM order
 * and the WhatsApp chat are linked. Accepts a single `product` (PDP flow) or `items` (cart flow).
 * Money is plain (no fils).
 */
export const buildOrderMessage = ({ orderNumber, product, items, vehicle, currency = "AED" } = {}) => {
    const lines = [`Hello ${siteConfig.brand.name} 👋, I'd like to place this order:`, ""];
    if (orderNumber) {
        lines.push(`Order ID: ${orderNumber}`);
        lines.push("");
    }

    const list = items && items.length
        ? items
        : (product ? [{ name: product.name, partNumber: product.partNumber, quantity: 1 }] : []);

    list.forEach((it, i) => {
        let line = `${i + 1}. ${it.name}`;
        if (it.partNumber) line += `  (Part No: ${it.partNumber})`;
        if (it.quantity) line += `  ×${it.quantity}`;
        if (it.unitPrice != null) line += `  — ${formatMoney(it.unitPrice * (it.quantity || 1), currency)}`;
        lines.push(line);
    });

    const v = vehicle && [vehicle.year, vehicle.make, vehicle.model].filter(Boolean).join(" ");
    if (v) {
        lines.push("");
        lines.push(`Vehicle: ${v}`);
    }

    lines.push("");
    lines.push("Could you please confirm and assist with next steps? Thank you!");
    return lines.join("\n");
};

export const orderWaLink = (order) => waLink(buildOrderMessage(order));

export default waLink;
