/**
 * Reusable process stepper for service pages.
 * Vertical layout with connector lines — consistent across all pages.
 *
 * @param {string}   title    - Section heading
 * @param {string}   subtitle - Optional subtitle text
 * @param {{ step: string, title: string, desc: string, icon: string }[]} steps
 * @param {string}   bg       - Background class (default 'bg-slate-50')
 */
export default function ServiceProcess({ title, subtitle, steps, bg = 'bg-slate-50' }) {
  return (
    <section className={`py-12 md:py-16 ${bg}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl sm:text-4xl font-bold text-slate-800 mb-3 text-center">{title}</h2>
        {subtitle && (
          <p className="text-slate-500 text-center mb-12 max-w-2xl mx-auto">{subtitle}</p>
        )}

        <div className="space-y-6 max-w-3xl mx-auto">
          {steps.map((s, i) => (
            <div key={s.step} className="flex gap-4">
              <div className="flex flex-col items-center">
                <div className="w-11 h-11 bg-amber-500 text-white rounded-full flex items-center justify-center text-lg flex-shrink-0">
                  {s.icon}
                </div>
                {i < steps.length - 1 && (
                  <div className="w-0.5 flex-1 bg-amber-200 mt-2" />
                )}
              </div>
              <div className="pb-2">
                <h3 className="font-bold text-base text-slate-800 mb-0.5">{s.title}</h3>
                <p className="text-sm text-slate-500">{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
