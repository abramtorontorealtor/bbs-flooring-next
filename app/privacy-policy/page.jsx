import Link from 'next/link';

export const metadata = {
  title: 'Privacy Policy',
  description: 'BBS Flooring privacy policy — how we collect, use, and safeguard your personal information under PIPEDA.',
};

export default function PrivacyPolicy() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="animate-fade-in-up">
        <h1 className="text-4xl font-bold text-slate-800 mb-4">Privacy Policy</h1>
        <p className="text-slate-600 mb-8">Effective Date: January 1st, 2025 · Last Updated: April 5, 2026</p>

        <div className="prose prose-slate max-w-none space-y-6">
          <p>
            BBS Flooring (&ldquo;we,&rdquo; &ldquo;our,&rdquo; or &ldquo;us&rdquo;) respects your privacy and is committed to protecting your personal information in accordance with Canada&rsquo;s <strong>Personal Information Protection and Electronic Documents Act (PIPEDA)</strong>. This Privacy Policy outlines how we collect, use, and safeguard your information when you visit our website (bbsflooring.ca), interact with us, or use our services.
          </p>

          <section>
            <h2 className="text-2xl font-bold text-slate-800 mt-8 mb-4">1. Information We Collect</h2>
            <p>We may collect personal information, such as:</p>
            <ul className="list-disc ml-6 space-y-2">
              <li>Your name, address, phone number, and email address.</li>
              <li>Information regarding the products and services you inquire about or purchase.</li>
              <li>Payment information processed securely through our payment provider (Stripe).</li>
              <li>Non-personal information collected automatically, such as browser type, IP address, device type, and pages visited.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-slate-800 mt-8 mb-4">2. How We Use Your Information</h2>
            <p>Your personal information may be used for the following purposes:</p>
            <ul className="list-disc ml-6 space-y-2">
              <li>To respond to inquiries, process orders, and schedule appointments.</li>
              <li>To communicate with you about our services, order updates, and customer support.</li>
              <li>To send transactional emails (order confirmations, booking confirmations, delivery updates).</li>
              <li>To improve our services and customer experience through analytics.</li>
              <li>To comply with applicable legal and regulatory requirements.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-slate-800 mt-8 mb-4">3. Third-Party Services</h2>
            <p>We use the following third-party services to operate our website and business. Each service may collect data as described below:</p>
            <div className="overflow-x-auto mt-4">
              <table className="min-w-full border-collapse text-sm">
                <thead>
                  <tr className="bg-slate-100">
                    <th className="text-left p-3 border-b border-slate-200 font-semibold">Service</th>
                    <th className="text-left p-3 border-b border-slate-200 font-semibold">Purpose</th>
                    <th className="text-left p-3 border-b border-slate-200 font-semibold">Data Collected</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="p-3 border-b border-slate-100">Google Analytics (GA4)</td>
                    <td className="p-3 border-b border-slate-100">Website analytics</td>
                    <td className="p-3 border-b border-slate-100">Pages visited, session duration, device type, approximate location. <a href="https://policies.google.com/privacy" className="text-amber-600 hover:underline" target="_blank" rel="noopener noreferrer">Google Privacy Policy</a></td>
                  </tr>
                  <tr>
                    <td className="p-3 border-b border-slate-100">Meta Pixel (Facebook/Instagram)</td>
                    <td className="p-3 border-b border-slate-100">Advertising measurement</td>
                    <td className="p-3 border-b border-slate-100">Page views, product views, add-to-cart events. <a href="https://www.facebook.com/privacy/policy/" className="text-amber-600 hover:underline" target="_blank" rel="noopener noreferrer">Meta Privacy Policy</a></td>
                  </tr>
                  <tr>
                    <td className="p-3 border-b border-slate-100">Stripe</td>
                    <td className="p-3 border-b border-slate-100">Payment processing</td>
                    <td className="p-3 border-b border-slate-100">Payment card details (processed directly by Stripe — we never see your full card number). <a href="https://stripe.com/privacy" className="text-amber-600 hover:underline" target="_blank" rel="noopener noreferrer">Stripe Privacy Policy</a></td>
                  </tr>
                  <tr>
                    <td className="p-3 border-b border-slate-100">SendGrid (Twilio)</td>
                    <td className="p-3 border-b border-slate-100">Transactional emails</td>
                    <td className="p-3 border-b border-slate-100">Email address, name (for order confirmations and communications). <a href="https://www.twilio.com/legal/privacy" className="text-amber-600 hover:underline" target="_blank" rel="noopener noreferrer">Twilio Privacy Policy</a></td>
                  </tr>
                  <tr>
                    <td className="p-3 border-b border-slate-100">Google Ads</td>
                    <td className="p-3 border-b border-slate-100">Advertising</td>
                    <td className="p-3 border-b border-slate-100">Conversion tracking via Google Ads tag. <a href="https://policies.google.com/privacy" className="text-amber-600 hover:underline" target="_blank" rel="noopener noreferrer">Google Privacy Policy</a></td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="mt-4">We do not sell or trade your personal information to third parties for their marketing purposes.</p>
            <p className="font-medium mt-4">
              All data sharing outlined in this policy excludes SMS opt-in consent. SMS opt-in data will never be shared, sold, or used for any purpose other than to deliver the services users have consented to receive.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-slate-800 mt-8 mb-4">4. SMS Messaging Privacy Policy</h2>
            
            <h3 className="text-xl font-semibold text-slate-800 mt-6 mb-3">4.1 Information We Collect</h3>
            <p>When you opt in to receive SMS messages, we may collect:</p>
            <ul className="list-disc ml-6 space-y-2">
              <li>Your mobile phone number.</li>
              <li>The content of messages sent to or received from you.</li>
              <li>Metadata (e.g., message time, date, and delivery status).</li>
            </ul>

            <h3 className="text-xl font-semibold text-slate-800 mt-6 mb-3">4.2 How We Use Your Information</h3>
            <p>We use SMS-related information to:</p>
            <ul className="list-disc ml-6 space-y-2">
              <li>Send updates about our services, appointment confirmations, and customer support messages.</li>
              <li>Provide customer support and respond to inquiries.</li>
              <li>Comply with legal and regulatory obligations.</li>
            </ul>
            <p className="font-medium mt-4">We do not send promotional or marketing messages via SMS.</p>

            <h3 className="text-xl font-semibold text-slate-800 mt-6 mb-3">4.3 Your Choices</h3>
            <ul className="list-disc ml-6 space-y-2">
              <li><strong>Opting Out:</strong> You may opt out of receiving SMS messages from BBS Flooring at any time by replying STOP to any message. No further messages will be sent after opting out. For assistance, reply HELP or contact us at info@bbsflooring.ca.</li>
              <li><strong>Help:</strong> For assistance, reply HELP or contact us directly at info@bbsflooring.ca.</li>
              <li><strong>Message Frequency:</strong> Message frequency varies based on your interactions with us.</li>
              <li><strong>Data Rates:</strong> Standard message and data rates may apply as per your mobile carrier&apos;s plan.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-slate-800 mt-8 mb-4">5. Cookies and Tracking Technologies</h2>
            <p>We use cookies and similar technologies to operate and improve our website. Here&rsquo;s what we use:</p>
            
            <h3 className="text-xl font-semibold text-slate-800 mt-6 mb-3">5.1 Essential Cookies</h3>
            <p>Required for the website to function properly. These include session management and shopping cart functionality. You cannot opt out of essential cookies.</p>
            
            <h3 className="text-xl font-semibold text-slate-800 mt-6 mb-3">5.2 Analytics Cookies</h3>
            <p>Google Analytics (GA4) uses cookies to understand how visitors interact with our website. Data collected includes pages visited, time on site, and device information. This data is aggregated and anonymized.</p>
            
            <h3 className="text-xl font-semibold text-slate-800 mt-6 mb-3">5.3 Marketing Cookies</h3>
            <p>Meta Pixel sets cookies to measure the effectiveness of our Facebook and Instagram advertising. These cookies track page views and conversion events on our site.</p>
            
            <h3 className="text-xl font-semibold text-slate-800 mt-6 mb-3">5.4 Managing Cookies</h3>
            <p>You can manage or disable cookies through your browser settings. Note that disabling essential cookies may affect website functionality. Most browsers allow you to:</p>
            <ul className="list-disc ml-6 space-y-2">
              <li>View and delete existing cookies</li>
              <li>Block third-party cookies</li>
              <li>Block cookies from specific sites</li>
              <li>Block all cookies</li>
            </ul>
            <p className="mt-2">You can also opt out of Google Analytics tracking by installing the <a href="https://tools.google.com/dlpage/gaoptout" className="text-amber-600 hover:underline" target="_blank" rel="noopener noreferrer">Google Analytics Opt-out Browser Add-on</a>.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-slate-800 mt-8 mb-4">6. Data Security</h2>
            <p>We implement appropriate security measures to protect your personal information from unauthorized access, use, or disclosure. These measures include:</p>
            <ul className="list-disc ml-6 space-y-2">
              <li>Encrypted connections (HTTPS/TLS) for all website traffic.</li>
              <li>Secure payment processing through Stripe (PCI-DSS compliant).</li>
              <li>Access controls limiting who within our organization can view personal data.</li>
              <li>Regular review of our data handling practices.</li>
            </ul>
            <p className="mt-2">However, no online system can guarantee complete security.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-slate-800 mt-8 mb-4">7. Data Retention</h2>
            <p>We retain your personal information only as long as necessary for the purposes described in this policy:</p>
            <ul className="list-disc ml-6 space-y-2">
              <li><strong>Order data:</strong> Retained for 7 years for tax and legal compliance.</li>
              <li><strong>Contact form submissions:</strong> Retained for 2 years unless you request deletion sooner.</li>
              <li><strong>Booking records:</strong> Retained for 2 years.</li>
              <li><strong>Email subscriber data:</strong> Retained until you unsubscribe or request deletion.</li>
              <li><strong>Analytics data:</strong> Governed by Google and Meta&rsquo;s respective retention policies.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-slate-800 mt-8 mb-4">8. Your Rights Under PIPEDA</h2>
            <p>Under Canada&rsquo;s PIPEDA, you have the right to:</p>
            <ul className="list-disc ml-6 space-y-2">
              <li><strong>Access</strong> your personal information that we hold.</li>
              <li><strong>Correct</strong> any inaccurate or incomplete personal information.</li>
              <li><strong>Request deletion</strong> of your personal information (subject to legal retention requirements).</li>
              <li><strong>Withdraw consent</strong> for certain data uses at any time.</li>
              <li><strong>File a complaint</strong> with the <a href="https://www.priv.gc.ca/" className="text-amber-600 hover:underline" target="_blank" rel="noopener noreferrer">Office of the Privacy Commissioner of Canada</a> if you believe your privacy rights have been violated.</li>
            </ul>
            <p className="mt-4">To exercise any of these rights, contact us using the information below. We will respond to your request within 30 days.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-slate-800 mt-8 mb-4">9. Changes to This Policy</h2>
            <p>We may update this Privacy Policy from time to time. Any changes will be posted on this page with an updated effective date. We encourage you to review this policy periodically.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-slate-800 mt-8 mb-4">10. Contact Us</h2>
            <p>For questions, concerns, or requests regarding this Privacy Policy or your personal information, please contact us:</p>
            <div className="mt-4 space-y-1">
              <p className="font-medium">BBS Flooring — Privacy Inquiries</p>
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
