
'use client';

import { LiveFusionViewer } from '@/components/LiveFusionViewer';
import { Suspense } from 'react';

function LidarPage() {
    return <LiveFusionViewer />;
}


export default function LidarPageWrapper() {
    return (
        <Suspense>
            <LidarPage />
        </Suspense>
    );
}
