// ────────────────────────────────────────────────────────────────────────────
// Spare Mec — central site configuration (ported from the CRA storefront, unchanged
// except: WhatsApp number + store slug are now env-overridable for multi-storefront).
// ────────────────────────────────────────────────────────────────────────────

export const siteConfig = {
    // Which tenant storefront this build serves (Service Book public API path segment).
    storeSlug: process.env.NEXT_PUBLIC_STORE_SLUG || "sparemec",

    brand: {
        name: "Spare Mec",
        fullName: "Spare Mec Auto Spare Parts",
        legalName: "Spare Mec Auto Spare Parts Trading LLC",
        tagline: "Genuine & OEM-Quality Parts for Luxury Cars",
        foundedYear: 2024,
    },

    contact: {
        whatsappNumber: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "971507855298",
        phoneNumber: "971507855298",
        whatsappDisplay: "+971 50 785 5298",
        phoneDisplay: "+971 50 785 5298",
        email: "contact.smautospares@gmail.com",
        address: "Dubai, United Arab Emirates",
        mapsUrl: "https://maps.google.com/?q=Dubai+UAE",
        hours: "Sat – Thu: 9:00 AM – 8:00 PM",
    },

    social: {
        instagram: "https://www.instagram.com/smautospareparts",
        facebook: "",
        tiktok: "",
        youtube: "",
    },

    serviceAreas: ["United Arab Emirates", "Saudi Arabia", "Oman", "Qatar", "Kuwait", "Bahrain"],

    whatsappGreeting:
        "Hello Spare Mec 👋, I'd like to enquire about auto spare parts. Could you please assist?",
};

export const navLinks = [
    { label: "Home", to: "/", icon: "FiHome" },
    { label: "Catalogue", to: "/catalogue", icon: "FiPackage" },
    { label: "Categories", to: "/categories", icon: "FiGrid" },
    { label: "Track Order", to: "/track", icon: "FiClock" },
    { label: "About", to: "/about", icon: "FiInfo" },
    { label: "Contact", to: "/contact", icon: "FiPhone" },
];

export default siteConfig;
