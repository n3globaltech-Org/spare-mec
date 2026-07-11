import { ConfirmationClient } from '@/components/ConfirmationClient';

export const dynamic = 'force-dynamic';

export const metadata = {
    title: 'Order Confirmation',
    robots: { index: false, follow: false }, // private, per-customer
};

export default function OrderConfirmationPage({ searchParams }) {
    return <ConfirmationClient orderNumber={searchParams?.order || ''} />;
}
