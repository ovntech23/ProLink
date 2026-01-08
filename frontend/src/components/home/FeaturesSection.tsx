import { Shield, Globe, Zap } from 'lucide-react';

export const FeaturesSection = () => {
  return (
    <section id="features" className="pt-12 pb-24 bg-linear-to-r from-primary/5 via-white to-accent/5 relative">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold mb-4 text-[#0a0c65]">Our Core Values</h2>
          <div className="w-16 h-1 bg-[#ba0b0b] mx-auto rounded-full mb-4"></div>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Our business is built on matching your needs with the best available transport partners through trust, professionalism, and innovation.
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="group bg-white p-10 rounded-3xl border border-slate-100 shadow-xl hover:shadow-2xl transition-all hover:-translate-y-2">
            <div className="w-16 h-16 bg-[#ba0b0b]/10 rounded-2xl flex items-center justify-center mb-6 shadow-sm border border-[#ba0b0b]/20">
              <Shield className="text-[#ba0b0b]" size={32} />
            </div>
            <h3 className="text-2xl font-black mb-4 text-[#0a0c65]">Integrity</h3>
            <p className="text-slate-600 leading-relaxed font-medium">
              We operate with absolute transparency and honesty, ensuring every transaction is authentic and accountable.
            </p>
            <div className="mt-6 w-12 h-1 bg-[#ba0b0b] rounded-full"></div>
          </div>
          <div className="group bg-white p-10 rounded-3xl border border-slate-100 shadow-xl hover:shadow-2xl transition-all hover:-translate-y-2">
            <div className="w-16 h-16 bg-[#ba0b0b]/10 rounded-2xl flex items-center justify-center mb-6 shadow-sm border border-[#ba0b0b]/20">
              <Globe className="text-[#ba0b0b]" size={32} />
            </div>
            <h3 className="text-2xl font-black mb-4 text-[#0a0c65]">Excellence</h3>
            <p className="text-slate-600 leading-relaxed font-medium">
              Delivering customized solutions that exceed expectations, with a focus on real customer service and efficiency.
            </p>
            <div className="mt-6 w-12 h-1 bg-[#ba0b0b] rounded-full"></div>
          </div>
          <div className="group bg-white p-10 rounded-3xl border border-slate-100 shadow-xl hover:shadow-2xl transition-all hover:-translate-y-2">
            <div className="w-16 h-16 bg-[#ba0b0b]/10 rounded-2xl flex items-center justify-center mb-6 shadow-sm border border-[#ba0b0b]/20">
              <Zap className="text-[#ba0b0b]" size={32} />
            </div>
            <h3 className="text-2xl font-black mb-4 text-[#0a0c65]">Innovation</h3>
            <p className="text-slate-600 leading-relaxed font-medium">
              Zambia's fast-growing logistics backbone, constantly evolving to solve modern trade challenges.
            </p>
            <div className="mt-6 w-12 h-1 bg-[#ba0b0b] rounded-full"></div>
          </div>
        </div>
      </div>
    </section>
  );
};