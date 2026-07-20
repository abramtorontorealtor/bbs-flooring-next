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

const HERO_IMAGE = `${CDN_GALLERY}/stair-project-8.webp`;
const CITY = 'Markham';

const PROCESS_STEPS = [
  { step: '01', title: 'Free In-Home Assessment', desc: 'We measure your staircase, inspect the structure and railing, and talk through the look you want — modern iron pickets, matched hardwood, or a full rebuild.', icon: '📋' },
  { step: '02', title: 'Design & Detailed Quote', desc: 'Transparent per-item pricing for treads, risers, railings, pickets and posts. You approve every line and the stain colour before we start.', icon: '💰' },
  { step: '03', title: 'Demo & Prep', desc: 'Carpet, old treads, or worn railings come out. Structure, stringers and sub-treads are cleaned, checked and prepped.', icon: '✂️' },
  { step: '04', title: 'Build & Install', desc: 'New hardwood treads and risers, iron pickets, refinished or new railings and posts — the full staircase transformed to a single coordinated look.', icon: '🪜' },
  { step: '05', title: 'Stain, Finish & Walkthrough', desc: 'Custom stain colour-matched to your floors, 2–3 coats of commercial-grade polyurethane, then a step-by-step walkthrough before we leave.', icon: '✨' },
];

const GALLERY_ITEMS = [stairsImages[7], stairsImages[3], stairsImages[1], stairsImages[10], stairsImages[8], stairsImages[5]];

const SCOPE = [
  { emoji: '🪜', title: 'Treads & Risers', desc: 'New solid-hardwood treads and risers, or sand & restain your existing solid treads. Custom colour-matched to your floors.' },
  { emoji: '🔩', title: 'Railings & Handrails', desc: 'Refinish the existing railing (what 9 in 10 customers choose) or install a full new handrail and posts.' },
  { emoji: '⚙️', title: 'Iron Pickets & Balusters', desc: 'Swap tired wood spindles for modern iron pickets — the single biggest visual upgrade, $25 each installed.' },
  { emoji: '🏗️', title: 'Newel Posts & Structural', desc: 'New newel posts, stringer work (white $350 / stained $900 per side), and structural repairs when needed.' },
  { emoji: '✂️', title: 'Carpet Removal & Conversion', desc: 'Full carpet-to-hardwood conversion — remove carpet, underpad and tack strips, then build new hardwood stairs.' },
  { emoji: '🎨', title: 'Custom Staining & Finish', desc: 'Test patches on your actual stairs, dozens of stain colours, commercial-grade polyurethane top coats.' },
];

const FAQ_ITEMS = [
  { question: 'How much does a full stair renovation cost in Markham?', answer: 'It depends on scope. A sand-and-restain refinish is about $1,625 for a 13-step staircase; recapping with new hardwood treads runs $2,400–$3,300; a full renovation with new treads, iron pickets and railing work is typically $3,500–$5,500+. We give an exact quote at the free in-home visit. Call (647) 428-1111.' },
  { question: 'What does a stair renovation include?', answer: 'Everything from the treads up: new or refinished hardwood treads and risers, iron pickets or new balusters, refinished or new railings and newel posts, stringer work, carpet removal, and custom staining to match your floors. We coordinate the whole staircase as one finished look.' },
  { question: 'Do I have to replace my railing, or can you refinish it?', answer: 'You don\'t have to replace it. About 9 in 10 Markham customers keep and refinish the existing railing to match the new treads. If you want a more modern look, the highest-impact upgrade is usually swapping wood spindles for iron pickets while keeping the posts and handrail.' },
  { question: 'Can you modernise a 1990s Markham builder staircase?', answer: 'Absolutely — it\'s one of our most common jobs. Carpeted MDF builder stairs in Cornell, Cathedraltown, Wismer and Greensborough are recapped with new hardwood treads and risers, wood spindles are replaced with iron pickets, and the railing is refinished to match. The result looks like a brand-new custom staircase.' },
  { question: 'How long does a stair renovation take?', answer: 'A refinish is 1–2 days plus drying; recapping is 2–3 days; a full renovation with railing and picket work is typically 3–5 days. We confirm the exact timeline at the free assessment and respect your schedule.' },
  { question: 'Which Markham neighbourhoods do you serve?', answer: 'All of them — Unionville, Cornell, Cachet, Cathedraltown, Markham Village, Berczy Village, Wismer, Greensborough, Angus Glen and Milliken. Our Highway 7 showroom is central to Markham, so site visits are quick. Call (647) 428-1111.' },
];

