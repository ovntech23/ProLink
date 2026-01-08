import { Carousel, CarouselContent, CarouselItem, CarouselPrevious, CarouselNext } from "@/components/ui/carousel";
import { type CarouselApi } from "@/components/ui/carousel";
import * as React from "react";
import { usePerformance } from '../../hooks/use-performance';

export const PartnersSection = () => {
  const [partnersApi, setPartnersApi] = React.useState<CarouselApi>();
  const partnersIntervalRef = React.useRef<number | null>(null);
  const { isMobile, reduceAnimationComplexity } = usePerformance();

  // Adjust carousel speed based on performance (slower on mobile for better UX)
  const carouselInterval = isMobile ? 6000 : reduceAnimationComplexity ? 5000 : 3000;
  
  // Set up partners auto-scrolling
  React.useEffect(() => {
    if (!partnersApi) return;
    
    const startScrolling = () => {
      if (partnersIntervalRef.current) clearInterval(partnersIntervalRef.current);
  partnersIntervalRef.current = window.setInterval(() => {
    partnersApi.scrollNext();
  }, carouselInterval);
    };
    
    startScrolling();
    
    return () => {
      if (partnersIntervalRef.current) clearInterval(partnersIntervalRef.current);
    };
  }, [partnersApi, carouselInterval]);
  
  return (
    <section id="solutions" className="py-24 bg-[#0a0c65] relative overflow-hidden">
      {/* Background Decorative Pattern */}
      <div 
        className="absolute inset-0 opacity-10 pointer-events-none" 
        style={{ 
          backgroundImage: `radial-gradient(circle at 2px 2px, #ba0b0b 1px, transparent 0)`, 
          backgroundSize: '32px 32px' 
        }}
      ></div>
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="text-center mb-16">
          <div className="inline-block px-4 py-1.5 bg-[#ba0b0b] text-white text-[10px] font-bold rounded-full mb-6 uppercase tracking-widest animate-fade-in shadow-lg shadow-[#ba0b0b]/20">
            Trusted Network
          </div>
          <h2 className="text-4xl font-black mb-4 text-white uppercase tracking-tight">
            Our Strategic Partners
          </h2>
          <div className="w-24 h-1.5 bg-[#ba0b0b] mx-auto rounded-full mb-8"></div>
          <p className="text-blue-100/70 max-w-2xl mx-auto text-lg italic font-medium leading-relaxed">
            "Our business is built on matching your needs with the best available transport partners."
          </p>
        </div>
        <Carousel 
          setApi={setPartnersApi} 
          opts={{ align: "start", loop: true }} 
          className="w-full"
        >
          <CarouselContent className="-ml-2 md:-ml-4">
            {[
              'Caribbean Transport',
              'Sable Transport',
              'Goyal Overseas',
              'Transaxe Shipping',
              'Rexwell General Dealers',
              'Melon Word Trade',
              'Forefront',
              'Paragon',
              'Crossland Highway',
              'Crown Shipping',
              'Kapiri Transport',
              'Nakalanga Transport',
              'Umukate Investment',
              'Lusaka Machine Movers',
              'Rift Valley',
              'Badat Agencies'
            ].map((partner) => (
              <CarouselItem key={partner} className="pl-2 md:pl-4 basis-1/2 md:basis-1/4 lg:basis-1/5">
                <div className="p-4 bg-white rounded-2xl shadow-xl hover:shadow-[#ba0b0b]/20 hover:-translate-y-1 transition-all duration-300 flex items-center justify-center min-h-20 text-center border-b-4 border-[#ba0b0b] group">
                  <span className="font-bold text-[#0a0c65] group-hover:text-[#ba0b0b] transition-colors uppercase tracking-tighter text-xs md:text-sm leading-tight">
                    {partner}
                  </span>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <div className="flex justify-center gap-4 mt-12 pb-2">
            <CarouselPrevious className="relative translate-y-0 left-0 bg-white/10 hover:bg-[#ba0b0b] border-none text-white transition-all h-10 w-10" />
            <CarouselNext className="relative translate-y-0 right-0 bg-white/10 hover:bg-[#ba0b0b] border-none text-white transition-all h-10 w-10" />
          </div>
        </Carousel>
      </div>
    </section>
  );
};