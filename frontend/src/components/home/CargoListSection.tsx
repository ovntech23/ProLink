import { Badge } from "@/components/ui/badge";

export const CargoListSection = () => {
  // Hard-coded cargo data
  const cargos = [
    { _id: '1', name: 'Wheat', category: 'Agricultural' },
    { _id: '2', name: 'Soya Beans', category: 'Agricultural' },
    { _id: '3', name: 'Maize', category: 'Agricultural' },
    { _id: '4', name: 'Seed', category: 'Agricultural' },
    { _id: '5', name: 'Fertilizer', category: 'Agricultural' },
    { _id: '6', name: 'Limestone', category: 'Industrial' },
    { _id: '7', name: 'Coal', category: 'Industrial' },
    { _id: '8', name: 'Cement', category: 'Construction' },
    { _id: '9', name: 'Steel', category: 'Construction' },
    { _id: '10', name: 'Timber', category: 'Construction' },
    { _id: '11', name: 'Tiles', category: 'Construction' },
    { _id: '12', name: 'Groceries', category: 'Consumer Goods' }
  ];

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