import Link from 'next/link';
import NewsletterForm from './NewsletterForm';

const SERVICE_AREAS = [
  'Markham', 'Stouffville', 'Richmond Hill', 'Pickering',
  'Ajax', 'Whitby', 'Vaughan', 'Woodbridge',
  'Newmarket', 'Aurora', 'Scarborough', 'Oshawa',
];

export default function FooterServer() {
  return (
    <footer className="bg-slate-900 text-white">
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12">

          {/* Brand + Newsletter */}
          <div>
            <div className="mb-6">
              <span className="text-4xl font-black text-amber-500">BBS</span>
              <span className="block text-sm font-semibold tracking-widest text-slate-400">FLOORING</span>
            </div>
            <p className="text-slate-400 text-sm leading-relaxed">
              Your local source for premium flooring installation and materials in Markham, Toronto, and Durham.
              Transforming spaces with stunning floors since day one.
            </p>
            <div className="mt-6">
              <NewsletterForm />
            </div>
          </div>

          {/* Products */}
          <div>
            <h3 className="text-lg font-semibold mb-6">Products</h3>
            <ul className="space-y-3">
              {[
                { name: 'Solid Hardwood', path: '/solid-hardwood' },
                { name: 'Engineered Hardwood', path: '/engineered-hardwood' },
                { name: 'Laminate', path: '/laminate' },
                { name: 'Vinyl', path: '/vinyl' },
                { name: 'Stairs', path: '/stairs' },
              ].map(({ name, path }) => (
                <li key={name}>
                  <Link href={path} className="text-slate-400 hover:text-amber-500 transition-colors text-sm">
                    {name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div>
            <h3 className="text-lg font-semibold mb-6">Services</h3>
            <ul className="space-y-3">
              {[
                { name: 'Installation Services', path: '/installation' },
                { name: 'Financing Available', path: '/financing' },
                { name: 'Quote Calculator', path: '/quote-calculator' },
                { name: 'Free Measurement', path: '/free-measurement' },
                { name: 'Project Gallery', path: '/gallery' },
                { name: 'About Us', path: '/about' },
              ].map(({ name, path }) => (
                <li key={name}>
                  <Link href={path} className="text-slate-400 hover:text-amber-500 transition-colors text-sm">
                    {name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Service Areas */}
          <div>
            <h3 className="text-lg font-semibold mb-6">Service Areas</h3>
            <ul className="space-y-3">
              {SERVICE_AREAS.map((city) => (
                <li key={city}>
                  <Link
                    href={`/flooring-in/${city.toLowerCase().replace(/\s+/g, '-')}`}
                    className="text-slate-400 hover:text-amber-500 transition-colors text-sm"
                  >
                    {city}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-lg font-semibold mb-6">Contact Us</h3>
            <address>
              <ul className="space-y-4 not-italic">
                <li className="flex items-start gap-3">
                  {/* MapPin */}
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" aria-hidden="true"><path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0"/><circle cx="12" cy="10" r="3"/></svg>
                  <span className="text-slate-400 text-sm">
                    6061 Highway 7, Unit B,<br />
                    Markham Ontario, Canada L3P 3B2
                  </span>
                </li>
                <li>
                  <a href="tel:6474281111" className="flex items-center gap-3 text-slate-400 hover:text-amber-500 transition-colors text-sm">
                    {/* Phone */}
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-amber-500 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" aria-hidden="true"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.99 12 19.79 19.79 0 0 1 1.93 3.29 2 2 0 0 1 3.92 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 8.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                    (647) 428-1111
                  </a>
                </li>
                <li>
                  <a href="https://wa.me/message/CQQRGZKI3U2VH1" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-slate-400 hover:text-green-500 transition-colors text-sm">
                    {/* MessageCircle */}
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-green-500 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" aria-hidden="true"><path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"/></svg>
                    WhatsApp Us
                  </a>
                </li>
                <li>
                  <a href="https://www.facebook.com/bbsflooring" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-slate-400 hover:text-blue-500 transition-colors text-sm">
                    <svg className="w-5 h-5 text-blue-500 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                    Facebook
                  </a>
                </li>
                <li>
                  <a href="https://www.instagram.com/bbsflooring" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-slate-400 hover:text-pink-500 transition-colors text-sm">
                    <svg className="w-5 h-5 text-pink-500 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
                    Instagram
                  </a>
                </li>
                <li className="flex items-start gap-3">
                  {/* Clock */}
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                  <span className="text-slate-400 text-sm">
                    Mon – Sat: 10:00 AM – 5:00 PM<br />
                    Sun: Closed
                  </span>
                </li>
              </ul>
            </address>
          </div>
        </div>

        <div className="border-t border-slate-800 mt-12 pt-8">
          <div className="flex flex-wrap justify-center gap-6 mb-6">
            <Link href="/privacy-policy" className="text-slate-400 hover:text-amber-500 transition-colors text-sm">Privacy Policy</Link>
            <Link href="/terms-of-service" className="text-slate-400 hover:text-amber-500 transition-colors text-sm">Terms of Service</Link>
            <Link href="/return-policy" className="text-slate-400 hover:text-amber-500 transition-colors text-sm">Return Policy</Link>
          </div>
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-slate-400 text-sm">© {new Date().getFullYear()} BBS Flooring. All rights reserved.</p>
            <p className="text-slate-400 text-sm">Serving Markham, Toronto &amp; Durham Region</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
