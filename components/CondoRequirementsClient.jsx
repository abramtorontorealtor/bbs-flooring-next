'use client';

import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Link from 'next/link';
import { GOOGLE_RATING } from '@/lib/service-constants';

export default function CondoRequirementsClient() {
  return (
    <div className="min-h-screen bg-white">
      <Header />

      {/* Hero */}
      <section className="bg-gradient-to-br from-stone-900 via-stone-800 to-amber-900 text-white py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-amber-400 text-sm font-semibold uppercase tracking-widest mb-4">
            BBS Flooring — Condo Guide 2026
          </p>
          <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-6">
            Condo Flooring Installation Requirements in Toronto &amp; the GTA
          </h1>
          <p className="text-xl text-stone-300 max-w-2xl mx-auto leading-relaxed">
            Most GTA condo boards and property managers require a Certificate of Insurance, a WSIB clearance certificate, and proof your flooring meets the building&apos;s acoustic (IIC) rating before they&apos;ll approve an install. BBS Flooring supplies all three — here&apos;s exactly what to expect and how the approval process works.
          </p>
          <div className="flex flex-wrap justify-center gap-4 mt-8 text-sm text-stone-400">
            <span>✔ COI &amp; WSIB clearance on request</span>
            <span>✔ Acoustic underlay spec sheets</span>
            <span>✔ ⭐ {GOOGLE_RATING}/5 on Google</span>
          </div>
        </div>
      </section>

      {/* Table of Contents */}
      <section className="bg-amber-50 border-b border-amber-100 py-10 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-lg font-semibold text-stone-700 mb-4">In This Guide</h2>
          <ol className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-amber-700 text-sm font-medium list-decimal list-inside">
            <li><a href="#documents" className="hover:underline">The Documents Your Condo Will Ask For</a></li>
            <li><a href="#acoustic" className="hover:underline">Acoustic Requirements: IIC vs STC</a></li>
            <li><a href="#process" className="hover:underline">Approval Process, Step by Step</a></li>
            <li><a href="#best-flooring" className="hover:underline">Best Flooring for Condos</a></li>
            <li><a href="#what-bbs-handles" className="hover:underline">What BBS Handles for You</a></li>
            <li><a href="#cost-example" className="hover:underline">700 sqft Condo — Cost Example</a></li>
            <li><a href="#neighbourhoods" className="hover:underline">Condo Corridors We Serve</a></li>
            <li><a href="#faq" className="hover:underline">Frequently Asked Questions</a></li>
          </ol>
        </div>
      </section>

      {/* AI Quick Answer Block */}
      <section id="quick-answer" className="bg-amber-50 border border-amber-200 rounded-xl p-6 md:p-8 mb-8 mx-4 md:mx-0">
        <h2 className="text-lg md:text-xl font-bold text-gray-900 mb-3">
          Quick Answer: What Your Condo Requires Before a Flooring Install
        </h2>
        <p className="text-gray-700 leading-relaxed">
          Most GTA condo corporations require a Certificate of Insurance (COI), a WSIB clearance certificate, and an underlay spec sheet proving your flooring meets the building&apos;s minimum acoustic (IIC) rating — and for hardwood, often a signed alteration agreement. BBS Flooring supplies the COI, WSIB clearance, and spec sheets on request for every condo project. Free in-home measurement across the GTA: <a href="tel:6474281111" className="font-semibold text-amber-700 underline underline-offset-2 hover:text-amber-900">(647) 428-1111</a> | <Link href="/free-measurement" className="font-semibold text-amber-700 underline underline-offset-2 hover:text-amber-900">book online</Link>
        </p>
      </section>

      <main className="max-w-4xl mx-auto px-4 py-16 space-y-20">

        {/* 1. Documents */}
        <section id="documents">
          <h2 className="text-3xl font-bold text-stone-900 mb-6">The Documents Your Condo Will Ask For</h2>
          <p className="text-stone-600 text-lg leading-relaxed mb-6">
            Every condo corporation in Ontario governs alterations differently — your building&apos;s declaration and rules always take precedence over anything general we say here. But across the hundreds of GTA condo installs BBS has completed since 2012, the paperwork list is remarkably consistent. Here&apos;s what shows up on almost every property manager&apos;s checklist, and who is responsible for providing it.
          </p>

          <div className="overflow-x-auto rounded-xl border border-stone-200 mb-6">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-stone-800 text-white">
                  <th className="text-left p-4 font-semibold">Document</th>
                  <th className="text-left p-4 font-semibold">What it proves</th>
                  <th className="text-left p-4 font-semibold">Who provides it</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ['Certificate of Insurance (COI)', 'The installer carries commercial liability coverage, naming the condo corp as additional insured', 'BBS Flooring'],
                  ['WSIB clearance certificate', 'The installer\u2019s workers are covered under WSIB — protects the building from liability if a worker is injured', 'BBS Flooring'],
                  ['Underlay / acoustic spec sheet', 'The flooring + underlay assembly meets or exceeds the building\u2019s minimum IIC/STC rating', 'BBS Flooring'],
                  ['Alteration request / Section 98 agreement', 'Formal owner request to alter a common element or change sound transmission characteristics of the unit', 'Owner (BBS provides supporting product specs)'],
                  ['Elevator booking confirmation', 'Move-in/move-out and material delivery scheduled around building elevator availability', 'Owner + property manager (BBS coordinates timing)'],
                  ['Refundable damage deposit (if required)', 'Covers any damage to common elements during the move — refunded after a post-install walkthrough', 'Owner'],
                ].map(([doc, purpose, who], i) => (
                  <tr key={doc} className={i % 2 === 0 ? 'bg-white' : 'bg-stone-50'}>
                    <td className="p-4 font-medium text-stone-800">{doc}</td>
                    <td className="p-4 text-stone-600">{purpose}</td>
                    <td className="p-4 text-amber-700 font-semibold">{who}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-xl p-5">
            <p className="text-stone-700 font-medium">
              <strong>BBS supplies the COI, WSIB clearance certificate, and underlay/acoustic spec sheets on request</strong> — usually within 2–3 business days of booking your free measurement. Tell us your property manager&apos;s exact requirements and we&apos;ll get the paperwork moving right away.
            </p>
          </div>
        </section>

        {/* 2. Acoustic requirements */}
        <section id="acoustic">
          <h2 className="text-3xl font-bold text-stone-900 mb-6">Acoustic Requirements Explained: IIC vs STC</h2>
          <p className="text-stone-600 text-lg leading-relaxed mb-6">
            This is the requirement homeowners get tripped up on most, because two different ratings get mentioned and buildings don&apos;t all ask for the same number.
          </p>

          <div className="overflow-x-auto rounded-xl border border-stone-200 mb-6">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-stone-800 text-white">
                  <th className="text-left p-4 font-semibold">Rating</th>
                  <th className="text-left p-4 font-semibold">What it measures</th>
                  <th className="text-left p-4 font-semibold">Typical GTA condo requirement</th>
                </tr>
              </thead>
              <tbody>
                <tr className="bg-white">
                  <td className="p-4 font-medium text-stone-800">IIC (Impact Insulation Class)</td>
                  <td className="p-4 text-stone-600">Footstep/impact noise transmitted through the floor to the unit below — the rating condo boards care about most for hard flooring</td>
                  <td className="p-4 text-stone-600">Varies by building — commonly IIC 50 minimum for the finished floor assembly (flooring + underlay together); many newer towers ask for IIC 60, and some request 70–73 for units above amenity spaces or parking</td>
                </tr>
                <tr className="bg-stone-50">
                  <td className="p-4 font-medium text-stone-800">STC (Sound Transmission Class)</td>
                  <td className="p-4 text-stone-600">Airborne noise (voices, TV) transmitted through a wall or floor assembly</td>
                  <td className="p-4 text-stone-600">The Ontario Building Code sets a baseline STC 50 for separation between dwelling units — many condo declarations reference this as their floor assembly standard alongside or instead of an IIC number</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="bg-red-50 border border-red-200 rounded-xl p-5 mb-6">
            <p className="text-stone-700 font-medium">
              <strong>There is no single citywide IIC or STC number for Toronto condos.</strong> Your building&apos;s declaration or rules document sets the exact figure, and it can range anywhere from IIC 50 up to IIC 73 depending on the building&apos;s age, construction, and whether your unit sits above amenity space or parking. Always confirm the number with your property manager or condo declaration before buying underlay — a spec sheet that satisfies one building can fail approval at another.
            </p>
          </div>

          <p className="text-stone-600 leading-relaxed">
            Once you know the number, matching underlay is straightforward: BBS stocks acoustic underlay options rated across the common IIC thresholds condo boards request, and every vinyl, laminate, and engineered hardwood product we sell comes with a manufacturer spec sheet documenting the assembly&apos;s tested rating — the exact document most property managers want to see attached to your alteration request.
          </p>
        </section>

        {/* 3. Approval process */}
        <section id="process">
          <h2 className="text-3xl font-bold text-stone-900 mb-6">The Approval Process, Step by Step</h2>

          <div className="space-y-5">
            {[
              { step: '1', title: 'Free In-Home Measurement & Product Selection', desc: 'A BBS technician measures your unit and helps you choose a flooring + underlay combination that fits your building\u2019s acoustic requirement (tell us the IIC/STC number from your condo declaration if you have it).' },
              { step: '2', title: 'Alteration Request Submitted', desc: 'You (the owner) submit an alteration request to the board or property manager, attaching the underlay spec sheet BBS provides. For hardwood in many buildings, this is where a Section 98 agreement under the Ontario Condominium Act, 1998 gets drafted and signed.' },
              { step: '3', title: 'COI & WSIB Clearance Submitted', desc: 'BBS provides the Certificate of Insurance (naming the condo corporation as additional insured) and current WSIB clearance certificate for the property manager\u2019s file.' },
              { step: '4', title: 'Board/Management Approval', desc: 'Depending on the building, a property manager can approve directly or it goes to the next scheduled board meeting. Buildings with monthly board meetings can add several weeks — submit early.' },
              { step: '5', title: 'Elevator Booking & Move-In Logistics', desc: 'Once approved, the service elevator gets booked for material delivery and crew access. BBS installs moving-pad protection in hallways and elevators to protect common elements during the move.' },
              { step: '6', title: 'Installation Within Permitted Hours', desc: 'Most buildings restrict work to weekday daytime hours, with no work on Sundays or statutory holidays. BBS crews plan the job to finish within your building\u2019s permitted window.' },
              { step: '7', title: 'Post-Install Walkthrough & Paperwork Close-Out', desc: 'Any refundable damage deposit is released after a walkthrough confirming no damage to common elements. Keep your alteration agreement and spec sheets on file — buildings often ask for them again at resale.' },
            ].map((s) => (
              <div key={s.step} className="flex gap-4 bg-stone-50 border border-stone-200 rounded-xl p-5">
                <div className="w-9 h-9 bg-amber-500 text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">{s.step}</div>
                <div>
                  <p className="font-semibold text-stone-800 mb-1">{s.title}</p>
                  <p className="text-stone-600 text-sm">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 4. Best flooring for condos */}
        <section id="best-flooring">
          <h2 className="text-3xl font-bold text-stone-900 mb-6">Best Flooring for Condos</h2>
          <p className="text-stone-600 text-lg leading-relaxed mb-6">
            The right choice depends mostly on your building&apos;s acoustic requirement and your budget — not just looks.
          </p>

          <div className="grid md:grid-cols-3 gap-6 mb-6">
            <div className="border-2 border-amber-400 rounded-xl p-6 bg-amber-50/30">
              <span className="bg-amber-600 text-white text-xs font-bold px-3 py-1 rounded-full">MOST POPULAR</span>
              <h3 className="text-xl font-bold text-stone-900 mt-3 mb-2">Vinyl (SPC/LVP)</h3>
              <p className="text-stone-600 text-sm leading-relaxed mb-2">From $1.69/sqft material. Waterproof, thin profile, and easy to pair with underlay that hits most IIC targets without adding much height — a common concern in condos with tight door clearances.</p>
              <Link href="/vinyl" className="text-amber-700 underline text-sm font-semibold">Browse vinyl →</Link>
            </div>
            <div className="border border-stone-200 rounded-xl p-6">
              <span className="bg-stone-600 text-white text-xs font-bold px-3 py-1 rounded-full">BUDGET</span>
              <h3 className="text-xl font-bold text-stone-900 mt-3 mb-2">Laminate</h3>
              <p className="text-stone-600 text-sm leading-relaxed mb-2">From $1.49/sqft material. A solid choice when your building&apos;s acoustic threshold is moderate (many buildings set the same IIC number for laminate and vinyl). Confirm your exact requirement first.</p>
              <Link href="/laminate" className="text-amber-700 underline text-sm font-semibold">Browse laminate →</Link>
            </div>
            <div className="border border-stone-200 rounded-xl p-6">
              <span className="bg-stone-600 text-white text-xs font-bold px-3 py-1 rounded-full">PREMIUM</span>
              <h3 className="text-xl font-bold text-stone-900 mt-3 mb-2">Engineered Hardwood</h3>
              <p className="text-stone-600 text-sm leading-relaxed mb-2">From $3.00/sqft material, $3.25/sqft glue-down install. The premium look many buyers want — but usually needs the building&apos;s highest-rated underlay, and often a Section 98 agreement.</p>
              <Link href="/engineered-hardwood" className="text-amber-700 underline text-sm font-semibold">Browse engineered hardwood →</Link>
            </div>
          </div>

          <div className="bg-stone-50 border border-stone-200 rounded-xl p-5">
            <p className="text-stone-700">
              Want a deeper dive on material choice specifically for condo units? Read our blog post{' '}
              <Link href="/blog/best-flooring-for-condos-toronto" className="text-amber-700 underline font-semibold">Best Flooring for Condos in Toronto</Link>.
            </p>
          </div>
        </section>

        {/* 5. What BBS handles */}
        <section id="what-bbs-handles">
          <h2 className="text-3xl font-bold text-stone-900 mb-6">What BBS Handles for You</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {[
              ['📄 Paperwork', 'Certificate of Insurance and WSIB clearance certificate on request, plus underlay/acoustic spec sheets matched to your building\'s requirement.'],
              ['📐 Free measurement', 'In-home measurement and product recommendation across the GTA — no obligation, quote within 24 hours.'],
              ['🛗 Building logistics', 'Elevator booking coordination, moving-pad protection in hallways and elevators, and scheduling within your building\'s permitted work hours.'],
              ['🧹 Off-site waste removal', 'Old flooring and installation debris hauled off-site — not left in common garbage rooms, per most building rules.'],
              ['🛠️ Own crews, no subcontracting churn', 'BBS runs its own installation crews (not a rotating cast of subcontractors), scaled up for larger buildings without sacrificing quality control.'],
              ['🛡️ 2-year workmanship warranty', 'Every BBS installation is backed by a 2-year workmanship warranty, separate from the manufacturer\'s product warranty on the flooring itself.'],
            ].map(([title, desc]) => (
              <div key={title} className="border border-stone-200 rounded-xl p-6">
                <h3 className="font-bold text-stone-800 mb-2">{title}</h3>
                <p className="text-stone-600 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* 6. Cost example */}
        <section id="cost-example">
          <h2 className="text-3xl font-bold text-stone-900 mb-6">Cost Example: 700 sqft Condo</h2>
          <p className="text-stone-600 text-lg leading-relaxed mb-6">
            Here&apos;s the material + installation math for a typical 700 sqft GTA condo unit, before any acoustic underlay upgrade your building may require.
          </p>

          <div className="overflow-x-auto rounded-xl border border-stone-200 mb-6">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-stone-800 text-white">
                  <th className="text-left p-4 font-semibold">Flooring type</th>
                  <th className="text-left p-4 font-semibold">Material (700 sqft)</th>
                  <th className="text-left p-4 font-semibold">Installation (700 sqft)</th>
                  <th className="text-left p-4 font-semibold">Total</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ['Vinyl', '$1.69/sqft × 700 = $1,183', '$2.00/sqft × 700 = $1,400', '$2,583'],
                  ['Laminate', '$1.49/sqft × 700 = $1,043', '$2.00/sqft × 700 = $1,400', '$2,443'],
                  ['Engineered hardwood (glue-down)', '$3.00/sqft × 700 = $2,100', '$3.25/sqft × 700 = $2,275', '$4,375'],
                ].map(([type, mat, inst, total], i) => (
                  <tr key={type} className={i % 2 === 0 ? 'bg-white' : 'bg-stone-50'}>
                    <td className="p-4 font-medium text-stone-800">{type}</td>
                    <td className="p-4 text-stone-600">{mat}</td>
                    <td className="p-4 text-stone-600">{inst}</td>
                    <td className="p-4 text-amber-700 font-bold">{total}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <p className="text-stone-500 text-sm">
            Add $0.50–$1.50/sqft if your building requires premium acoustic underlay beyond a product&apos;s built-in pad, plus old flooring removal (from $1.50/sqft) if applicable. BBS provides a free, detailed quote after measurement — final pricing depends on your specific product choice and building requirements.
          </p>
        </section>

        {/* 7. Neighbourhoods */}
        <section id="neighbourhoods">
          <h2 className="text-3xl font-bold text-stone-900 mb-6">Condo Corridors We Serve</h2>
          <p className="text-stone-600 text-lg leading-relaxed mb-6">
            BBS installs in condo towers across the GTA&apos;s densest corridors — and we&apos;ve worked with property managers at buildings throughout each of these areas:
          </p>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4 text-stone-600 text-sm">
            {[
              ['Downtown Toronto', 'CityPlace, King West, Yonge & Bloor, Liberty Village high-rises'],
              ['North York', 'Yonge & Sheppard, Yonge & Finch condo corridor'],
              ['Markham', 'Downtown Markham, Unionville towers'],
              ['Vaughan', 'Vaughan Metropolitan Centre (VMC) high-rises'],
              ['Mississauga', 'City Centre / Square One condo corridor'],
              ['Scarborough & Richmond Hill', 'Growing mid-rise and high-rise developments'],
            ].map(([area, desc]) => (
              <div key={area} className="border border-stone-200 rounded-xl p-4">
                <p className="font-semibold text-stone-800">{area}</p>
                <p className="text-stone-500 text-xs mt-1">{desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA mid-page */}
        <section className="bg-gradient-to-r from-amber-600 to-amber-700 rounded-2xl p-8 md:p-10 text-white text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-3">Need the Paperwork for Your Building?</h2>
          <p className="text-amber-50 max-w-2xl mx-auto mb-6">
            Tell us your condo&apos;s acoustic requirement and we&apos;ll send a COI, WSIB clearance, and matching underlay spec sheet — free in-home measurement across the GTA.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <a href="tel:6474281111" className="bg-white text-amber-700 font-bold px-6 py-3 rounded-xl hover:bg-amber-50 transition-colors">
              📞 (647) 428-1111
            </a>
            <Link href="/free-measurement" className="bg-stone-900 text-white font-bold px-6 py-3 rounded-xl hover:bg-stone-800 transition-colors">
              Book Free Measurement →
            </Link>
          </div>
        </section>

        {/* FAQ */}
        <section id="faq">
          <h2 className="text-3xl font-bold text-stone-900 mb-6">Frequently Asked Questions</h2>
          <div className="space-y-4">
            {[
              { q: 'What documents does my condo board require before a flooring installation?', a: 'Most GTA condo corporations require a Certificate of Insurance (COI) naming the condo corporation as additional insured, a WSIB clearance certificate for the installer, and proof the flooring assembly meets the building\'s minimum acoustic rating (IIC/underlay spec sheet). For hardwood or laminate over concrete, many buildings also require a signed alteration agreement (often called a Section 98 agreement under the Ontario Condominium Act, 1998) before work starts. BBS Flooring supplies the COI, WSIB clearance, and underlay spec sheets on request — your building\'s declaration and rules always govern the exact list.' },
              { q: 'What is a Section 98 agreement and do I need one for flooring?', a: 'A Section 98 agreement is a legal document between a unit owner and the condo corporation under the Ontario Condominium Act, 1998, covering alterations to common elements or a change that affects sound/vibration transmission — hardwood and laminate installs commonly trigger one. It gets registered on title and outlines responsibility for repair, maintenance, and insurance. Not every building requires it for every flooring type (some only require it for hardwood, not vinyl or carpet), so check with your property manager before booking install day.' },
              { q: 'What IIC or STC rating does condo flooring need in Toronto?', a: 'It varies by building — there is no single citywide number. Many GTA condo declarations set a minimum IIC (Impact Insulation Class) of 50 for the finished floor assembly (flooring + underlay together), but a growing number of newer towers require IIC 60, and some request 70–73 for units above amenity spaces or parking. The Ontario Building Code sets a baseline STC 50 for sound separation between dwelling units, which many buildings use as their reference floor. Always confirm your building\'s exact number in the condo declaration or with your property manager before buying underlay — BBS can match a spec sheet to whatever number your building requires.' },
              { q: 'Do I need a Certificate of Insurance (COI) for a condo flooring install?', a: 'Yes — nearly every GTA condo corporation requires the installer to provide a Certificate of Insurance naming the condo corporation (and sometimes the property management company) as additional insured before work begins. BBS Flooring carries commercial liability insurance and provides a COI on request, typically within a day or two of your booking.' },
              { q: 'Does BBS Flooring provide WSIB clearance certificates for condo jobs?', a: 'Yes. BBS Flooring is a WSIB-registered employer and provides a current WSIB clearance certificate on request — this is standard paperwork most condo property managers require before granting building access for any installation crew.' },
              { q: 'How long does condo board approval take before installation can start?', a: 'Plan for 1–4 weeks depending on the building. Most boards or property managers review the alteration request, underlay spec sheet, COI, and WSIB clearance at a scheduled meeting or via management sign-off, then confirm an elevator booking window. Buildings with monthly board meetings can take longer than buildings where the property manager can approve directly. Submit your paperwork as early as possible — BBS can usually turn around the required documents within 2–3 business days of booking.' },
              { q: 'Can BBS Flooring book the elevator and follow condo move-in rules?', a: 'Yes. BBS crews are experienced with GTA condo logistics — booking the service elevator, installing moving-pad protection in hallways and elevators, working within the building\'s permitted hours (typically weekday daytime, often no Sundays or holidays), and removing debris off-site rather than through common garbage rooms. Tell us your building\'s rules during your free measurement and we\'ll plan the install day around them.' },
              { q: 'What is the best flooring for a condo in Toronto?', a: 'Vinyl (SPC/LVP) with an attached or separate acoustic underlay is the most popular choice for GTA condos — waterproof, easy to meet IIC requirements, and budget-friendly from $1.69/sqft material. Laminate from $1.49/sqft is a cheaper option if your building\'s IIC threshold is moderate. Engineered hardwood (from $3.00/sqft material, $3.25/sqft glue-down install) gives a premium look but usually requires the highest-rated underlay and, in many buildings, a Section 98 agreement. BBS can recommend the right product once we know your building\'s specific acoustic requirement.' },
            ].map((item) => (
              <details key={item.q} className="border border-stone-200 rounded-xl p-5 group">
                <summary className="font-semibold text-stone-800 cursor-pointer list-none flex justify-between items-center">
                  {item.q}
                  <span className="text-amber-600 group-open:rotate-45 transition-transform text-xl">+</span>
                </summary>
                <p className="text-stone-600 text-sm mt-3 leading-relaxed">{item.a}</p>
              </details>
            ))}
          </div>
        </section>

        {/* Final CTA */}
        <section className="text-center border-t border-stone-200 pt-12">
          <h2 className="text-2xl font-bold text-stone-900 mb-3">Ready to Get Your Condo Approved and Floored?</h2>
          <p className="text-stone-600 mb-6 max-w-xl mx-auto">
            Book a free in-home measurement — we&apos;ll recommend the right product for your building&apos;s acoustic requirement and get your paperwork moving the same week.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <a href="tel:6474281111" className="bg-amber-600 text-white font-bold px-6 py-3 rounded-xl hover:bg-amber-700 transition-colors">
              📞 (647) 428-1111
            </a>
            <Link href="/free-measurement" className="bg-stone-800 text-white font-bold px-6 py-3 rounded-xl hover:bg-stone-900 transition-colors">
              Book Free Measurement →
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
