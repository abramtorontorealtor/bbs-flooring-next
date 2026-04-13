import { SERVICE_AREAS } from '@/lib/service-constants';

/**
 * GTA service area pills section.
 *
 * @param {string}   title    - Section heading (default: 'Serving the Greater Toronto Area')
 * @param {string}   subtitle - Optional subtitle
 * @param {string[]} areas    - Override area list (default: SERVICE_AREAS constant)
 * @param {string}   bg       - Background class (default: 'bg-white')
 */
export default function ServiceAreaPills({ title = 'Serving the Greater Toronto Area', subtitle, areas, bg = 'bg-white' }) {
  const displayAreas = areas || SERVICE_AREAS;

  return (
    <section className={`py-12 md:py-16 ${bg}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-3xl sm:text-4xl font-bold text-slate-800 mb-3">{title}</h2>
        {subtitle && (
          <p className="text-slate-500 mb-8 max-w-xl mx-auto">{subtitle}</p>
        )}

        <div className="flex flex-wrap justify-center gap-2 max-w-3xl mx-auto">
          {displayAreas.map(area => (
            <span
              key={area}
              className="bg-slate-100 text-slate-700 text-sm font-medium px-4 py-2 rounded-full border border-slate-200"
            >
              📍 {area}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
