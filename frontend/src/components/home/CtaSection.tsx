import truckBackground from '../../assets/truck1.jpg';
import { useNavigate } from 'react-router-dom';

export const CtaSection = () => {
  const navigate = useNavigate();

  return (
    <section
      className="relative py-24 bg-cover bg-center bg-no-repeat overflow-hidden"
      style={{
        backgroundImage: `url(${truckBackground})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}
    >
      {/* Dark Overlay for maximum contrast */}
      <div className={`absolute inset-0 bg-[#0a0c65]/80 backdrop-blur-[2px]`}></div>

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="text-center">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-black mb-6 text-white uppercase tracking-tight">
            Ready to Transform Your Logistics?
          </h2>
          <div className="w-24 h-1.5 bg-[#ba0b0b] mx-auto rounded-full mb-8"></div>
          <p className="text-blue-100/90 max-w-2xl mx-auto mb-10 text-lg sm:text-xl font-medium leading-relaxed">
            Join thousands of businesses already using ProLink to streamline their supply chain operations.
          </p>
          <button
            onClick={() => navigate('/signup')}
            className="px-10 py-5 bg-[#ba0b0b] hover:bg-[#940909] rounded-2xl font-black transition-all transform hover:scale-105 shadow-2xl shadow-[#ba0b0b]/40 text-white uppercase tracking-widest text-sm"
          >
            Get Started Today
          </button>
        </div>
      </div>
    </section>
  );
};