import { TrackClient } from '@/components/TrackClient';

export const dynamic = 'force-dynamic';

export const metadata = {
    title: 'Track Order',
    description: 'Track your SpareMec order status by Order ID — no account needed.',
    alternates: { canonical: '/track' },
};

export default function TrackPage({ searchParams }) {
    return <TrackClient initialOrderNumber={searchParams?.order || ''} />;
}