const NEIGHBOURHOODS = ['Unionville', 'Cornell', 'Cachet', 'Cathedraltown', 'Markham Village', 'Berczy Village', 'Wismer', 'Greensborough', 'Angus Glen', 'Milliken', 'Thornhill', 'Box Grove'];

const SPOKE_LINKS = [
  { href: '/stair-recapping-markham', label: 'Stair Recapping Markham', description: 'New hardwood treads over your existing staircase — no demolition' },
  { href: '/stair-refinishing-markham', label: 'Stair Refinishing Markham', description: 'Sand & restain existing hardwood stairs to like-new' },
  { href: '/carpet-to-hardwood-stairs', label: 'Carpet to Hardwood Stairs', description: 'Rip out the carpet and build beautiful hardwood stairs' },
  { href: '/hardwood-flooring-markham', label: 'Hardwood Flooring Markham', description: 'Match your renovated stairs to real hardwood floors throughout the home' },
  { route: 'FreeMeasurement', label: 'Free In-Home Measurement', description: 'Book a free stair assessment and quote in Markham' },
];

export default function StairRenovationMarkhamClient() {
  useEffect(() => {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'view_item_list', { item_list_name: 'Stair Renovation Markham' });
    }
  }, []);

  return (
    <div className="bg-white">
      <ServiceHero
        heroImage={HERO_IMAGE}
        heroAlt="Full staircase renovation with hardwood treads and iron pickets in Markham"
        breadcrumbPath="/stair-renovation-markham"
        badges={['⭐ 4.7/5 Google Reviews', '🛡️ WSIB Insured', '🪜 Dedicated Stair Crew', '🎨 Custom Stain Matching']}
        titleLine1="Stair Renovation"
        titleLine2={`in ${CITY}`}
        subtitle="Full staircase transformations — treads, risers, railings, iron pickets, posts and structural work. One coordinated look, custom colour-matched to your floors, across all of Markham."
        pricingPills={[
          { value: '$125+', label: 'per step refinish' },
          { value: '$185+', label: 'per step recapping' },
          { value: '$3.5-5.5k', label: 'typical full reno' },
        ]}
        primaryCTA={{ text: 'Get a Free Stair Quote', route: 'FreeMeasurement' }}
      />

      <AnswerBlock question={`How much does a stair renovation cost in ${CITY}?`}>
        A full staircase renovation in <strong>Markham</strong> depends on scope: a sand-and-restain refinish is about <strong>$1,625</strong> for 13 steps, recapping with new hardwood treads runs <strong>$2,400–$3,300</strong>, and a full renovation with new treads, iron pickets and railing work is typically <strong>$3,500–$5,500+</strong>. Every job is custom-stained to match your floors and finished in 2–5 days depending on scope.
      </AnswerBlock>

      {/* Why Markham */}
      <section className="pt-10 pb-12 md:pt-14 md:pb-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-800 mb-6 text-center">Markham&apos;s Staircase Renovation Experts</h2>
          <div className="space-y-4 text-slate-600 leading-relaxed">
            <p>Markham is BBS&apos;s home city, and the staircase is where the biggest visual gains hide. Most of Markham&apos;s two-storey homes — Cornell, Cathedraltown, Berczy Village, Wismer, Greensborough — were built through the 1990s and 2000s with carpeted builder staircases, plain wood spindles, and a railing that hasn&apos;t been touched since move-in. It&apos;s the most dated feature in an otherwise modern home, and it&apos;s the first thing everyone sees at the front door.</p>
            <p>A full stair renovation coordinates every element into one finished look: new or refinished hardwood treads and risers, iron pickets in place of tired spindles, a refinished or new railing, newel posts, and any structural work — all custom-stained to match your main-floor flooring. Because Markham&apos;s builder staircases sit on sound, code-built frames, most of this is done over the existing structure, so you get a custom-staircase result without a full demolition.</p>
            <p>Our Highway 7 showroom is central to every Markham neighbourhood, our stair crew is dedicated (not a general-labour subcontract), and we&apos;re WSIB insured. Book a free in-home assessment and we&apos;ll map the whole staircase — scope, options and honest pricing — before you commit to anything.</p>
          </div>
        </div>
      </section>

      {/* Scope grid */}
      <section className="py-12 md:py-16 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-800 mb-3 text-center">The Full Renovation Scope</h2>
          <p className="text-slate-500 text-center mb-10 max-w-2xl mx-auto">We handle every part of the staircase in-house — mix and match exactly what your home needs.</p>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {SCOPE.map(s => (
              <div key={s.title} className="bg-white border border-slate-200 rounded-2xl p-6">
                <div className="text-3xl mb-3">{s.emoji}</div>
                <h3 className="font-bold text-lg text-slate-800 mb-2">{s.title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <ServiceProcess
        title="The Renovation Process"
        subtitle="From dated builder staircase to custom focal point across Markham."
        steps={PROCESS_STEPS}
      />

      {/* Pricing */}
      <section className="py-12 md:py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-800 mb-3 text-center">Markham Stair Renovation Pricing</h2>
          <p className="text-slate-500 text-center mb-8 max-w-xl mx-auto">Transparent per-item pricing. Mix and match — your final quote reflects exactly the scope your staircase needs.</p>
          <div className="space-y-3">
            {[
              { service: 'Refinish Existing Treads (Sand & Restain)', price: '$125/step', note: 'Existing solid hardwood in good condition' },
              { service: 'New Straight Treads (Recapping)', price: '$185/step', note: 'New hardwood treads & risers over structure' },
              { service: 'New Pie / Triangle / Bullnose Steps', price: '$225/step', note: 'Specialty step shapes' },
              { service: 'Iron Pickets', price: '$25/piece installed', note: 'The biggest visual upgrade — material included' },
              { service: 'New Newel Posts (3¼")', price: '$150/post', note: 'When posts are replaced rather than refinished' },
              { service: 'Refinish Railing / New Handrail', price: '$25/lf · $50/lf', note: 'Sand & restain existing, or full new handrail' },
              { service: 'Stringers', price: '$350–$900/side', note: 'White painted $350 · Stained $900 (new treads only)' },
            ].map((item, i) => (
              <div key={i} className="flex items-center justify-between bg-slate-50 border border-slate-200 rounded-xl px-5 py-4 hover:border-amber-300 transition-colors">
                <div>
                  <h3 className="font-semibold text-slate-800 text-sm">{item.service}</h3>
                  <p className="text-xs text-slate-400 mt-0.5">{item.note}</p>
                </div>
                <p className="text-lg font-bold text-amber-600 whitespace-nowrap ml-4">{item.price}</p>
              </div>
            ))}
          </div>
          <p className="text-center text-xs text-slate-400 mt-4">All prices in CAD. Final quote provided after the free in-home assessment. Includes furniture protection.</p>
        </div>
      </section>

      {/* Neighbourhoods */}
      <section className="py-12 md:py-16 bg-slate-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-800 mb-4 text-center">Stair Renovations Across {CITY}</h2>
          <p className="text-slate-600 text-center mb-8 max-w-2xl mx-auto leading-relaxed">Our dedicated stair crew renovates staircases in every Markham neighbourhood, from the established homes of Unionville and Markham Village to the newer builds in Cornell, Cathedraltown and Angus Glen.</p>
          <div className="flex flex-wrap justify-center gap-2">
            {NEIGHBOURHOODS.map(n => (
              <span key={n} className="bg-white border border-slate-200 rounded-full px-4 py-1.5 text-sm text-slate-600">{n}</span>
            ))}
          </div>
        </div>
      </section>

      <ServiceGallery
        title="Our Staircase Renovations"
        subtitle="Real full-staircase transformations by our crew across the GTA."
        images={GALLERY_ITEMS}
        galleryLink="View all 47 staircase projects"
        bg="bg-white"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <FinancingBanner monthlyFrom={90} />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-12 md:pt-10 md:pb-16">
        <StaticFAQ
          faqItems={FAQ_ITEMS}
          title="Frequently Asked Questions"
          subtitle="Common questions about full staircase renovation in Markham"
          schemaId="faq-stair-renovation-markham"
          skipSchema
        />
        <SpokeLinks title="Explore Related Services" links={SPOKE_LINKS} />
        <FinalCTA
          title="Ready to Transform Your Markham Staircase?"
          subtitle="Book a free in-home assessment. We'll map the full staircase — treads, railings, pickets and posts — show you stain samples, and quote every line."
          primaryCTA={{ text: 'Get a Free Stair Quote', route: 'FreeMeasurement' }}
        />
      </div>

      <MobileStickyBtn text="🪜 Get a Free Stair Quote" />
    </div>
  );
}
