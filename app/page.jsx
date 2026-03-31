import { LocalBusinessJsonLd } from '@/components/LocalBusinessJsonLd';

export const metadata = {
  title: 'BBS Flooring — Premium Hardwood, Vinyl & Laminate in Markham',
  description: 'BBS Flooring: premium hardwood, vinyl, laminate flooring and stair renovations in Markham, Toronto & Durham. Free in-home measurement. 4.7★ (41 reviews). Financing from $68/mo.',
};

export default function HomePage() {
  return (
    <>
      <LocalBusinessJsonLd />
      {/* Homepage content will be ported in Phase 2 */}
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <h1 className="text-4xl font-black text-slate-900 mb-4">
          BBS Flooring
        </h1>
        <p className="text-lg text-slate-600 max-w-2xl mx-auto">
          Premium flooring installation and materials in Markham, Toronto & Durham Region.
          Phase 1 scaffold is live — full homepage coming in Phase 2.
        </p>
      </div>
    </>
  );
}
