import { getSuppliesCatalog } from '@/lib/suppliesCatalog';
import { buildCategorySection } from '@/lib/supplyGuides';
import SupplyCategoryPage from '@/components/SupplyCategoryPage';

export const revalidate = 3600;

export const metadata = {
  title: 'Subfloor Prep — Self-Leveling Compound & Patch | Markham',
  description:
    'Ardex K 15, Custom LevelQuik ES, Ardex Feather Finish and GPS patch compound — flatten a subfloor before laminate, vinyl or hardwood installation. In stock in Markham.',
  alternates: { canonical: '/flooring-accessories/subfloor-prep' },
};

const FAQ = [
  {
    question: 'Do I need to level my subfloor before installing new flooring?',
    answer:
      'Most flooring manufacturers specify a maximum allowable dip \u2014 commonly around 3/16" over a 10-foot span, though this varies by product, so check your flooring\u2019s installation instructions. If your subfloor has low spots, humps, or an old adhesive residue pattern beyond that, levelling it first prevents dips telegraphing through the new floor and voiding the warranty.',
  },
  {
    question: 'Patch compound or full self-leveling pour \u2014 which do I need?',
    answer:
      'Small gouges, seams, and isolated low spots are a job for a patch/skimcoat compound like Ardex Feather Finish or Ardex GPS \u2014 quick, trowel-applied, no mixing equipment needed. A subfloor that\u2019s sloped or uneven across a large area needs a self-leveling underlayment (Ardex K 15 or Custom LevelQuik ES) that pours and finds its own level.',
  },
  {
    question: 'Do I need to prime before pouring a self-leveler?',
    answer:
      'On concrete, yes \u2014 nearly every self-leveling underlayment manufacturer requires a compatible primer first (Ardex P 51 for Ardex K 15) so the leveler doesn\u2019t dry too fast at the surface and lose its bond to the slab. Skipping this step is one of the most common reasons a self-leveler cracks or delaminates.',
  },
  {
    question: 'How thick can I pour a self-leveler in one shot?',
    answer:
      'Ardex K 15 levels up to about 1/4" per pour and can be tapered at the edges to meet existing elevations. Custom LevelQuik ES (the "Extended Setting" formula) can be poured up to about 1.5" thick in one shot, and gives you more working time before it sets \u2014 useful for a larger room or a DIY pour without a pump.',
  },
  {
    question: 'How long before I can install flooring over a self-leveler or patch compound?',
    answer:
      'It depends on the product and your new floor covering \u2014 Ardex Feather Finish can be ready for flooring in as fast as 15\u201320 minutes since it\u2019s self-drying, while a full self-leveling pour typically needs several hours to walk on and up to 16 hours before installing most floor coverings. Always check the bag for the exact schedule on the day you pour.',
  },
];

const GUIDE_LINKS = [
  { label: 'How to Self-Level a Subfloor Before Flooring', url: '/blog/how-to-self-level-a-subfloor-before-flooring' },
];

export default async function SubfloorPrepPage() {
  const catalog = await getSuppliesCatalog();
  const section = buildCategorySection(catalog, {
    id: 'subfloor-prep',
    title: 'Subfloor Prep',
    note: 'Self-levelling underlayment and patch/skimcoat compounds, sold per bag.',
    categories: ['subfloor_prep'],
  });

  return (
    <SupplyCategoryPage
      path="/flooring-accessories/subfloor-prep"
      title="Subfloor Prep — Self-Leveling Compound & Patch"
      intro={[
        'A flat subfloor is the part of a flooring install nobody sees and everybody notices when it\u2019s skipped \u2014 dips and ridges telegraph through laminate and vinyl, and can leave engineered or solid hardwood squeaking or gapping over time. Before any new floor goes down, the existing subfloor needs to be within the flooring manufacturer\u2019s allowable flatness tolerance, and that usually means either a targeted patch or a full self-leveling pour.',
        'We stock both ends of that job: Ardex Feather Finish and Ardex GPS for smaller gouges, seams and low spots that just need a trowel and a bit of feathering, and Ardex K 15 or Custom LevelQuik ES for a subfloor that\u2019s sloped or uneven across a larger area and needs a full self-leveling pour. Concrete subfloors need a compatible primer first in almost every case \u2014 it\u2019s the step that gets skipped most often and the one most likely to cause a leveler to fail. The decision table below is the short version of which product fits which job.',
      ]}
      decisionTable={{
        title: 'Patch compound vs. self-leveling pour',
        headers: ['Subfloor condition', 'Use'],
        rows: [
          ['Small gouges, seams, isolated dips', 'Ardex Feather Finish or Ardex GPS (trowel-applied patch)'],
          ['Sloped or uneven across a large area', 'Ardex K 15 or Custom LevelQuik ES (self-leveling pour)'],
          ['Bare concrete before any leveler above', 'Ardex P 51 primer first'],
          ['Need more working time for a DIY pour', 'Custom LevelQuik ES (extended setting)'],
          ['Fastest re-cover for a small patch', 'Ardex Feather Finish (flooring in as fast as 15\u201320 min)'],
        ],
      }}
      section={section}
      faqItems={FAQ}
      guideLinks={GUIDE_LINKS}
    />
  );
}
