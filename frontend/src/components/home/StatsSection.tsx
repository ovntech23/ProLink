import { useState, useEffect } from 'react';
import { statisticsApi, type Statistic } from '@/lib/api';

export const StatsSection = () => {
  const [statistics, setStatistics] = useState<Statistic[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStatistics = async () => {
      try {
        const data = await statisticsApi.getStatistics();
        setStatistics(data);
      } catch (err) {
        setError('Failed to load statistics');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchStatistics();
  }, []);

  if (loading) {
    return (
      <section className="py-20 border-y border-border bg-card/30">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {[1, 2, 3, 4].map((index) => (
            <div key={index} className="p-6 bg-linear-to-br from-primary/10 to-primary/5 rounded-xl border border-primary/20 animate-pulse">
              <div className="h-10 bg-gray-200 rounded mb-2"></div>
              <div className="h-4 bg-gray-200 rounded"></div>
            </div>
          ))}
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-20 border-y border-border bg-card/30">
        <div className="max-w-7xl mx-auto px-6 text-center text-red-500">
          {error}
        </div>
      </section>
    );
  }

  return (
    <section className="py-20 border-y border-border bg-card/30">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
        {statistics.map((stat, index) => (
          <div 
            key={stat._id || index} 
            className="p-6 bg-linear-to-br from-primary/10 to-primary/5 rounded-xl border border-primary/20 hover:border-primary/50 transition-all duration-300 group hover:shadow-lg hover:shadow-primary/20 hover:-translate-y-1"
          >
            <div className="text-4xl font-bold text-primary mb-2 group-hover:scale-110 transition-all duration-300">
              {stat.value}
            </div>
            <div className="text-muted-foreground font-medium">{stat.label}</div>
          </div>
        ))}
      </div>
    </section>
  );
};
