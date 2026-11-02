'use client';

import React from 'react';
import { CargoInfoCards } from '../../components/cargo/CargoInfoCards';
import { CargoLandingHero } from '../../components/cargo/CargoLandingHero';
import { PEN_BG, PEN_OVERLAY } from '../../lib/booking-pen-assets';

export default function CargoLandingPage() {
  return (
    <div className="bg-[#05080d]">
      <CargoLandingHero
        bgSrc={PEN_BG.cargoLanding}
        overlayClassName={PEN_OVERLAY.cargoLanding}
      />
      <div className="nova-dark-page-grid border-t border-white/[0.06]">
        <CargoInfoCards />
      </div>
    </div>
  );
}
