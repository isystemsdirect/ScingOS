'use client';

import { DroneBuilderControlPanel } from '@/components/drone/DroneBuilderControlPanel';
import { useParams } from 'next/navigation';
import { Suspense } from 'react';

function DroneBuilderPage() {
  const params = useParams();
  const droneId = params.id as string;

  if (!droneId) {
    return (
      <div className="flex items-center justify-center h-full">
        <p>No drone ID specified.</p>
      </div>
    );
  }

  return <DroneBuilderControlPanel droneId={droneId} />;
}

export default function DroneBuilderPageWrapper() {
  return (
    <Suspense>
      <DroneBuilderPage />
    </Suspense>
  );
}
