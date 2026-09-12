import { getSuppliesCatalog } from '@/lib/suppliesCatalog';
import { buildCategorySection } from '@/lib/supplyGuides';
import SupplyCategoryPage from '@/components/SupplyCategoryPage';

export const revalidate = 3600;

export const metadata = {
  title: 'Flooring Adhesives & Primers — Vinyl, Wood & Concrete | Markham',
  description:
    'Henry vinyl adhesives, Mapei wood adhesive, and Ardex concrete primers — in stock in Markham. Match the right adhesive to your floor type and subfloor, sized to your sqft.',
  alternates: { canonical: '/flooring-accessories/adhesives-primers' },
};

const FAQ = [
  {
    question: 'Which Henry adhesive do I need for glue-down vinyl?',
    answer:
      'For a standard subfloor, Henry 630 PeachPro is the workhorse — pressure-sensitive or wet-set, trowel or roller applied. If you\u2019re gluing over a concrete slab with elevated relative humidity (below-grade, radiant heat, or a slab that hasn\u2019t fully cured), step up to Henry 695 High-RH, rated for high moisture environments.',
  },
  {
    question: 'Do I need to prime concrete before gluing down vinyl or engineered hardwood?',
    answer:
      'Bare, porous, or dusty concrete should be primed first (Ardex P 4 or P 51 here) so the adhesive bonds evenly instead of soaking in unevenly and losing grab. Already-sealed or smooth power-troweled concrete may not need it \u2014 ask us if you\u2019re not sure about your slab.',
  },
  {
    question: 'What adhesive do I need for glue-down engineered hardwood?',
    answer:
      'Mapei Ultrabond ECO 983 is our moisture-control MS-polymer adhesive for full-spread glue-down engineered hardwood \u2014 it\u2019s rated for use over concrete with elevated moisture readings, which is exactly where glue-down wood floors most often fail if the wrong adhesive is used.',
  },
  {
    question: 'How much adhesive do I need for my room?',
    answer:
      'Use the calculator on each product page \u2014 enter your square footage and we\u2019ll size the number of gallons or pails automatically, based on the manufacturer\u2019s coverage rate for that adhesive. As a rule of thumb, always round up and buy a little extra rather than run short mid-install.',
  },
  {
    question: 'Pressure-sensitive vs. wet-set \u2014 which application method should I use?',
    answer:
      'Pressure-sensitive means you let the adhesive flash off until it\u2019s tacky/clear before setting the flooring \u2014 more forgiving for a first-time DIY install because you can reposition briefly. Wet-set means the flooring goes down while the adhesive is still wet \u2014 faster for a pro crew, less room for error. Both Henry adhesives we stock support either method.',
  },
];

const GUIDE_LINKS = [
  { label: 'How to Glue-Down Vinyl Plank Flooring', url: '/blog/how-to-glue-down-vinyl-plank-flooring' },
  { label: 'How Much Flooring Adhesive Do I Need?', url: '/blog/how-much-flooring-adhesive-do-i-need' },
];

export default async function AdhesivesPrimersPage() {
  const catalog = await getSuppliesCatalog();
  const section = buildCategorySection(catalog, {
    id: 'adhesives-primers',
    title: 'Adhesives & Primers',
    note: 'Sold per gallon or pail. Match the adhesive to your flooring type and subfloor moisture level below.',
    categories: ['adhesive', 'primer'],
  });

  return (
    <SupplyCategoryPage
      path="/flooring-accessories/adhesives-primers"
      title="Flooring Adhesives & Primers"
      intro={[
        'Glue-down flooring lives or dies on the adhesive underneath it \u2014 the wrong product, or skipping the primer step, is the single most common cause of a glue-down floor lifting, bubbling, or failing early. We stock a small, deliberate lineup covering the situations that actually come up: standard glue-down vinyl, high-humidity concrete slabs, and glue-down engineered hardwood, plus the primers that make each of those adhesives bond properly.',
        'The short version: match your flooring type first (vinyl vs. engineered hardwood use different adhesive chemistries), then match your subfloor\u2019s moisture level. A slab over grade with no known moisture issues can usually take a standard adhesive straight on. A below-grade slab, a slab with radiant heat, or a subfloor that hasn\u2019t fully cured needs either a primer step first, a high-RH-rated adhesive, or both \u2014 the decision table below covers the common cases. Every adhesive page on this site has an inline calculator that sizes exactly how many gallons or pails your room needs, so you\u2019re never guessing or over-ordering.',
      ]}
      decisionTable={{
        title: 'Which adhesive for which install?',
        headers: ['Situation', 'Use'],
        rows: [
          ['Glue-down vinyl, standard subfloor', 'Henry 630 PeachPro'],
          ['Glue-down vinyl, below-grade or high-humidity concrete', 'Henry 695 High-RH'],
          ['Glue-down engineered hardwood, any moisture level', 'Mapei Ultrabond ECO 983'],
          ['Bare / porous concrete before any adhesive above', 'Ardex P 4 or Ardex P 51 primer first'],
          ['Vinyl seam that needs sealing after install', 'Romus PVC cold-weld seam sealer'],
        ],
      }}
      section={section}
      faqItems={FAQ}
      guideLinks={GUIDE_LINKS}
    />
  );
}
