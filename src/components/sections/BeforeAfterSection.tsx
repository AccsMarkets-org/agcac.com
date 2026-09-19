const showcases = [
  {
    before: 'Old/aging split AC units requiring replacement',
    after: 'New energy-efficient VRF multi-zone system installed',
    beforeIcon: '🔴',
    afterIcon: '✅',
    label: 'VRF System Upgrade',
  },
  {
    before: 'Exposed old ductwork — inefficient and leaking',
    after: 'New custom GI ductwork — sealed, balanced, efficient',
    beforeIcon: '🔴',
    afterIcon: '✅',
    label: 'Duct Replacement',
  },
  {
    before: 'Rooftop package unit — broken down, end of life',
    after: 'New high-efficiency package unit — commissioned',
    beforeIcon: '🔴',
    afterIcon: '✅',
    label: 'Rooftop Unit Replacement',
  },
  {
    before: 'Chiller plant — old, inefficient, frequent failures',
    after: 'New chiller system — high COP, reliable, under AMC',
    beforeIcon: '🔴',
    afterIcon: '✅',
    label: 'Chiller Replacement',
  },
];

export default function BeforeAfterSection() {
  return (
    <section className="section-padding bg-navy-900 relative overflow-hidden">
      <div className="absolute inset-0 bg-hero-pattern opacity-50" />
      <div className="container-custom relative z-10">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 text-white rounded-full px-4 py-1.5 text-xs font-semibold mb-4">
            Project Transformation
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">Before & After HVAC Projects</h2>
          <p className="text-white/60 text-lg max-w-xl mx-auto">
            Real transformations from outdated, failing HVAC systems to reliable, efficient, professionally installed solutions.
          </p>
          <div className="divider-gold mx-auto mt-5" />
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
          {showcases.map(({ before, after, beforeIcon, afterIcon, label }) => (
            <div key={label} className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
              <div className="p-4 text-center border-b border-white/10">
                <span className="text-white/60 text-xs font-bold uppercase tracking-wider">{label}</span>
              </div>
              {/* Before */}
              <div className="p-4 border-b border-white/10">
                <div className="h-28 bg-red-900/30 border border-red-500/20 rounded-xl mb-3 flex items-center justify-center">
                  <div className="text-center text-white/40">
                    <div className="text-2xl mb-1">📷</div>
                    <div className="text-xs">Before Photo</div>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-red-400 text-sm">{beforeIcon}</span>
                  <p className="text-white/50 text-xs leading-relaxed">{before}</p>
                </div>
              </div>
              {/* After */}
              <div className="p-4">
                <div className="h-28 bg-green-900/30 border border-green-500/20 rounded-xl mb-3 flex items-center justify-center">
                  <div className="text-center text-white/40">
                    <div className="text-2xl mb-1">📷</div>
                    <div className="text-xs">After Photo</div>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-green-400 text-sm">{afterIcon}</span>
                  <p className="text-white/80 text-xs leading-relaxed font-medium">{after}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center">
          <p className="text-white/40 text-sm mb-5">Real project photos will be added. Contact us to see our recent project gallery.</p>
          <a
            href="https://wa.me/971506725808?text=Hello%20Al%20Ghawas%2C%20can%20you%20share%20project%20photos%20and%20past%20HVAC%20work%20examples%3F"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-whatsapp px-8 py-4"
          >
            Request Project Photo Gallery
          </a>
        </div>
      </div>
    </section>
  );
}
