'use client';

import React, { useEffect, useState } from 'react';
import type { TripBatch } from '@limousine-workspace/shared-types/legacy';
import { getApiBaseUrl } from '../lib/api';
import { HomeFeaturesSection } from '../components/home/HomeFeaturesSection';
import { HomeHeroSection } from '../components/home/HomeHeroSection';

export default function HomePage() {
  const apiUrl = getApiBaseUrl();
  const [batches, setBatches] = useState<TripBatch[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`${apiUrl}/trip-batches`);
        if (!res.ok) throw new Error('load');
        const data = (await res.json()) as TripBatch[];
        if (!cancelled) setBatches(data);
      } catch {
        if (!cancelled) setBatches([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [apiUrl]);

  return (
    <div className="bg-white">
      <HomeHeroSection batches={batches} loading={loading} />
      <HomeFeaturesSection />
    </div>
  );
}
