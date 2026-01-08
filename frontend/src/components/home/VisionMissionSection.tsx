export const VisionMissionSection = () => {
  return (
    <section id="about" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-12 items-center">
        <div className="space-y-6">
          <h2 className="text-3xl font-bold text-[#0a0c65]">Vision & Mission</h2>
          <div className="space-y-4">
            <div className="p-6 bg-slate-50 rounded-xl border-l-4 border-[#ba0b0b]">
              <h4 className="font-bold text-[#ba0b0b] mb-2 uppercase tracking-wide">Vision</h4>
              <p className="text-slate-600">
                To provide a world-class service that exceeds customer expectations in the most effective and efficient manner.
              </p>
            </div>
            <div className="p-6 bg-slate-50 rounded-xl border-l-4 border-[#0a0c65]">
              <h4 className="font-bold text-[#0a0c65] mb-2 uppercase tracking-wide">Mission</h4>
              <p className="text-slate-600">
                To set the standard for professionalism in the provision of logistic solutions, and to explore and identify growth opportunities for all parties.
              </p>
            </div>
          </div>
        </div>
        <div className="p-8 bg-[#0a0c65] text-white rounded-3xl shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16"></div>
          <h3 className="text-2xl font-bold mb-4 italic">"Growth through Professionalism."</h3>
          <p className="text-blue-100/80 leading-relaxed mb-6">
            Established in 2023, ProLink has grown steadily to become one of Zambia's fastest-growing and most trusted professional transport and logistics brokers.
          </p>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center font-bold text-white">
              PN
            </div>
            <div>
              <p className="font-bold">Patrick S. Nyalazi</p>
              <p className="text-xs text-blue-200/60 uppercase font-medium">
                Director – ProLink
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};