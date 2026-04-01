import { Suspense } from 'react';
import QuoteCalculatorClient from '@/components/QuoteCalculatorClient';

export const metadata = {
  title: 'Free Flooring Quote Calculator | Instant Pricing | BBS Flooring',
  description: 'Get an instant flooring quote. Select your product, enter square footage, and see material + installation + removal costs. Free, no obligation. BBS Flooring Markham.',
  alternates: { canonical: '/quote-calculator' },
};

export default function QuoteCalculatorPage() {
  return <Suspense><QuoteCalculatorClient /></Suspense>;
}
