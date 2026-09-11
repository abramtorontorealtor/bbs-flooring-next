import { Suspense } from 'react';
import CondoRequirementsClient from '@/components/CondoRequirementsClient';
import { faqSchema, JsonLd } from '@/lib/schemas';
import DeepPageCapture from '@/components/DeepPageCapture';

const faqItems = [
  {
    question: 'What documents does my condo board require before a flooring installation?',
    answer: 'Most GTA condo corporations require a Certificate of Insurance (COI) naming the condo corporation as additional insured, a WSIB clearance certificate for the installer, and proof the flooring assembly meets the building\'s minimum acoustic rating (IIC/underlay spec sheet). For hardwood or laminate over concrete, many buildings also require a signed alteration agreement (often called a Section 98 agreement under the Ontario Condominium Act, 1998) before work starts. BBS Flooring supplies the COI, WSIB clearance, and underlay spec sheets on request — your building\'s declaration and rules always govern the exact list.',
  },
  {
    question: 'What is a Section 98 agreement and do I need one for flooring?',
    answer: 'A Section 98 agreement is a legal document between a unit owner and the condo corporation under the Ontario Condominium Act, 1998, covering alterations to common elements or a change that affects sound/vibration transmission — hardwood and laminate installs commonly trigger one. It gets registered on title and outlines responsibility for repair, maintenance, and insurance. Not every building requires it for every flooring type (some only require it for hardwood, not vinyl or carpet), so check with your property manager before booking install day.',
  },
  {
    question: 'What IIC or STC rating does condo flooring need in Toronto?',
    answer: 'It varies by building — there is no single citywide number. Many GTA condo declarations set a minimum IIC (Impact Insulation Class) of 50 for the finished floor assembly (flooring + underlay together), but a growing number of newer towers require IIC 60, and some request 70–73 for units above amenity spaces or parking. The Ontario Building Code sets a baseline STC 50 for sound separation between dwelling units, which many buildings use as their reference floor. Always confirm your building\'s exact number in the condo declaration or with your property manager before buying underlay — BBS can match a spec sheet to whatever number your building requires.',
  },
  {
    question: 'Do I need a Certificate of Insurance (COI) for a condo flooring install?',
    answer: 'Yes — nearly every GTA condo corporation requires the installer to provide a Certificate of Insurance naming the condo corporation (and sometimes the property management company) as additional insured before work begins. BBS Flooring carries commercial liability insurance and provides a COI on request, typically within a day or two of your booking.',
  },
  {
    question: 'Does BBS Flooring provide WSIB clearance certificates for condo jobs?',
    answer: 'Yes. BBS Flooring is a WSIB-registered employer and provides a current WSIB clearance certificate on request — this is standard paperwork most condo property managers require before granting building access for any installation crew.',
  },
  {
    question: 'How long does condo board approval take before installation can start?',
    answer: 'Plan for 1–4 weeks depending on the building. Most boards or property managers review the alteration request, underlay spec sheet, COI, and WSIB clearance at a scheduled meeting or via management sign-off, then confirm an elevator booking window. Buildings with monthly board meetings can take longer than buildings where the property manager can approve directly. Submit your paperwork as early as possible — BBS can usually turn around the required documents within 2–3 business days of booking.',
  },
  {
    question: 'Can BBS Flooring book the elevator and follow condo move-in rules?',
    answer: 'Yes. BBS crews are experienced with GTA condo logistics — booking the service elevator, installing moving-pad protection in hallways and elevators, working within the building\'s permitted hours (typically weekday daytime, often no Sundays or holidays), and removing debris off-site rather than through common garbage rooms. Tell us your building\'s rules during your free measurement and we\'ll plan the install day around them.',
  },
  {
    question: 'What is the best flooring for a condo in Toronto?',
    answer: 'Vinyl (SPC/LVP) with an attached or separate acoustic underlay is the most popular choice for GTA condos — waterproof, easy to meet IIC requirements, and budget-friendly from $1.69/sqft material. Laminate from $1.49/sqft is a cheaper option if your building\'s IIC threshold is moderate. Engineered hardwood (from $3.00/sqft material, $3.25/sqft glue-down install) gives a premium look but usually requires the highest-rated underlay and, in many buildings, a Section 98 agreement. BBS can recommend the right product once we know your building\'s specific acoustic requirement.',
  },
];

export const metadata = {
  title: 'Condo Flooring Installation Requirements Toronto & GTA (2026) | BBS Flooring',
  description: 'What your condo board or property manager requires before a flooring install: COI, WSIB clearance, IIC/STC underlay specs, and the approval process. BBS Flooring supplies all the paperwork. Serving Toronto, North York, Markham, Vaughan & Mississauga.',
  alternates: { canonical: '/condo-flooring-installation-requirements' },
  openGraph: {
    title: 'Condo Flooring Installation Requirements | Toronto & GTA (2026)',
    description: 'COI, WSIB clearance, acoustic underlay specs, and the approval process explained — plus what BBS Flooring handles for you on every condo install.',
    url: 'https://bbsflooring.ca/condo-flooring-installation-requirements',
    type: 'article',
  },
};

export default function CondoRequirementsPage() {
  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: 'Condo Flooring Installation Requirements in Toronto & the GTA (2026)',
    description: metadata.description,
    author: {
      '@type': 'Organization',
      name: 'BBS Flooring',
      url: 'https://bbsflooring.ca',
    },
    publisher: {
      '@type': 'Organization',
      name: 'BBS Flooring',
      url: 'https://bbsflooring.ca',
      logo: {
        '@type': 'ImageObject',
        url: 'https://cdn.bbsflooring.ca/storage/v1/object/public/blog-images/bbs-logo-official-v2.png',
      },
    },
    datePublished: '2026-09-11',
    dateModified: '2026-09-11',
    mainEntityOfPage: 'https://bbsflooring.ca/condo-flooring-installation-requirements',
  };

  const schemas = [
    articleSchema,
    faqSchema(faqItems),
  ];

  return (
    <>
      <JsonLd data={schemas} />
      <Suspense><CondoRequirementsClient /></Suspense>
      <DeepPageCapture productType="vinyl" />
    </>
  );
}
