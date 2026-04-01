'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { createPageUrl } from '@/lib/routes';
import { CheckCircle, Clock, Shield, DollarSign, Users, Wrench, Star } from 'lucide-react';
import StaticFAQ from '@/components/StaticFAQ';
import SpokeLinks from '@/components/SpokeLinks';
import FinancingBanner from '@/components/FinancingBanner';

const INSTALLATION_FAQS = [
  {
    question: 'How much does flooring installation cost in Markham and Toronto?',
    answer: 'At BBS Flooring, engineered hardwood installation starts at $2.25/sqft (nail-down, planks 6½″ and under), $3.25/sqft (glue+nail or herringbone nail-down), or $4.25/sqft (herringbone glue+nail), and laminate or vinyl installation at $2.00/sqft. These are all-inclusive labour rates with no hidden fees. Use our free Quote Calculator for an instant estimate based on your room size and flooring type.'
  },
  {
    question: 'Do you move furniture before installing new flooring?',
    answer: 'Yes! BBS Flooring offers full-service installation that includes furniture moving at no extra charge for standard items. Our crew will carefully move your furniture, install your new floors, and place everything back. This is one of the biggest reasons homeowners in Markham, Toronto, and Durham choose us over competitors.'
  },
  {
    question: 'How long does a typical flooring installation take?',
    answer: 'Most residential flooring installations are completed in 1–3 days depending on the size of the area and type of flooring. A standard 500 sqft room typically takes one day for laminate or vinyl and 1–2 days for hardwood. We also handle old flooring removal, subfloor prep, and baseboard installation in the same visit.'
  },
  {
    question: 'What types of flooring do you install?',
    answer: 'We install all major flooring types: solid hardwood (nail-down), engineered hardwood (nail-down or glue-down), laminate (click-lock floating), luxury vinyl plank/LVP (click-lock or glue-down), tile, and carpet. We also handle carpet removal, hardwood refinishing, staircase renovations, and baseboard/trim work.'
  },
  {
    question: 'What areas do you serve for flooring installation?',
    answer: 'BBS Flooring provides professional installation across Markham, Toronto, Scarborough, Pickering, Ajax, Whitby, Oshawa, Richmond Hill, Vaughan, Stouffville, and the entire Durham Region and Greater Toronto Area. Our showroom is located at 6061 Highway 7, Unit B, Markham, ON.'
  }
];

const INSTALLATION_SPOKE_LINKS = [
  { route: 'FlooringInstallationCost', label: 'Flooring Installation Cost Guide', description: 'Detailed breakdown of installation costs per sqft for hardwood, vinyl, laminate & tile' },
  { route: 'ContractorFlooring', label: 'Contractor & Trade Program', description: 'Exclusive member pricing for contractors and builders — bulk orders welcome' },
  { route: 'HardwoodRefinishing', label: 'Hardwood Floor Refinishing', description: 'Sand, stain & refinish your existing hardwood floors to like-new condition' },
  { route: 'FreeMeasurement', label: 'Free In-Home Measurement', description: 'Book a no-obligation measurement and get an accurate installation quote' },
  { route: 'CarpetRemoval', label: 'Carpet Removal Service', description: 'Professional carpet removal starting at $1.00/sqft — prep for your new floors' },
  { route: 'Stairs', label: 'Staircase Installation & Renovation', description: 'Hardwood stair treads, refinishing, railing installation & full staircase renovations' },
];

const INSTALLATION_PRICING = {
  hardwood: 2.25,
  gluedown: 3.25,
  gluedownHerringbone: 4.25,
  laminate: 2.00,
  vinyl: 2.00,
  tile: 10.00,
};

const REMOVAL_PRICING = {
  hardwood: 1.50,
  laminate: 1.50,
  carpet: 1.00,
  tile: 2.50,
  vinyl: 1.25,
};

