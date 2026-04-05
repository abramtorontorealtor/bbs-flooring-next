export const metadata = {
  title: 'Return Policy',
  description: 'BBS Flooring return and exchange policy — 30-day returns with conditions.',
};

export default function ReturnPolicy() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="animate-fade-in-up">
        <h1 className="text-4xl font-bold text-slate-800 mb-4">Return Policy</h1>
        <p className="text-slate-600 mb-8">BBS Flooring – Markham, Toronto & Durham</p>

        <div className="prose prose-slate max-w-none space-y-6">
          <p>
            At BBS Flooring, we want you to be satisfied with your purchase. Please read our return policy below:
          </p>

          <section>
            <h2 className="text-2xl font-bold text-slate-800 mt-8 mb-4">Returns</h2>
            <ul className="list-disc ml-6 space-y-2">
              <li>Returns are accepted within 30 days of purchase and are subject to a 25% restocking fee.</li>
              <li>No returns are accepted after 30 days from purchase.</li>
              <li>All returned items must be unused, in their original packaging, and in original color/condition.</li>
              <li>Returns will not be accepted for any materials that have been installed or cut.</li>
              <li>Restocking fees may be waived in the event of documented manufacturer defects or shipping damage.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-slate-800 mt-8 mb-4">Exchanges</h2>
            <p>Exchanges are subject to the same 30-day window and 25% restocking fee. All items must be unused, in original packaging, and in original color/condition.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-slate-800 mt-8 mb-4">How to Initiate a Return or Exchange</h2>
            <p>
              Please contact us at{' '}
              <a href="mailto:info@bbsflooring.ca" className="text-amber-600 hover:underline">
                info@bbsflooring.ca
              </a>
              {' '}or call{' '}
              <a href="tel:6474281111" className="text-amber-600 hover:underline">
                647-428-1111
              </a>
              {' '}to initiate your return or exchange. Proof of purchase is required.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-slate-800 mt-8 mb-4">Additional Notes</h2>
            <ul className="list-disc ml-6 space-y-2">
              <li>Customers are responsible for checking materials upon receipt.</li>
              <li>Custom or special-order products may not be eligible for return.</li>
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
}
