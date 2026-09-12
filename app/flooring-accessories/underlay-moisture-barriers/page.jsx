import { getSuppliesCatalog } from '@/lib/suppliesCatalog';
import { buildCategorySection } from '@/lib/supplyGuides';
import SupplyCategoryPage from '@/components/SupplyCategoryPage';

export const revalidate = 3600;

export const metadata = {
  title: 'Underlay & Moisture Barriers — Laminate, Vinyl & Concrete | Markham',
  description:
    'Underlay rolls, acoustic mats, and 6-mil poly moisture barriers for laminate, vinyl, and engineered hardwood over concrete or wood subfloors. In stock in Markham.',
  alternates: { canonical: '/flooring-accessories/underlay-moisture-barriers' },
};

const FAQ = [
  {
    question: 'What underlay do I need for laminate flooring?',
    answer:
      'Floating laminate almost always needs a separate underlay unless the plank has a pad already attached to the back or is a thick 14mm board. In a condo, use the 3mm black acoustic underlay (rated IIC 72/STC 73) to clear sound-transmission requirements; over concrete or below grade, step up to the 5mm airflow bubble pad or add a poly moisture barrier underneath.',
  },
  {
    question: 'Do I need underlay under vinyl plank flooring?',
    answer:
      'Usually not \u2014 most vinyl (SPC/LVP) sold today has a pad already attached to the back, and adding a second pad (pad-on-pad) can feel spongy and void the flooring warranty. Only bare vinyl with no attached pad needs a thin underlay; check your plank spec or ask us.',
  },
  {
    question: 'What moisture barrier thickness do I need over concrete?',
    answer:
      '6-mil poly (or thicker) is the standard minimum most independent flooring guides and manufacturers point to for laminate, SPC, and engineered wood over a concrete slab. Thinner film isn\u2019t considered a real vapor barrier, and skipping it on a slab is a common cause of a floating floor cupping or failing early.',
  },
  {
    question: 'Do I need both an underlay and a separate moisture barrier?',
    answer:
      'It depends on the product. Our 6-mil poly moisture barrier (Roberts Moisture Barricade) is a standalone film that goes under laminate or engineered wood over concrete. Some of our underlay rolls (like Roberts First Step / Unison "2-in-1" or "3-in-1") already combine a cushioning pad with a built-in moisture layer \u2014 those replace both products in one roll. Check the product spec or ask us which your subfloor needs.',
  },
  {
    question: 'What goes under nail-down solid hardwood?',
    answer:
      'Rosin/wax paper (not a foam underlay) goes down first, stapled to the plywood subfloor, before every nail-down solid hardwood install \u2014 it reduces squeaks and blocks moisture wicking from the subfloor. This is a required line item on every solid hardwood Install Kit on our product pages.',
  },
];

const GUIDE_LINKS = [
  { label: 'Which Underlayment for Laminate Flooring?', url: '/blog/which-underlayment-for-laminate-flooring' },
  { label: 'Moisture Barrier for Flooring on Concrete', url: '/blog/moisture-barrier-for-flooring-on-concrete' },
];

export default async function UnderlayMoistureBarriersPage() {
  const catalog = await getSuppliesCatalog();
  const section = buildCategorySection(catalog, {
    id: 'underlay-moisture-barriers',
    title: 'Underlay & Moisture Barriers',
    note: 'Sold per full roll. Underlay cushions and quiets a floating floor; a moisture barrier blocks vapor from a concrete or below-grade subfloor.',
    categories: ['underlay', 'moisture_barrier'],
  });

  return (
    <SupplyCategoryPage
      path="/flooring-accessories/underlay-moisture-barriers"
      title="Underlay & Moisture Barriers"
      intro={[
        'Underlay and moisture barriers solve two different problems that often get confused. Underlay is about comfort and sound \u2014 it cushions a floating floor underfoot and quiets footsteps, which matters most in a condo or a second-storey room. A moisture barrier is about protection \u2014 it blocks water vapor from wicking up through a concrete slab and warping or clouding the new floor from underneath. Some subfloors need one, some need both, and getting it backwards (or skipping the one you need) is one of the most common flooring-failure causes we see.',
        'The rule of thumb: floating laminate over a wood subfloor above grade usually just needs a standard underlay. Floating laminate, vinyl, or engineered wood over a concrete slab \u2014 especially below grade, in a basement, or over radiant heat \u2014 needs a real moisture barrier as well, either as a separate poly film or an underlay roll with one built in. Vinyl with a pad already attached to the back skips underlay entirely. The table below is the short version; every roll on this page lists its coverage so the calculator can size exactly how many you need.',
      ]}
      decisionTable={{
        title: 'Which underlay or barrier for which floor?',
        headers: ['Floor & subfloor', 'Use'],
        rows: [
          ['Laminate over wood subfloor, standard room', '2.5mm white foam underlay'],
          ['Laminate in a condo (sound requirements)', '3mm black acoustic underlay (IIC 72/STC 73)'],
          ['Laminate or engineered wood over concrete / below grade', '5mm airflow bubble underlay, or standard underlay + 6-mil poly barrier'],
          ['Vinyl with no attached pad', 'Thin vinyl-rated underlay (AcoustiTECH LV) \u2014 skip if plank already has a pad'],
          ['Nail-down solid hardwood', 'Rosin/wax paper (not a foam underlay)'],
        ],
      }}
      section={section}
      faqItems={FAQ}
      guideLinks={GUIDE_LINKS}
    />
  );
}
