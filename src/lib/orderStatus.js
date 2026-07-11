// Shared order status vocabulary — mirrors the Service Book Orders domain so the storefront,
// tracking page, CRM, and admin all use the SAME terminology. "Shipped" is intentionally absent
// (local delivery uses "Out for Delivery").
export const ORDER_STATUS_LABELS = {
    received: 'Order Received',
    customer_contacted: 'Customer Contacted',
    details_pending: 'Customer Details Pending',
    awaiting_confirmation: 'Awaiting Confirmation',
    confirmed: 'Confirmed',
    processing: 'Processing',
    out_for_delivery: 'Out for Delivery',
    delivered: 'Delivered',
    cancelled: 'Cancelled',
};

// Forward flow shown on the tracking timeline (Cancelled is a side-exit, handled separately).
export const ORDER_STATUS_FLOW = [
    'received', 'customer_contacted', 'details_pending', 'awaiting_confirmation',
    'confirmed', 'processing', 'out_for_delivery', 'delivered',
];

export const statusLabel = (s) => ORDER_STATUS_LABELS[s] || s;
