import { useState, useEffect } from 'react';
import { Badge } from "@/components/ui/badge";
import { cargoApi, type Cargo } from '@/lib/api';

export const CargoListSection = () => {
  const [cargos, setCargos] = useState<Cargo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCargos = async () => {
      try {
        const data = await cargoApi.getCargos();
        setCargos(data);
      } catch (err) {
        setError('Failed to load cargo items');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchCargos();
  }, []);

  if (loading) {
    return (
      <section className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
            <div className="max-w-2xl">
              <Badge className="mb-4 bg-[#ba0b0b]">What We Move</Badge>
              <h2 className="text-3xl font-bold text-foreground">Specialized Cargo Solutions</h2>
              <p className="text-muted-foreground mt-2">
                Personalized transport solutions for a wide range of essential commodities across Zambia and beyond.
              </p>
            </div>
            <div className="hidden lg:block text-right">
              <p className="text-4xl font-black text-[#0a0c65]/5 uppercase tracking-tighter">
                Prolink Commodities
              </p>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {[1, 2, 3, 4, 5, 6].map((index) => (
              <div key={index} className="p-4 bg-white rounded-xl border border-slate-100 shadow-sm animate-pulse">
                <div className="h-4 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-6 text-center text-red-500">
          {error}
        </div>
      </section>
    );
  }

  return (
    <section className="py-20 bg-slate-50">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
          <div className="max-w-2xl">
            <Badge className="mb-4 bg-[#ba0b0b]">What We Move</Badge>
            <h2 className="text-3xl font-bold text-foreground">Specialized Cargo Solutions</h2>
            <p className="text-muted-foreground mt-2">
              Personalized transport solutions for a wide range of essential commodities across Zambia and beyond.
            </p>
          </div>
          <div className="hidden lg:block text-right">
            <p className="text-4xl font-black text-[#0a0c65]/5 uppercase tracking-tighter">
              Prolink Commodities
            </p>
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {cargos.map((cargo) => (
            <div key={cargo._id} className="p-4 bg-white rounded-xl border border-slate-100 shadow-sm hover:shadow-md transition-all text-center">
              <p className="text-sm font-bold text-foreground">{cargo.name}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};