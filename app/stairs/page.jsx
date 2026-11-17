import StairsClient from '@/components/StairsClient';
import { stairsSchema, faqSchema, JsonLd } from '@/lib/schemas';
import { STAIRS_FAQS } from '@/data/faqs';
import AnswerBlock from '@/components/AnswerBlock';

export const metadata = {
  title: 'Staircase Renovation & Installation Markham & GTA 2026 | From $125/Step',
  description: 'Expert staircase renovation in Markham, Toronto & Durham. Refinishing from $125/step, new treads from $185/step, specialty steps $225/step. WSIB insured, free assessment. Call (647) 428-1111.',
  alternates: { canonical: '/stairs' },
};

export default function StairsPage() {
  return (
    <>
      <JsonLd data={[stairsSchema(), faqSchema(STAIRS_FAQS)]} />
      <StairsClient
        answerBlock={
          <AnswerBlock
            compact
            id="stair-cost-answer"
            question="How much does stair refinishing or recapping cost in the GTA?"
            answer="At BBS Flooring, stair refinishing starts at $125/step and new hardwood treads (recapping or carpet-to-hardwood) start at $185/step. Specialty and pie steps start at $225/step. BBS Flooring is a family-owned Markham flooring store and installer (since 2012); final stair pricing is confirmed after a free in-home measurement."
          />
        }
      />
    </>
  );
}
