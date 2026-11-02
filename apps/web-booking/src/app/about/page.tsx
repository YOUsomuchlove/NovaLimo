'use client';

import React from 'react';
import { AboutFleetSection } from '../../components/about/AboutFleetSection';
import { AboutHeroBanner } from '../../components/about/AboutHeroBanner';
import { AboutStatsSection } from '../../components/about/AboutStatsSection';
import { AboutValuesSection } from '../../components/about/AboutValuesSection';
import { PEN_BG } from '../../lib/booking-pen-assets';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[#070b14]">
      <AboutHeroBanner
        bgSrc={PEN_BG.aboutHero}
        overlayClassName="bg-gradient-to-b from-[#070b14]/55 via-[#070b14]/82 to-[#070b14]/92"
      />

      <AboutStatsSection />

      <AboutFleetSection />

      <AboutValuesSection />
    </div>
  );
}
