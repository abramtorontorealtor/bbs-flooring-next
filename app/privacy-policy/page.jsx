import Link from 'next/link';

export const metadata = {
  title: 'Privacy Policy',
  description: 'BBS Flooring privacy policy — how we collect, use, and safeguard your personal information.',
};

export default function PrivacyPolicy() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="animate-fade-in-up">
        <h1 className="text-4xl font-bold text-slate-800 mb-4">Privacy Policy</h1>
        <p className="text-slate-600 mb-8">Effective Date: January 1st, 2025</p>

        <div className="prose prose-slate max-w-none space-y-6">
          <p>
            BBS Flooring (&ldquo;we,&rdquo; &ldquo;our,&rdquo; or &ldquo;us&rdquo;) respects your privacy and is committed to protecting your personal information. This Privacy Policy outlines how we collect, use, and safeguard your information when you visit our website (www.bbsflooring.ca), interact with us, or use our services.
          </p>

          <section>
            <h2 className="text-2xl font-bold text-slate-800 mt-8 mb-4">1. Information We Collect</h2>
            <p>We may collect personal information, such as:</p>
            <ul className="list-disc ml-6 space-y-2">
              <li>Your name, address, phone number, and email address.</li>
              <li>Information regarding the products and services you inquire about or purchase.</li>
              <li>Non-personal information collected automatically, such as browser type, IP address, and cookies.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-slate-800 mt-8 mb-4">2. How We Use Your Information</h2>
            <p>Your personal information may be used for the following purposes:</p>
            <ul className="list-disc ml-6 space-y-2">
              <li>To respond to inquiries and process orders.</li>
              <li>To communicate with you about our services, appointment updates, and customer support.</li>
              <li>To improve our services and customer experience.</li>
              <li>To comply with applicable legal and regulatory requirements.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-slate-800 mt-8 mb-4">3. Sharing Your Information</h2>
            <p>We do not sell or trade your personal information to third parties. However, we may share your data:</p>
            <ul className="list-disc ml-6 space-y-2">
              <li>With service providers to assist in delivering our services.</li>
              <li>When required by law or legal processes.</li>
            </ul>
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

            <h3 className="text-xl font-semibold text-slate-800 mt-6 mb-3">4.4 Data Security</h3>
            <p>BBS Flooring takes reasonable administrative, technical, and physical measures to protect personal information shared via SMS from unauthorized access, disclosure, or misuse.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-slate-800 mt-8 mb-4">5. Cookies and Tracking Technologies</h2>
            <p>We use cookies and similar technologies to enhance your browsing experience. Cookies help us analyze website traffic and personalize content. You can manage cookies via your browser settings.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-slate-800 mt-8 mb-4">6. Data Security</h2>
            <p>We implement appropriate security measures to protect your personal information from unauthorized access, use, or disclosure. However, no online system can guarantee complete security.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-slate-800 mt-8 mb-4">7. Your Rights</h2>
            <p>Depending on your location, you may have the right to:</p>
            <ul className="list-disc ml-6 space-y-2">
              <li>Access, update, or delete your personal information.</li>
              <li>Withdraw consent for certain data uses.</li>
              <li>Contact a local data protection authority to file a complaint.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-slate-800 mt-8 mb-4">8. Contact Us</h2>
            <p>For questions or concerns about this Privacy Policy, please contact us:</p>
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
