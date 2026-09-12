import { getSuppliesCatalog } from '@/lib/suppliesCatalog';
import { buildCategorySection } from '@/lib/supplyGuides';
import SupplyCategoryPage from '@/components/SupplyCategoryPage';

export const revalidate = 3600;

export const metadata = {
  title: 'Flooring Installer Tools — Tapping Blocks & Pull Bars | Markham',
  description:
    'Bullet Tools tapping blocks, Roberts pull bars and install kits for DIY laminate and vinyl plank installs. In stock in Markham, priced per piece.',
  alternates: { canonical: '/flooring-accessories/installer-tools' },
};

const FAQ = [
  {
    question: 'Do I really need special tools to install click-lock flooring?',
    answer:
      'A tapping block and pull bar prevent damage to plank edges that a hammer alone will cause, and make tight-fitting rows \u2014 especially the last row against a wall \u2014 far easier. For a DIY click-lock laminate or vinyl install, we always recommend at least a tapping block.',
  },
  {
    question: 'What\u2019s the difference between a tapping block and a pull bar?',
    answer:
      'A tapping block sits against the plank\u2019s edge so you can tap it into place with a mallet without denting or chipping the click profile. A pull bar (like the Roberts "Maverick") hooks the far edge of the last row against a wall, letting you pull that plank tight when there\u2019s no room to swing a tapping block.',
  },
  {
    question: 'What\u2019s included in a flooring installation kit?',
    answer:
      'The Roberts Pro Flooring Installation Kit bundles a tapping block, pull bar, and spacers in one set \u2014 a straightforward way to get everything a first-time DIY installer needs without buying each tool separately.',
  },
  {
    question: 'Are these tools only for laminate and vinyl?',
    answer:
      'Tapping blocks and pull bars are built for click-lock flooring (laminate and floating vinyl plank). Glue-down and nail-down installs use different techniques \u2014 see our Adhesives & Primers page for glue-down supplies.',
  },
];

export default async function InstallerToolsPage() {
  const catalog = await getSuppliesCatalog();
  const section = buildCategorySection(catalog, {
    id: 'installer-tools',
    title: 'Installer Tools',
    note: 'Pro-grade tapping blocks, pull bars and install kits for DIY click-lock installs.',
    categories: ['tools'],
  });

  return (
    <SupplyCategoryPage
      path="/flooring-accessories/installer-tools"
      title="Flooring Installer Tools"
      intro={[
        'Click-lock laminate and vinyl plank are designed to be DIY-friendly, but the last few rows of any room \u2014 the ones tight against a wall \u2014 are where a bare hammer chips plank edges and breaks click profiles. A tapping block and a pull bar solve that specific problem: they let you seat and pull planks tight without ever striking the flooring directly.',
        'If you\u2019re doing your first click-lock install, the Roberts Pro Flooring Installation Kit bundles the essentials in one box. If you already have a mallet and just need the pieces that touch the flooring, a Bullet Tools tapping block and a Roberts pull bar cover almost every situation you\u2019ll run into on a laminate or vinyl plank job.',
      ]}
      section={section}
      faqItems={FAQ}
      guideLinks={[]}
    />
  );
}
