import Link from 'next/link';
import { createPageUrl } from '@/lib/routes';

export const metadata = {
  title: 'Hardwood Flooring Grade Guide | Character, Select & Select Better Explained | BBS Flooring',
  description:
    'Learn the difference between hardwood flooring grades — Character (ABCD), Select (ABC), and Select & Better (AB). Find the right grade for your lifestyle, budget, and design goals.',
  keywords: [
    'hardwood flooring grades',
    'engineered hardwood grades explained',
    'character grade hardwood',
    'select grade hardwood',
    'select and better hardwood',
    'hardwood grade comparison',
  ],
  openGraph: {
    title: 'Hardwood Grade Guide | BBS Flooring',
    description:
      "Not sure which hardwood grade to choose? Our plain-English guide covers Character, Select, and Select & Better — what each looks like, who it suits, and what you'll pay.",
    url: 'https://bbsflooring.ca/grade-guide',
    siteName: 'BBS Flooring',
    type: 'article',
  },
  alternates: {
    canonical: 'https://bbsflooring.ca/grade-guide',
  },
};

// ─── Structured data ────────────────────────────────────────────────────────

const breadcrumbSchema = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://bbsflooring.ca' },
    { '@type': 'ListItem', position: 2, name: 'Grade Guide', item: 'https://bbsflooring.ca/grade-guide' },
  ],
};

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'What does hardwood flooring grade mean?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Hardwood flooring grade describes the visual appearance of the wood — specifically how many natural features like knots, mineral streaks, and colour variation are present. It does not affect structural quality or durability; every grade is equally strong.',
      },
    },
    {
      '@type': 'Question',
      name: 'Is Character grade hardwood lower quality?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'No. Character grade (ABCD) is not lower quality — it simply contains more of the wood\'s natural features: knots, mineral streaks, and colour variation. Many designers specifically choose Character grade for its warmth and authenticity. It is also the best-value option.',
      },
    },
    {
      '@type': 'Question',
      name: 'What is the difference between Select and Select & Better hardwood?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Select (ABC) allows some character marks — small knots and slight colour variation — while maintaining a cleaner, more uniform look. Select & Better (AB) is the most refined grade, with minimal knots and very consistent colour and grain. It is the premium choice for formal or luxury interiors.',
      },
    },
    {
      '@type': 'Question',
      name: 'Which hardwood grade is best for homes with kids or pets?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Character grade is ideal for active households. Its natural variation and darker tones hide everyday scratches, dents, and dirt far better than lighter, more uniform grades. It also offers the best value per square foot.',
      },
    },
    {
      '@type': 'Question',
      name: 'Does hardwood grade affect price?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes. Character grade is the most affordable because it uses more of each plank. Select grade commands a moderate premium. Select & Better is the most expensive because only the clearest, most consistent boards make the cut.',
      },
    },
    {
      '@type': 'Question',
      name: 'Can I mix hardwood grades in my home?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'You can, but it is generally best to stay consistent within an open-plan area. Some homeowners choose a uniform grade throughout for cohesion, while others use a premium grade in formal spaces (living room, master bedroom) and Character grade in high-traffic areas.',
      },
    },
  ],
};

// ─── Grade data ──────────────────────────────────────────────────────────────

