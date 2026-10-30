import { Suspense } from 'react';
import Link from 'next/link';
import PlannerClient from '@/components/PlannerClient';

export const metadata = {
  title: { absolute: 'Flooring Project Planner — Boxes, Underlay & Trim for Every Room | Markham' },
  description: 'Plan every room: boxes, underlay, trim and total cost in one list. Add it all to cart or book install. BBS Flooring, Markham — serving Toronto & the GTA.',
  alternates: { canonical: 'https://bbsflooring.ca/planner' },
};

const FAQS = [
  {
    q: 'How much waste should I add when ordering flooring?',
    a: 'Add 10% for a standard straight-lay install, and 15% for diagonal or herringbone layouts or rooms with lots of angles. Simple rectangular rooms can often use 5%. The planner lets you set waste per room.',
  },
  {
    q: 'Can I include stairs in my flooring project?',
    a: 'Yes — add a Stairs room and enter the number of treads. Stairs are quoted after a free measurement, so the tread count is passed to your installation request rather than added to the cart.',
  },
  {
    q: 'Can I mix different products in one order?',
    a: 'Yes. Each room can have its own floor, and everything goes into a single cart. New rooms default to the previous room’s product so matching floors take one tap.',
  },
  {
    q: 'Do I need underlay under my new floor?',
    a: 'It depends on the floor type. Vinyl with an attached pad does not need underlay. Click-lock laminate and floating engineered hardwood usually do. Glue-down and nail-down installs use adhesive or wax paper instead. The planner pre-selects what each floor needs.',
  },
  {
    q: 'How are boxes rounded?',
    a: 'Flooring is sold by the full box, so the planner always rounds up to the next whole box after adding your waste allowance. The leftover is your spare for future repairs.',
  },
];

const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: FAQS.map((f) => ({
    '@type': 'Question',
    name: f.q,
    acceptedAnswer: { '@type': 'Answer', text: f.a },
  })),
};

const breadcrumbJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://bbsflooring.ca/' },
    { '@type': 'ListItem', position: 2, name: 'Project Planner', item: 'https://bbsflooring.ca/planner' },
  ],
};

export default function PlannerPage() {
  return (
    <div className="py-8 md:py-12">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />

      <div className="mx-auto max-w-6xl px-4">
        {/* Visual breadcrumb only — JSON-LD above is the single BreadcrumbList on this page. */}
        <nav aria-label="Breadcrumb" className="mb-6 text-sm text-slate-500">
          <Link href="/" className="hover:text-amber-700 hover:underline">Home</Link> <span aria-hidden="true">›</span> <span className="text-slate-700">Project Planner</span>
        </nav>

        <header className="mb-6 max-w-3xl">
          <h1 className="text-3xl font-bold text-slate-800 sm:text-4xl">Flooring Project Planner</h1>
          <p className="mt-2 text-base text-slate-600">
            Planning more than one room? Add each room, pick its floor, and see boxes, underlay, trim and the total — then add it all to your cart in one tap or book installation with your numbers filled in. Serving Markham, Toronto and the GTA.
          </p>
        </header>
      </div>

      <Suspense
        fallback={
          <div className="mx-auto max-w-6xl px-4">
            <div className="flex min-h-[300px] items-center justify-center rounded-2xl border border-slate-200 p-8 text-slate-500">Loading planner…</div>
          </div>
        }
      >
        <PlannerClient />
      </Suspense>

      <section className="mx-auto mt-12 max-w-3xl px-4">
        <h2 className="mb-4 text-xl font-bold text-slate-800">Planner FAQ</h2>
        <div className="space-y-4">
          {FAQS.map((f) => (
            <div key={f.q}>
              <h3 className="font-semibold text-slate-800">{f.q}</h3>
              <p className="mt-1 text-sm leading-relaxed text-slate-600">{f.a}</p>
            </div>
          ))}
        </div>
        <p className="mt-6 text-sm text-slate-600">
          Want exact numbers? Book a <Link href="/free-measurement" className="font-semibold text-amber-700 hover:underline">free in-home measurement</Link>.
        </p>
      </section>
    </div>
  );
}
