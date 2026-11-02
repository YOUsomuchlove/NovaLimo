'use client';

import React from 'react';
import { ContactFormCard } from '../../components/contact/ContactFormCard';
import { ContactHeroSection } from '../../components/contact/ContactHeroSection';
import { ContactInfoAside } from '../../components/contact/ContactInfoAside';

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-[#0a0e1a]">
      <ContactHeroSection />

      <main className="mx-auto max-w-[1200px] px-4 py-10 sm:px-6 md:py-14 lg:px-0">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-12 xl:gap-16">
          <div className="lg:col-span-5">
            <ContactInfoAside />
          </div>
          <div className="lg:col-span-7">
            <ContactFormCard />
          </div>
        </div>
      </main>
    </div>
  );
}
