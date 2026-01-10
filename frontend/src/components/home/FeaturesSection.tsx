import { useState, useEffect } from 'react';
import { featuresApi, type Feature } from '@/lib/api';

// Map feature icons to actual components with color
const getIconComponent = (iconName: string, colorClass: string) => {
  switch (iconName) {
    case 'Shield':
      return (
        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={colorClass}>
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        </svg>
      );
    case 'Globe':
      return (
        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={colorClass}>
          <circle cx="12" cy="12" r="10" />
          <line x1="2" y1="12" x2="22" y2="12" />
          <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
        </svg>
      );
    case 'Zap':
      return (
        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={colorClass}>
          <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
        </svg>
      );
    default:
      return (
        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={colorClass}>
          <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
        </svg>
      );
  }
};

// Function to get color classes based on index
const getColorClasses = (index: number) => {
  const colors = [
    {
      // Primary (Blue)
      iconBg: 'bg-primary/10',
      iconBorder: 'border-primary/20',
      iconColor: 'text-primary',
      line: 'bg-primary'
    },
    {
      // Success (Green)
      iconBg: 'bg-success/10',
      iconBorder: 'border-success/20',
      iconColor: 'text-success',
      line: 'bg-success'
    },
    {
      // Warning (Orange)
      iconBg: 'bg-warning/10',
      iconBorder: 'border-warning/20',
      iconColor: 'text-warning',
      line: 'bg-warning'
    },
    {
      // Destructive (Red)
      iconBg: 'bg-destructive/10',
      iconBorder: 'border-destructive/20',
      iconColor: 'text-destructive',
      line: 'bg-destructive'
    }
  ];
  
  return colors[index % colors.length];
};

export const FeaturesSection = () => {
  const [features, setFeatures] = useState<Feature[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchFeatures = async () => {
      try {
        const data = await featuresApi.getFeatures();
        setFeatures(data);
      } catch (err) {
        setError('Failed to load features');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchFeatures();
  }, []);

  if (loading) {
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
            {[1, 2, 3].map((index) => {
              const colorClasses = getColorClasses(index - 1);
              return (
                <div key={index} className="group bg-white p-10 rounded-3xl border border-slate-100 shadow-xl animate-pulse">
                  <div className={`w-16 h-16 ${colorClasses.iconBg} rounded-2xl flex items-center justify-center mb-6 shadow-sm border ${colorClasses.iconBorder}`}>
                    <div className="w-8 h-8 bg-gray-200 rounded"></div>
                  </div>
                  <div className="h-6 bg-gray-200 rounded mb-4"></div>
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-200 rounded"></div>
                    <div className="h-4 bg-gray-200 rounded"></div>
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  </div>
                  <div className={`mt-6 w-12 h-1 ${colorClasses.line} rounded-full`}></div>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section id="features" className="pt-12 pb-24 bg-linear-to-r from-primary/5 via-white to-accent/5 relative">
        <div className="max-w-7xl mx-auto px-6 text-center text-red-500">
          {error}
        </div>
      </section>
    );
  }

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
          {features.map((feature, index) => {
            const colorClasses = getColorClasses(index);
            return (
              <div key={feature._id} className="group bg-white p-10 rounded-3xl border border-slate-100 shadow-xl hover:shadow-2xl transition-all hover:-translate-y-2" >
                <div className={`w-16 h-16 ${colorClasses.iconBg} rounded-2xl flex items-center justify-center mb-6 shadow-sm border ${colorClasses.iconBorder}`}>
                  {getIconComponent(feature.icon || '', colorClasses.iconColor)}
                </div>
                <h3 className="text-2xl font-black mb-4 text-[#0a0c65]">{feature.title}</h3>
                <p className="text-slate-600 leading-relaxed font-medium">{feature.description}</p>
                <div className={`mt-6 w-12 h-1 ${colorClasses.line} rounded-full`}></div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};