const grades = [
  {
    id: 'character',
    label: 'Character',
    code: 'ABCD',
    tagline: 'Raw, real, and full of life.',
    price: '$',
    priceLabel: 'Best Value',
    priceColor: 'text-emerald-600',
    priceBg: 'bg-emerald-50',
    accentBorder: 'border-amber-400',
    accentBg: 'bg-amber-50',
    summary:
      'The most natural-looking grade. Knots, mineral streaks, colour variation, and sapwood are all present — exactly as nature intended. This is hardwood that tells a story.',
    characteristics: [
      'Visible knots (open and filled)',
      'Mineral streaks and colour variation',
      'Sapwood inclusion',
      'Distinct grain patterns',
      'Rich tonal contrast between planks',
    ],
    bestFor: ['Rustic & farmhouse interiors', 'Modern industrial spaces', 'High-traffic family homes', 'Pets & kids households', 'Budget-conscious renovations'],
    avoid: ['Minimalist or monochrome interiors', 'Spaces requiring strict uniformity'],
  },
  {
    id: 'select',
    label: 'Select',
    code: 'ABC',
    tagline: 'Balanced beauty. Character, curated.',
    price: '$$',
    priceLabel: 'Mid-Range',
    priceColor: 'text-sky-600',
    priceBg: 'bg-sky-50',
    accentBorder: 'border-slate-400',
    accentBg: 'bg-slate-50',
    summary:
      'A refined middle ground. Some natural character marks remain, but the overall appearance is cleaner and more consistent. The go-to grade for transitional and contemporary homes.',
    characteristics: [
      'Occasional small knots',
      'Moderate colour variation',
      'Mostly consistent grain direction',
      'Minimal sapwood',
      'Balanced, cohesive look',
    ],
    bestFor: ['Transitional & contemporary interiors', 'Open-concept living areas', 'Versatile design palettes', 'Buyers wanting character without chaos'],
    avoid: ['Ultra-formal luxury spaces', 'Interiors requiring zero variation'],
  },
  {
    id: 'select-better',
    label: 'Select & Better',
    code: 'AB',
    tagline: 'The pinnacle of refinement.',
    price: '$$$',
    priceLabel: 'Premium',
    priceColor: 'text-violet-600',
    priceBg: 'bg-violet-50',
    accentBorder: 'border-slate-600',
    accentBg: 'bg-white',
    summary:
      'Only the clearest, most consistent boards make this grade. Minimal knots, uniform colour, and smooth grain deliver a polished, showroom-quality look that never goes out of style.',
    characteristics: [
      'Virtually no knots',
      'Consistent colour throughout',
      'Uniform, tight grain pattern',
      'No sapwood',
      'Seamless, expansive visual flow',
    ],
    bestFor: ['Formal living rooms & dining rooms', 'Luxury master suites', 'High-end residential & commercial', 'Minimalist and Scandinavian interiors'],
    avoid: ['High-traffic areas where perfection shows wear', 'Budgets under pressure'],
  },
];

const decisionCards = [
  {
    icon: '🐾',
    scenario: 'Got kids or pets?',
    recommendation: 'Character (ABCD)',
    reason: 'Natural variation hides scratches and scuffs. Easier to live with, easier on the budget.',
    gradeId: 'character',
  },
  {
    icon: '🏡',
    scenario: 'Love a warm, lived-in look?',
    recommendation: 'Character (ABCD)',
    reason: 'Knots and mineral streaks give each room a one-of-a-kind personality that only gets better with age.',
    gradeId: 'character',
  },
  {
    icon: '🛋️',
    scenario: 'Want balance — clean but not sterile?',
    recommendation: 'Select (ABC)',
    reason: 'Some natural marks remain, but the overall floor feels cohesive and contemporary.',
    gradeId: 'select',
  },
  {
    icon: '✨',
    scenario: 'Want a showroom floor?',
    recommendation: 'Select & Better (AB)',
    reason: 'Flawless consistency from wall to wall. The definitive luxury statement.',
    gradeId: 'select-better',
  },
  {
    icon: '💰',
    scenario: 'Working with a tight budget?',
    recommendation: 'Character (ABCD)',
    reason: 'Best dollar-per-square-foot value without sacrificing quality or durability.',
    gradeId: 'character',
  },
  {
    icon: '🏢',
    scenario: 'Designing a formal or luxury space?',
    recommendation: 'Select & Better (AB)',
    reason: 'Minimal variation creates the calm, elevated atmosphere formal spaces demand.',
    gradeId: 'select-better',
  },
];

// ─── Page ────────────────────────────────────────────────────────────────────