export default function InstallationClient() {
  useEffect(() => {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'view_item_list', { item_list_name: 'Installation' });
    }
  }, []);

  const installServices = [
    { title: 'Solid/Eng Hardwood (Nail Down)', price: `$${INSTALLATION_PRICING.hardwood.toFixed(2)}/Sqft` },
    { title: 'Engineered Hardwood (Glue-Down)', price: `$${INSTALLATION_PRICING.gluedown.toFixed(2)}/Sqft` },
    { title: 'Herringbone (Glue-Down)', price: `$${INSTALLATION_PRICING.gluedownHerringbone.toFixed(2)}/Sqft` },
    { title: 'Laminate / Vinyl Installation', price: `$${INSTALLATION_PRICING.laminate.toFixed(2)}/Sqft` },
    { title: 'Tile Installation', price: `From $${INSTALLATION_PRICING.tile.toFixed(2)}/Sqft` },
  ];

  const removalServices = [
    { title: 'Hardwood Removal', price: `$${REMOVAL_PRICING.hardwood.toFixed(2)}/Sqft` },
    { title: 'Vinyl / Laminate Removal', price: `$${REMOVAL_PRICING.laminate.toFixed(2)}/Sqft` },
    { title: 'Carpet Removal', price: `$${REMOVAL_PRICING.carpet.toFixed(2)}/Sqft` },
    { title: 'Tile Removal', price: '$3.00/Sqft' },
  ];

  const trimServices = [
    { title: 'Standard Baseboard Install', price: '$3.61/Linear Ft' },
    { title: 'Shoe Moulding Install', price: '$1.91/Linear Ft' },
  ];

  const freightServices = [
    { title: 'Garage Delivery', price: '$140', note: 'Flat rate' },
    { title: 'Inside Delivery', price: '$200', note: 'Required for install jobs' },
  ];

  return (
    <div className="bg-white">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-amber-50 to-slate-50 py-16">
        <div className="max-w-7xl mx-auto px-4">
          <h1 className="text-4xl md:text-5xl font-bold text-slate-800 mb-4">
            Professional Flooring Installation Services in Markham, Durham & Toronto
          </h1>
          <p className="text-xl text-slate-600 max-w-3xl">
            Serving homeowners and businesses across Toronto, Markham, Durham, and the Greater Toronto Area with expert flooring installation.
          </p>
        </div>
      </div>

      {/* Why Choose Us */}
      <div className="max-w-7xl mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-slate-800 mb-8">Why Choose BBS Flooring for Installation?</h2>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          {[
            { icon: Users, title: 'Experienced Professionals', desc: 'Our installers are highly trained and bring years of experience to every project' },
            { icon: Wrench, title: 'Full-Service Solutions', desc: 'From removal of old flooring to detailed installation and cleanup, we handle everything' },
            { icon: Shield, title: 'Top-Quality Materials', desc: 'We work with premium hardwood, vinyl, laminate, and more to ensure lasting results' },
            { icon: Clock, title: 'Fast Turnaround', desc: 'We respect your time. Most jobs are completed within days, not weeks' },
            { icon: Shield, title: 'WSIB Covered & Fully Insured', desc: 'WSIB workplace insurance + comprehensive business liability coverage. You\'re fully protected — 2-year workmanship warranty on every install' },
            { icon: DollarSign, title: 'Transparent Pricing', desc: 'Free estimates, no hidden fees, and flexible options to fit your budget' },
          ].map(({ icon: Icon, title, desc }) => (
            <div key={title} className="bg-white border border-slate-200 rounded-xl p-6 hover:shadow-lg transition-shadow">
              <Icon className="w-12 h-12 text-amber-600 mb-4" />
              <h3 className="font-bold text-lg text-slate-800 mb-2">{title}</h3>
              <p className="text-slate-600">{desc}</p>
            </div>
          ))}
        </div>

        {/* WSIB Trust Banner */}
        <div className="bg-gradient-to-r from-emerald-50 to-emerald-100 border-2 border-emerald-300 rounded-2xl p-6 md:p-8 mb-16">
          <div className="flex flex-col md:flex-row md:items-center gap-6">
            <div className="flex-shrink-0">
              <Shield className="w-16 h-16 text-emerald-600" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-slate-800 mb-2">WSIB Covered · Business Insured · You&apos;re Protected</h3>
              <p className="text-slate-600 text-lg">
                BBS Flooring carries <strong>WSIB workplace safety insurance</strong> and full <strong>commercial liability coverage</strong>.
                That means if anything happens during your installation, <strong>you&apos;re never liable</strong>. Many flooring companies in the GTA don&apos;t carry WSIB —
                always ask before hiring. We&apos;re happy to provide proof of coverage on request.
              </p>
            </div>
          </div>
        </div>

        {/* Installation Process */}
        <div className="bg-slate-50 rounded-2xl p-8 mb-16">
          <h2 className="text-3xl font-bold text-slate-800 mb-8">Our Flooring Installation Process</h2>
          <div className="space-y-6">
            {[
              { step: 1, title: 'Free Consultation', desc: 'We discuss your needs, assess your space, and recommend the best options' },
              { step: 2, title: 'Detailed Estimate', desc: 'Get a clear, upfront quote—no surprises' },
              { step: 3, title: 'Preparation', desc: 'We move furniture (as needed), remove old flooring, and prepare the subfloor' },
              { step: 4, title: 'Expert Installation', desc: 'Our team installs your new flooring with precision and care, ensuring perfect results' },
              { step: 5, title: 'Clean-Up', desc: 'We leave your space spotless and ready to enjoy' },
              { step: 6, title: 'Final Walkthrough', desc: 'We review the finished work with you to ensure complete satisfaction' },
            ].map(({ step, title, desc }) => (
              <div key={step} className="flex gap-4">
                <div className="flex-shrink-0 w-10 h-10 bg-amber-600 text-white rounded-full flex items-center justify-center font-bold text-lg">{step}</div>
                <div>
                  <h3 className="font-bold text-lg text-slate-800 mb-1">{title}</h3>
                  <p className="text-slate-600">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Installation Services */}
        <h2 className="text-3xl font-bold text-slate-800 mb-8">Installation Services & Pricing</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {installServices.map((service, idx) => (
            <div key={idx} className="bg-white border border-slate-200 rounded-xl p-6 hover:border-amber-500 hover:shadow-lg transition-all">
              <h3 className="font-bold text-lg text-slate-800 mb-2">{service.title}</h3>
              <p className="text-2xl font-bold text-amber-600">{service.price}</p>
            </div>
          ))}
        </div>

        {/* Removal Services */}
        <h3 className="text-2xl font-bold text-slate-800 mb-6">Flooring Removal Services</h3>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {removalServices.map((service, idx) => (
            <div key={idx} className="bg-slate-50 border border-slate-200 rounded-xl p-6">
              <h4 className="font-bold text-lg text-slate-800 mb-2">{service.title}</h4>
              <p className="text-xl font-bold text-amber-600">{service.price}</p>
            </div>
          ))}
        </div>

        {/* Trim Work */}
        <h3 className="text-2xl font-bold text-slate-800 mb-6">Trim Work Services</h3>
        <div className="grid md:grid-cols-2 gap-6 mb-12">
          {trimServices.map((service, idx) => (
            <div key={idx} className="bg-slate-50 border border-slate-200 rounded-xl p-6">
              <h4 className="font-bold text-lg text-slate-800 mb-2">{service.title}</h4>
              <p className="text-xl font-bold text-amber-600">{service.price}</p>
            </div>
          ))}
        </div>

        {/* Freight & Delivery */}
        <h3 className="text-2xl font-bold text-slate-800 mb-6">Freight & Delivery</h3>
        <div className="grid md:grid-cols-2 gap-6 mb-16">
          {freightServices.map((service, idx) => (
            <div key={idx} className="bg-amber-50 border border-amber-200 rounded-xl p-6">
              <h4 className="font-bold text-lg text-slate-800 mb-2">{service.title}</h4>
              <p className="text-2xl font-bold text-amber-600 mb-1">{service.price}</p>
              {service.note && <p className="text-sm text-slate-600">{service.note}</p>}
            </div>
          ))}
        </div>

        {/* Customer Reviews */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-slate-800 mb-2">What Our Customers Say</h2>
          <div className="flex items-center gap-2 mb-8">
            <div className="flex">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-5 h-5 fill-amber-400 text-amber-400" />
              ))}
            </div>
            <span className="text-lg font-semibold text-slate-700">4.7/5 from 41 Google Reviews</span>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              { text: '"The installers were efficient, showed up on time, completed the work in the timeline promised and cleaned up afterwards. I highly recommend Abram and his installers and would not hesitate to use them again."', name: 'Cathy F.' },
              { text: '"We had the rooms redone with vinyl from carpet. The end result was perfection and the crew worked so diligently and did a full vacuum and clean up to complete the job. Abram was fantastic to work with."', name: 'Liberty' },
              { text: '"Quick and easy process and they were in and out in less than 4 days! Professional work and amazing quality. Would 100% recommend."', name: 'Sonya P.' },
            ].map(({ text, name }) => (
              <div key={name} className="bg-slate-50 border border-slate-200 rounded-xl p-6">
                <div className="flex mb-3">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-slate-600 mb-4 italic">{text}</p>
                <p className="font-semibold text-slate-800">— {name}</p>
                <p className="text-sm text-slate-500">Google Review</p>
              </div>
            ))}
          </div>

          <div className="mt-6 text-center">
            <a href="https://g.page/r/CWJpmP-Dl-g4EBM/review" target="_blank" rel="noopener noreferrer" className="text-amber-600 hover:text-amber-700 font-semibold underline">
              Read all 41 reviews on Google →
            </a>
          </div>
        </div>

        <FinancingBanner monthlyFrom={95} />

        {/* FAQ Section */}
        <StaticFAQ
          faqItems={INSTALLATION_FAQS}
          title="Frequently Asked Questions About Flooring Installation"
          subtitle="Answers to the most common installation questions from homeowners in Markham, Toronto & Durham"
          schemaId="faq-installation"
        />

        {/* Spoke Links */}
        <SpokeLinks
          title="Explore Our Installation & Related Services"
          links={INSTALLATION_SPOKE_LINKS}
        />

        {/* CTA */}
        <div className="bg-gradient-to-br from-amber-600 to-amber-700 rounded-2xl p-12 text-center text-white mt-12">
          <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
          <p className="text-xl mb-8 text-amber-50">
            Book your free in-home measurement and receive a detailed, no-obligation quote
          </p>
          <Link href={createPageUrl('FreeMeasurement')} className="inline-block bg-white text-amber-700 hover:bg-amber-50 font-semibold text-lg px-8 py-3 rounded-xl transition-colors">
            Schedule Free Measurement
          </Link>
        </div>
      </div>
    </div>
  );
}
