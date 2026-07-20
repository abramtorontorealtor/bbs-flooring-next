'use client';

import { useEffect } from 'react';
import StaticFAQ from '@/components/StaticFAQ';
import SpokeLinks from '@/components/SpokeLinks';
import FinancingBanner from '@/components/FinancingBanner';
import AnswerBlock from '@/components/AnswerBlock';
import { stairsImages } from '@/data/galleryImages';
import { CDN_GALLERY } from '@/lib/service-constants';
import {
  ServiceHero,
  ServiceProcess,
  ServiceGallery,
  FinalCTA,
  MobileStickyBtn,
} from '@/components/service';

const HERO_IMAGE = `${CDN_GALLERY}/stair-project-7.webp`;

const PROCESS_STEPS = [
  { step: '01', title: 'Assess the Structure', desc: 'We inspect your existing staircase frame — stringers, sub-treads, and risers — to confirm it can be recapped without a rebuild. In almost every GTA home, it can.', icon: '🔍' },
  { step: '02', title: 'Remove Old Surface', desc: 'Carpet, old treads, or worn nosing come off. Tack strips, staples, and adhesive are cleaned so the new hardwood sits flush and quiet.', icon: '✂️' },
  { step: '03', title: 'Install New Treads & Risers', desc: 'New solid-hardwood treads and risers are cut, glued, and fastened directly over the existing structure — the core of recapping. No demolition, no structural rebuild.', icon: '🪜' },
  { step: '04', title: 'Custom Staining', desc: 'We colour-match to your floors with test patches on your actual stairs, so you approve the exact shade before we finish.', icon: '🎨' },
  { step: '05', title: 'Finish & Protect', desc: '2–3 coats of commercial-grade polyurethane for a durable, beautiful staircase built to handle daily traffic.', icon: '✨' },
];

const GALLERY_ITEMS = [stairsImages[1], stairsImages[6], stairsImages[3], stairsImages[8], stairsImages[10], stairsImages[5]];

const FAQ_ITEMS = [
  { question: 'What is stair recapping?', answer: 'Stair recapping (also called stair cladding) means installing new solid-hardwood treads and risers directly over your existing staircase structure. There is no demolition and no structural rebuild — the frame stays, and you get a brand-new hardwood surface for a fraction of full replacement cost.' },
  { question: 'How much does stair recapping cost?', answer: 'New hardwood tread recapping is $185/step (straight), with old-surface removal included. Pie, triangle, or bullnose steps are $225/step. A typical 13-step staircase runs about $2,405–$3,300 with nosing; iron pickets add $25 each. Call (647) 428-1111 for a free in-home quote.' },
  { question: 'Is recapping cheaper than replacing the whole staircase?', answer: 'Yes — significantly. Because recapping reuses your existing staircase frame, there is no demolition, no structural carpentry, and far less labour. You get the same finished hardwood look at a fraction of a full rebuild, usually done in 2–3 days.' },
  { question: 'Can you recap stairs that currently have carpet?', answer: 'Absolutely — carpet stairs are our most common recapping job. We remove the carpet, underpad, and tack strips, then install new hardwood treads and risers over the structure. See our dedicated carpet-to-hardwood stairs page for details.' },
  { question: 'Will the new stairs match my existing floors?', answer: 'Yes. We custom-stain the new treads and risers to match your existing hardwood, applying test patches on your actual stairs first. If we are installing floors and stairs together, we guarantee a perfect colour match.' },
  { question: 'How long does stair recapping take?', answer: 'Most standard 13-step staircases take 2–3 days — removal, prep, installation, staining, and polyurethane. An extra day of drying may be needed before heavy use. We confirm the exact timeline at the free assessment.' },
];

const SPOKE_LINKS = [
  { href: '/carpet-to-hardwood-stairs', label: 'Carpet to Hardwood Stairs', description: 'Rip out the carpet and recap with beautiful hardwood treads' },
  { route: 'StairRefinishing', label: 'Staircase Refinishing & Staining', description: 'Restore existing hardwood stairs with sanding, staining & finishing' },
  { route: 'Stairs', label: 'Staircase Installation & Renovation', description: 'Full staircase renovation — treads, railings, pickets and more' },
  { route: 'FreeMeasurement', label: 'Free In-Home Measurement', description: 'Book a free stair assessment and quote across the GTA' },
];

