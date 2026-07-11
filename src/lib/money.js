// Currency-aware money formatting. Service Book returns PLAIN currency amounts (not the old
// "fils" integer × 100), so there is no /100 anywhere — the storefront just formats the number
// in the tenant's currency (AED for SpareMec).
const CURRENCY_LOCALE = {
    AED: "en-AE", INR: "en-IN", USD: "en-US", EUR: "en-IE",
    GBP: "en-GB", SAR: "en-SA", QAR: "en-QA", KWD: "en-KW", OMR: "en-OM", BHD: "en-BH",
};

export function formatMoney(amount, currency = "AED") {
    if (amount == null) return null;
    const cur = String(currency || "AED").toUpperCase();
    const locale = CURRENCY_LOCALE[cur] || "en";
    try {
        return new Intl.NumberFormat(locale, {
            style: "currency",
            currency: cur,
            minimumFractionDigits: 0,
            maximumFractionDigits: 2,
        }).format(Number(amount));
    } catch {
        return `${cur} ${Number(amount).toFixed(2)}`;
    }
}

export default formatMoney;
