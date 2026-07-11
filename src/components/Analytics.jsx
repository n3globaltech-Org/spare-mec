import Script from 'next/script';

// GA4 analytics — activated only when NEXT_PUBLIC_GA_ID is set, so dev/preview builds stay clean
// and no tracking runs until a real measurement ID is configured for production.
export function Analytics() {
    const gaId = process.env.NEXT_PUBLIC_GA_ID;
    if (!gaId) return null;
    return (
        <>
            <Script src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`} strategy="afterInteractive" />
            <Script id="ga4-init" strategy="afterInteractive">
                {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${gaId}', { anonymize_ip: true });
        `}
            </Script>
        </>
    );
}