export default function StairRecappingClient() {
  useEffect(() => {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'view_item_list', { item_list_name: 'Stair Recapping' });
    }
  }, []);

  return (
    <div className="bg-white">
      <ServiceHero
        heroImage={HERO_IMAGE}
        heroAlt="Stair recapping with new hardwood treads over an existing staircase"
        breadcrumbPath="/stair-recapping"
        badges={['⭐ 4.7/5 Google Reviews', '🛡️ WSIB Insured', '⏱️ 2-3 Day Turnaround', '🎨 Custom Stain Matching']}
        titleLine1="Stair Recapping & Cladding"
        titleLine2="Across the GTA"
        subtitle="New solid-hardwood treads and risers installed over your existing staircase — no demolition, no rebuild. A brand-new staircase for a fraction of replacement cost."
        pricingPills={[
          { value: '$185', label: 'per step (straight)' },
          { value: '$225', label: 'per step (pie/bullnose)' },
          { value: '~$2,700', label: 'typical 13-step recap' },
        ]}
        primaryCTA={{ text: 'Get a Free Stair Quote', route: 'FreeMeasurement' }}
      />

      <AnswerBlock question="What is stair recapping and what does it cost?">
        Stair recapping means installing <strong>new solid-hardwood treads and risers directly over your existing staircase frame</strong> — no demolition, no structural rebuild. It costs <strong>$185 per step</strong> for straight treads (old-surface removal included) or <strong>$225 per step</strong> for pie and bullnose steps. A typical 13-step staircase runs about <strong>$2,400–$3,300</strong>, finished in 2–3 days and custom-stained to match your floors.
      </AnswerBlock>

      <section className="pt-10 pb-12 md:pt-14 md:pb-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-800 mb-6 text-center">Why Recap Instead of Replace?</h2>
          <div className="space-y-4 text-slate-600 leading-relaxed">
            <p>Most GTA staircases don&apos;t need to be torn out. The frame — stringers, sub-treads, and risers — is structurally sound; it&apos;s only the visible surface that&apos;s worn, dated, or carpeted. Recapping takes advantage of that: we install new solid-hardwood treads and risers directly over the existing structure, so you skip demolition and structural carpentry entirely.</p>
            <p>The result is a brand-new hardwood staircase in 2–3 days, at a fraction of the cost of a full rebuild — and because we custom-stain to match, it reads as a seamless, finished upgrade throughout the home. It&apos;s the single highest-return staircase improvement we offer, and the most requested.</p>
          </div>
        </div>
      </section>

      <ServiceProcess
        title="The Recapping Process"
        subtitle="From tired staircase to stunning hardwood in 2–3 days."
        steps={PROCESS_STEPS}
      />

      <ServiceGallery
        title="Stair Recapping Transformations"
        subtitle="Real projects from our stair crew across the GTA."
        images={GALLERY_ITEMS}
        galleryLink="View all 47 staircase projects"
        bg="bg-slate-50"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <FinancingBanner monthlyFrom={55} />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-12 md:pt-10 md:pb-16">
        <StaticFAQ
          faqItems={FAQ_ITEMS}
          title="Frequently Asked Questions"
          subtitle="Common questions about stair recapping and cladding"
          schemaId="faq-stair-recapping"
          skipSchema
        />
        <SpokeLinks title="Explore Related Services" links={SPOKE_LINKS} />
        <FinalCTA
          title="Ready to Recap Your Staircase?"
          subtitle="Book a free in-home assessment. We'll confirm your frame can be recapped, show you material options, and quote the full job."
          primaryCTA={{ text: 'Get a Free Stair Quote', route: 'FreeMeasurement' }}
        />
      </div>

      <MobileStickyBtn text="🪜 Get a Free Stair Quote" />
    </div>
  );
}
