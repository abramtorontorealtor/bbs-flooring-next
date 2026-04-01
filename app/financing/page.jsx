import FinancingClient from '@/components/FinancingClient';
import { JsonLd, localBusinessSchema } from '@/lib/schemas';

export const metadata = {
  title: 'Flooring Financing — Apply in Minutes | BBS Flooring Markham',
  description:
    'Finance your flooring project with BBS Flooring. Low monthly payments, 0% deferred options, and instant approvals through Financeit. Serving Markham, Toronto, and the GTA.',
};

const FINANCING_FAQS = [
  { question: 'How fast is the approval process?', answer: 'Financeit provides instant decisions online. Most customers are approved in minutes. You can apply from home before visiting the showroom.' },
  { question: 'What credit score do I need?', answer: 'Financeit works with a range of credit profiles. There are standard, extended, and second-look programs to accommodate more applicants. Applying does not affect your credit score initially.' },
  { question: 'Are there any prepayment penalties?', answer: 'No. All Financeit loans are completely open — you can pay off your balance at any time with no penalty.' },
  { question: 'Is this available across Ontario?', answer: 'Yes — financing is available across all of Canada except Quebec.' },
  { question: "What's the minimum and maximum loan amount?", answer: 'Financing is available from $1,000 to $100,000, covering everything from a single room to a whole-home project.' },
  { question: 'Can I combine financing with installation?', answer: 'Absolutely. Your financed amount can include flooring materials, installation labour, removal of existing floors, baseboards, and delivery — your full project total.' },
];

export default function FinancingPage() {
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: FINANCING_FAQS.map(faq => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: { '@type': 'Answer', text: faq.answer },
    })),
  };

  return (
    <>
      <JsonLd data={[localBusinessSchema(), faqSchema]} />
      <FinancingClient />
    </>
  );
}