export default function GradeGuidePage() {
  return (
    <>
      {/* JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      <main>

        {/* ── Hero ─────────────────────────────────────────────────────────── */}
        <section className="bg-slate-900 text-white py-20 px-4">
          <div className="max-w-5xl mx-auto">
            {/* Breadcrumb */}
            <nav aria-label="Breadcrumb" className="mb-8">
              <ol className="flex items-center gap-2 text-sm text-slate-400">
                <li><Link href="/" className="hover:text-amber-400 transition-colors">Home</Link></li>
                <li aria-hidden="true" className="text-slate-600">/</li>
                <li className="text-slate-200" aria-current="page">Grade Guide</li>
              </ol>
            </nav>

            <div className="max-w-3xl">
              <span className="inline-block text-amber-400 text-sm font-semibold tracking-widest uppercase mb-4">
                Buyer&apos;s Education
              </span>
              <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-6">
                Hardwood Flooring<br />
                <span className="text-amber-400">Grade Guide</span>
              </h1>
              <p className="text-lg text-slate-300 leading-relaxed max-w-2xl">
                Every hardwood floor starts as the same raw material — the difference is which boards make the cut.
                Understanding grades helps you choose a floor that fits your lifestyle, your aesthetic, and your budget.
                No jargon. No pressure. Just the facts.
              </p>
            </div>
          </div>
        </section>

        {/* ── What Is a Grade? ─────────────────────────────────────────────── */}
        <section className="bg-amber-50 py-14 px-4">
          <div className="max-w-5xl mx-auto">
            <div className="grid md:grid-cols-3 gap-6">
              <div className="md:col-span-2">
                <h2 className="text-2xl font-bold text-slate-900 mb-3">What Does "Grade" Actually Mean?</h2>
                <p className="text-slate-600 leading-relaxed mb-4">
                  Hardwood grade describes the <strong>visual appearance</strong> of the wood — specifically how many natural features
                  like knots, mineral streaks, and colour variation are allowed in each plank. It has nothing to do with structural
                  quality or durability. A Character-grade board is just as strong as a Select & Better board; it simply looks more natural.
                </p>
                <p className="text-slate-600 leading-relaxed">
                  Grades are set by the manufacturer and generally follow the North American industry standard (NHLA), though
                  terminology can vary slightly by brand. At BBS Flooring, we use three primary grades across our engineered
                  and solid hardwood collections.
                </p>
              </div>
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 flex flex-col justify-center">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-3">Quick Reference</p>
                <ul className="space-y-3">
                  <li className="flex items-center gap-3">
                    <span className="w-8 h-8 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center text-xs font-bold shrink-0">ABCD</span>
                    <span className="text-slate-700 font-medium">Character — most natural</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <span className="w-8 h-8 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center text-xs font-bold shrink-0">ABC</span>
                    <span className="text-slate-700 font-medium">Select — balanced</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <span className="w-8 h-8 rounded-full bg-slate-800 text-white flex items-center justify-center text-xs font-bold shrink-0">AB</span>
                    <span className="text-slate-700 font-medium">Select & Better — premium</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* ── Grade Cards ──────────────────────────────────────────────────── */}
        <section className="bg-white py-20 px-4">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-3xl font-bold text-slate-900 mb-2">The Three Grades, Side by Side</h2>
            <p className="text-slate-600 leading-relaxed mb-12 max-w-2xl">
              Each grade has its own personality. Here&apos;s what to expect from every plank.
            </p>

            <div className="grid md:grid-cols-3 gap-6">
              {grades.map((grade) => (
                <div
                  key={grade.id}
                  className={`rounded-2xl shadow-sm border border-slate-100 overflow-hidden flex flex-col`}
                >
                  {/* Card header */}
                  <div className={`${grade.accentBg} border-b-4 ${grade.accentBorder} px-6 pt-7 pb-5`}>
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <div>
                        <span className="text-xs font-bold text-slate-400 tracking-widest uppercase">{grade.code}</span>
                        <h3 className="text-xl font-bold text-slate-900 mt-0.5">{grade.label}</h3>
                      </div>
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${grade.priceBg} ${grade.priceColor}`}>
                        {grade.priceLabel}
                      </span>
                    </div>
                    <p className="text-sm font-medium text-slate-500 italic">{grade.tagline}</p>
                  </div>

                  {/* Card body */}
                  <div className="px-6 py-5 flex flex-col gap-5 flex-1">
                    <p className="text-slate-600 text-sm leading-relaxed">{grade.summary}</p>

                    <div>
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">What You'll See</p>
                      <ul className="space-y-1.5">
                        {grade.characteristics.map((c) => (
                          <li key={c} className="flex items-start gap-2 text-sm text-slate-600">
                            <span className="text-amber-500 mt-0.5 shrink-0">✓</span>
                            {c}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Best For</p>
                      <ul className="space-y-1.5">
                        {grade.bestFor.map((b) => (
                          <li key={b} className="flex items-start gap-2 text-sm text-slate-700 font-medium">
                            <span className="text-slate-300 mt-0.5 shrink-0">→</span>
                            {b}
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Price indicator */}
                    <div className="mt-auto pt-4 border-t border-slate-100">
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5">Price Range</p>
                      <div className="flex items-center gap-1">
                        {['$', '$$', '$$$'].map((tier) => (
                          <span
                            key={tier}
                            className={`text-sm font-bold ${grade.price === tier ? grade.priceColor : 'text-slate-200'}`}
                          >
                            {tier}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Comparison Table ─────────────────────────────────────────────── */}
        <section className="bg-slate-50 py-20 px-4">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-3xl font-bold text-slate-900 mb-2">Grade Comparison at a Glance</h2>
            <p className="text-slate-600 leading-relaxed mb-10">A quick-reference table for the detail-oriented buyer.</p>

            <div className="overflow-x-auto rounded-2xl border border-slate-200 shadow-sm">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-900 text-white">
                    <th className="text-left px-6 py-4 font-semibold text-slate-300 w-40">Feature</th>
                    <th className="text-left px-6 py-4 font-semibold">
                      <span className="text-amber-400">Character</span>
                      <span className="block text-xs font-normal text-slate-400 mt-0.5">ABCD</span>
                    </th>
                    <th className="text-left px-6 py-4 font-semibold">
                      <span className="text-slate-200">Select</span>
                      <span className="block text-xs font-normal text-slate-400 mt-0.5">ABC</span>
                    </th>
                    <th className="text-left px-6 py-4 font-semibold">
                      <span className="text-slate-200">Select & Better</span>
                      <span className="block text-xs font-normal text-slate-400 mt-0.5">AB</span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ['Knots', 'Many, varied sizes', 'Occasional, small', 'Virtually none'],
                    ['Colour variation', 'High', 'Moderate', 'Low'],
                    ['Sapwood', 'Present', 'Minimal', 'None'],
                    ['Mineral streaks', 'Frequent', 'Occasional', 'Rare'],
                    ['Grain consistency', 'Variable', 'Mostly consistent', 'Very consistent'],
                    ['Visual uniformity', 'Low', 'Medium', 'High'],
                    ['Price point', 'Best value ($)', 'Mid-range ($$)', 'Premium ($$$)'],
                    ['Best setting', 'Rustic / Modern / Family', 'Transitional / Contemporary', 'Formal / Luxury'],
                  ].map(([feature, char, sel, sb], i) => (
                    <tr key={feature} className={i % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                      <td className="px-6 py-3.5 font-medium text-slate-700">{feature}</td>
                      <td className="px-6 py-3.5 text-slate-600">{char}</td>
                      <td className="px-6 py-3.5 text-slate-600">{sel}</td>
                      <td className="px-6 py-3.5 text-slate-600">{sb}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* ── Decision Helper ───────────────────────────────────────────────── */}
        <section className="bg-white py-20 px-4">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-3xl font-bold text-slate-900 mb-2">Which Grade Is Right For You?</h2>
            <p className="text-slate-600 leading-relaxed mb-12 max-w-2xl">
              The best grade isn&apos;t the most expensive one — it&apos;s the one that fits your life. Find your scenario below.
            </p>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {decisionCards.map((card) => (
                <div
                  key={card.scenario}
                  className="rounded-2xl border border-slate-100 shadow-sm bg-white p-6 flex flex-col gap-3 hover:border-amber-200 hover:shadow-md transition-all"
                >
                  <span className="text-3xl" role="img" aria-label="">{card.icon}</span>
                  <p className="text-base font-semibold text-slate-800">{card.scenario}</p>
                  <p className="text-xs text-amber-600 font-bold uppercase tracking-widest">
                    → {card.recommendation}
                  </p>
                  <p className="text-sm text-slate-500 leading-relaxed">{card.reason}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Price Context ─────────────────────────────────────────────────── */}
        <section className="bg-slate-900 text-white py-20 px-4">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-3xl font-bold text-white mb-2">Understanding the Price Difference</h2>
            <p className="text-slate-400 leading-relaxed mb-12 max-w-2xl">
              Grade affects price because sorting takes labour — and higher grades produce fewer usable planks per log.
            </p>

            <div className="grid md:grid-cols-3 gap-6">
              {[
                {
                  grade: 'Character (ABCD)',
                  icon: '🌿',
                  position: 'Best Value',
                  color: 'border-amber-500',
                  highlight: 'text-amber-400',
                  explanation:
                    'The most planks per log make it to this grade, which means lower cost passed on to you. Don\'t mistake "affordable" for "lesser" — Character grade is one of the most popular choices among designers.',
                },
                {
                  grade: 'Select (ABC)',
                  icon: '⚖️',
                  position: 'Mid-Range Premium',
                  color: 'border-slate-400',
                  highlight: 'text-slate-300',
                  explanation:
                    'A moderate premium for a cleaner look. You\'re paying for the extra sorting labour and the slightly smaller yield of planks that meet the stricter visual criteria.',
                },
                {
                  grade: 'Select & Better (AB)',
                  icon: '💎',
                  position: 'Luxury Premium',
                  color: 'border-violet-400',
                  highlight: 'text-violet-400',
                  explanation:
                    'Only the clearest boards pass. Fewer boards per log means the cost per square foot is higher — but you\'re getting the most refined, uniform floor available.',
                },
              ].map((item) => (
                <div key={item.grade} className={`rounded-2xl border-t-4 ${item.color} bg-slate-800 p-6`}>
                  <span className="text-2xl mb-3 block">{item.icon}</span>
                  <p className={`text-xs font-bold uppercase tracking-widest mb-1 ${item.highlight}`}>{item.position}</p>
                  <h3 className="text-lg font-bold text-white mb-3">{item.grade}</h3>
                  <p className="text-slate-400 text-sm leading-relaxed">{item.explanation}</p>
                </div>
              ))}
            </div>

            <p className="text-slate-500 text-sm mt-8 max-w-2xl">
              * Exact pricing depends on species, finish, plank width, and brand. Our team can walk you through current pricing
              for any product in our collection — no commitment required.
            </p>
          </div>
        </section>

        {/* ── FAQ ──────────────────────────────────────────────────────────── */}
        <section className="bg-slate-50 py-20 px-4">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-3xl font-bold text-slate-900 mb-2">Frequently Asked Questions</h2>
            <p className="text-slate-600 leading-relaxed mb-12">Straight answers to the questions we hear most.</p>

            <div className="space-y-4 max-w-3xl">
              {faqSchema.mainEntity.map((faq) => (
                <div key={faq.name} className="rounded-2xl bg-white border border-slate-100 shadow-sm px-7 py-6">
                  <h3 className="text-base font-bold text-slate-900 mb-2">{faq.name}</h3>
                  <p className="text-slate-600 leading-relaxed text-sm">{faq.acceptedAnswer.text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── CTA ──────────────────────────────────────────────────────────── */}
        <section className="bg-amber-600 py-20 px-4">
          <div className="max-w-5xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-white mb-4">Still not sure which grade is right for you?</h2>
            <p className="text-amber-100 leading-relaxed mb-8 max-w-xl mx-auto text-lg">
              Our team lives and breathes hardwood. Book a free consultation and we&apos;ll help you find the perfect grade,
              species, and finish for your space — no pressure, no obligation.
            </p>
            <Link
              href={createPageUrl('Contact')}
              className="inline-flex items-center gap-2 bg-white text-amber-700 font-bold px-8 py-4 rounded-xl text-base hover:bg-amber-50 transition-colors shadow-lg"
            >
              Book a Free Consultation
              <span aria-hidden="true">→</span>
            </Link>
          </div>
        </section>

      </main>
    </>
  );
}
