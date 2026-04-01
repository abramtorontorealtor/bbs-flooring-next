import Link from 'next/link';

export const metadata = {
  title: 'Terms of Service | BBS Flooring',
  description: 'BBS Flooring terms of service and customer policies.',
};

export default function TermsOfService() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="animate-fade-in-up">
        <h1 className="text-4xl font-bold text-slate-800 mb-4">BBS Flooring Terms of Service & Customer Policies</h1>
        <p className="text-slate-600 mb-8">Effective Date: January 1st, 2025</p>

        <div className="prose prose-slate max-w-none space-y-6">
          <p>
            Welcome to BBS Flooring! These Terms of Service (&ldquo;Terms&rdquo;) govern your access to and use of our website (www.bbsflooring.ca) and related services. By using our services, you agree to comply with these Terms.
          </p>

          <section>
            <h2 className="text-2xl font-bold text-slate-800 mt-8 mb-4">1. Services Provided</h2>
            <p>BBS Flooring offers flooring products, consultations, and installation services. Detailed information about our offerings can be found on our website.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-slate-800 mt-8 mb-4">2. User Responsibilities</h2>
            <ul className="list-disc ml-6 space-y-2">
              <li><strong>Accurate Information:</strong> You agree to provide accurate and up-to-date information when interacting with us.</li>
              <li><strong>Compliance:</strong> You agree to use our services in compliance with applicable laws and regulations.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-slate-800 mt-8 mb-4">3. SMS Messaging</h2>
            <p>By providing your phone number, you consent to receive SMS messages from BBS Flooring related to service updates, appointment confirmations, and customer support inquiries. We do not send promotional or marketing messages via SMS. Message and data rates may apply. Reply STOP to unsubscribe at any time or HELP for assistance.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-slate-800 mt-8 mb-4">4. Intellectual Property</h2>
            <p>All content on our website, including text, graphics, logos, and images, is the property of BBS Flooring and protected by applicable intellectual property laws. Unauthorized use of this content is prohibited.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-slate-800 mt-8 mb-4">5. Limitation of Liability</h2>
            <p>To the fullest extent permitted by law, BBS Flooring shall not be liable for any indirect, incidental, or consequential damages resulting from your use of our services.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-slate-800 mt-8 mb-4">6. Governing Law</h2>
            <p>These Terms are governed by the laws of the Province of Ontario, Canada.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-slate-800 mt-8 mb-4">7. Contact Us</h2>
            <p>For further questions regarding SMS communications, please contact us at info@bbsflooring.ca.</p>
            <p className="mt-4">For any questions or concerns regarding these Terms, please contact us:</p>
            <div className="mt-4 space-y-1">
              <p className="font-medium">BBS Flooring</p>
              <p>B-6061 Highway 7 E, Markham, ON</p>
              <p>
                <a href="mailto:info@bbsflooring.ca" className="text-amber-600 hover:underline">
                  info@bbsflooring.ca
                </a>
              </p>
              <p>
                <a href="tel:6474281111" className="text-amber-600 hover:underline">
                  647-428-1111
                </a>
                {' '}or{' '}
                <a href="tel:9054716077" className="text-amber-600 hover:underline">
                  905-471-6077
                </a>
              </p>
              <p>
                <Link href="/contact" className="text-amber-600 hover:underline">
                  Contact Form
                </Link>
              </p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
