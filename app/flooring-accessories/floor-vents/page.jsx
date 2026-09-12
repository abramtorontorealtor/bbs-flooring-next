import { getSuppliesCatalog } from '@/lib/suppliesCatalog';
import { buildCategorySection } from '@/lib/supplyGuides';
import SupplyCategoryPage from '@/components/SupplyCategoryPage';

export const revalidate = 3600;

export const metadata = {
  title: 'Floor Vents — Wood & Metal Registers, Matched to Your Floor | Markham',
  description:
    'Species-matched wood floor vents (red oak, white oak, maple) and framed metal registers in 4x10 and 4x12 sizes. In stock in Markham, finished to match your new floor.',
  alternates: { canonical: '/flooring-accessories/floor-vents' },
};

const FAQ = [
  {
    question: 'How do I know what size floor vent I need?',
    answer:
      'Measure the rough opening in your subfloor, not the visible frame on your old vent \u2014 floor vents are sized to that opening, and the most common residential sizes are 4"\u00d710" and 4"\u00d712". If you\u2019re replacing an existing vent, measure the actual hole once the old one is out to be sure.',
  },
  {
    question: 'Can I get a floor vent that matches my new hardwood exactly?',
    answer:
      'Yes \u2014 we stock species-matched wood vents (red oak, white oak, maple) so the register reads as part of the floor instead of an obvious patch. For engineered or solid hardwood, matching the species gets you closest; for laminate or vinyl, a matte black or white framed metal register (Fittes) usually blends in better than an attempted wood match.',
  },
  {
    question: 'Do floor vents work with any flooring thickness?',
    answer:
      'Most floor vents are designed for standard 3/4" hardwood thickness. If your new floor is a different thickness (thin engineered, thick 14mm laminate), check the vent\u2019s frame depth or ask us \u2014 an ill-fitting vent frame is a common install headache that\u2019s easy to avoid by checking first.',
  },
  {
    question: 'Wood or metal floor vent \u2014 which should I choose?',
    answer:
      'Wood vents (Six Points species-matched) blend into a hardwood floor and can take the same finish. Metal-framed vents (Fittes) come pre-finished in colours like matte black or cotton white and are a better match for laminate, vinyl, or a modern colour scheme where you\u2019re not trying to match wood grain.',
  },
  {
    question: 'Can I install a floor vent myself?',
    answer:
      'Yes for a straightforward drop-in replacement into an existing opening \u2014 it\u2019s one of the simplest flooring add-ons there is. If you\u2019re cutting a new opening or the ductwork underneath needs adjusting, that\u2019s a job for your installer or an HVAC contractor.',
  },
];

export default async function FloorVentsPage() {
  const catalog = await getSuppliesCatalog();
  const section = buildCategorySection(catalog, {
    id: 'floor-vents',
    title: 'Floor Vents',
    note: 'Wood and metal floor registers, finished to match your new floor. Sold per piece.',
    categories: ['floor_vent'],
  });

  return (
    <SupplyCategoryPage
      path="/flooring-accessories/floor-vents"
      title="Floor Vents"
      intro={[
        'A mismatched floor vent is one of the easiest details to get wrong on an otherwise perfect flooring install \u2014 and one of the easiest to get right, because it\u2019s a small, inexpensive swap. Once your new floor is in, an old scuffed metal register or a vent finished for the previous floor stands out immediately. We stock both species-matched wood registers (for hardwood floors) and framed metal registers in modern finishes (for laminate, vinyl, or a contemporary look).',
        'The two things that matter when choosing a floor vent are size and material match. Size is about the rough opening in your subfloor \u2014 4"\u00d710" and 4"\u00d712" cover the vast majority of GTA homes, but always measure before ordering. Material match is about your new floor: hardwood floors read best with a species-matched wood vent (red oak, white oak, or maple, matched to your plank), while laminate and vinyl floors usually look cleaner with a pre-finished metal register in matte black or white rather than an attempted wood match.',
      ]}
      decisionTable={{
        title: 'Which floor vent for which floor?',
        headers: ['Your new floor', 'Recommended vent'],
        rows: [
          ['Red oak / white oak hardwood', 'Six Points species-matched wood vent'],
          ['Maple hardwood', 'Six Points maple wood vent'],
          ['Laminate or vinyl, modern black finish', 'Fittes framed metal register, matte black'],
          ['Laminate or vinyl, light/white finish', 'Fittes framed metal register, cotton white'],
          ['Not sure of your exact opening size', 'Measure the rough opening before ordering \u2014 ask us if unsure'],
        ],
      }}
      section={section}
      faqItems={FAQ}
      guideLinks={[{ label: 'Floor Vent Sizing & Matching Guide', url: '/blog/floor-vent-sizing-and-matching-guide' }]}
    />
  );
}
