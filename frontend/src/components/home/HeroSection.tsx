import { ArrowRight, Shield, Zap, Globe, ChevronRight } from 'lucide-react';
import heroBackground from '../../assets/heropic1.png';
import heroForeground1 from '../../assets/heroforeground.jpg';
import heroForeground2 from '../../assets/hero-image.jpg';
import heroForeground4 from '../../assets/heropi2.png';
import { Carousel, CarouselContent, CarouselItem, CarouselPrevious, CarouselNext } from "@/components/ui/carousel";
import { type CarouselApi } from "@/components/ui/carousel";
import * as React from "react";
import { usePerformance } from '../../hooks/use-performance';

interface HeroSectionProps {
  onNavigateToSignup: () => void;
  onNavigateToTrack: () => void;
}

export const HeroSection = ({ onNavigateToSignup, onNavigateToTrack }: HeroSectionProps) => {
  const [api, setApi] = React.useState<CarouselApi>();
  const intervalRef = React.useRef<number | null>(null);
  const [isHovered, setIsHovered] = React.useState(false);
  const { isMobile } = usePerformance();

  // Auto-rotation interval (slower on mobile for better UX)
  const AUTO_ROTATION_INTERVAL = isMobile ? 8000 : 5000;
  const effectiveRotationInterval = AUTO_ROTATION_INTERVAL;

  // Set up auto-rotation
  React.useEffect(() => {
    if (!api) {
      return;
    }

    // Start auto-rotation
    const startAutoRotation = () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      intervalRef.current = window.setInterval(() => {
        api.scrollNext();
      }, effectiveRotationInterval);
    };

    // Clear interval
    const clearAutoRotation = () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };

    // Handle hover events
    const handleMouseEnter = () => {
      setIsHovered(true);
      clearAutoRotation();
    };

    const handleMouseLeave = () => {
      setIsHovered(false);
      startAutoRotation();
    };

    // Set up event listeners
    const carouselElement = api.containerNode();
    if (carouselElement) {
      carouselElement.addEventListener('mouseenter', handleMouseEnter);
      carouselElement.addEventListener('mouseleave', handleMouseLeave);
    }

    // Start auto-rotation
    startAutoRotation();

    // Clean up
    return () => {
      clearAutoRotation();
      if (carouselElement) {
        carouselElement.removeEventListener('mouseenter', handleMouseEnter);
        carouselElement.removeEventListener('mouseleave', handleMouseLeave);
      }
    };
  }, [api, isHovered, effectiveRotationInterval]);

  return (
    <section className="relative pt-32 pb-16 sm:pt-32 sm:pb-20 lg:pt-48 lg:pb-32 px-4 sm:px-6 hero-gradient overflow-hidden"
      style={{ backgroundImage: `url(${heroBackground})`, backgroundSize: 'cover', backgroundPosition: 'center', backgroundRepeat: 'no-repeat' }}
    >
      {/* Floating particles for background animation - now visible on all devices */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-white/10 rounded-full animate-ping animation-delay-1000"></div>
        <div className="absolute top-3/4 right-1/4 w-1 h-1 bg-blue-300/20 rounded-full animate-pulse animation-delay-2000"></div>
        <div className="absolute top-1/2 left-3/4 w-1.5 h-1.5 bg-red-300/15 rounded-full animate-ping animation-delay-3000"></div>
      </div>
      <div className="absolute inset-0 bg-[#0a0c65]/80 backdrop-blur-[2px]"></div>
      <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-8 sm:gap-12 items-center relative z-10">
        <div className="relative z-10 animate-fade-in animation-delay-200">
          {/* Floating tag with subtle animation */}
          <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#ba0b0b]/20 text-white text-sm font-bold mb-4 sm:mb-6 border-2 border-[#ba0b0b] animate-float animation-delay-500 shadow-lg shadow-[#ba0b0b]/30 transform hover:scale-105 transition-all duration-300`}>
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
            </span>
            Zambia's Fast Growing Logistics Broker
          </div>
          
          {/* Hero text with responsive sizing and floating animation */}
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-black leading-none mb-2 sm:mb-3 drop-shadow-2xl animate-slide-in-left hover:animate-float hover:duration-700 transition-all transform hover:scale-105"
            style={{ textShadow: '0 0 20px rgba(255,255,255,0.8), 0 0 40px rgba(255,255,255,0.6), 0 0 60px rgba(255,255,255,0.4)' }}>
            <span className="block animate-float animation-delay-300 hover:animate-none hover:transform hover:-translate-y-2 hover:duration-300 transition-all"
              style={{ color: '#0a0c65' }}>
              Logistics: The backbone
            </span>
            <div className="w-24 h-1 bg-linear-to-r from-[#ba0b0b] to-transparent my-1 sm:my-2 rounded-full animate-slide-in-left animation-delay-400"></div>
            <span className="block animate-float animation-delay-500 hover:animate-none hover:transform hover:-translate-y-2 hover:duration-300 transition-all"
              style={{ color: '#ba0b0b' }}>
              of Global Trade
            </span>
          </h1>
          
          {/* Description with entrance animation - responsive text size */}
          <p className="text-lg sm:text-xl text-white mb-6 sm:mb-8 max-w-2xl leading-relaxed font-medium animate-fade-in animation-delay-700"
            style={{ textShadow: '0 2px 4px rgba(0,0,0,0.3)' }}>
            Prolink provides customised transport solutions with competitive rates and an authentic approach to real customer service. Trusted across Zambia and the world.
          </p>
          
          {/* CTA Buttons with responsive sizing and floating effects */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-8 sm:mb-12 animate-fade-in animation-delay-900">
            <button onClick={onNavigateToSignup}
              className="px-6 py-3 sm:px-8 sm:py-4 bg-[#ba0b0b] hover:bg-[#940909] rounded-xl font-bold transition-all transform hover:scale-105 shadow-xl shadow-[#ba0b0b]/20 flex items-center justify-center gap-2 text-white hover:animate-float hover:duration-1000 active:scale-95">
              Start Shipping Now
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </button>
            <button onClick={onNavigateToTrack}
              className="px-6 py-3 sm:px-8 sm:py-4 bg-secondary hover:bg-secondary/90 rounded-xl font-bold transition-all transform hover:scale-105 border border-secondary flex items-center justify-center gap-2 text-secondary-foreground hover:animate-float hover:duration-1000 active:scale-95 shadow-xl shadow-secondary/20">
              Track Shipment
              <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
          
          {/* Feature icons with responsive layout and floating animations */}
          <div className="mt-8 sm:mt-12 flex flex-wrap items-center gap-4 sm:gap-8 text-white/90 animate-fade-in animation-delay-1100">
            <div className="flex items-center gap-2 group hover:animate-float hover:duration-500 transition-all">
              <Shield size={16} className="text-white sm:w-5 sm:h-5" />
              <span className="text-xs sm:text-sm">Secure Payments</span>
            </div>
            <div className="flex items-center gap-2 group hover:animate-float hover:duration-500 transition-all">
              <Globe size={16} className="text-white sm:w-5 sm:h-5" />
              <span className="text-xs sm:text-sm">Global Tracking</span>
            </div>
            <div className="flex items-center gap-2 group hover:animate-float hover:duration-500 transition-all">
              <Zap size={16} className="text-white sm:w-5 sm:h-5" />
              <span className="text-xs sm:text-sm">Instant Dispatch</span>
            </div>
          </div>
        </div>
        
        {/* Image container with carousel slider */}
        <div className="relative animate-scale-in animation-delay-400 hover:animate-float hover:duration-2000">
          <div className="absolute -inset-2 sm:-inset-4 bg-primary/20 rounded-2xl sm:rounded-3xl blur-2xl sm:blur-3xl opacity-30 animate-pulse"></div>
          <Carousel setApi={setApi} opts={{ loop: true }}
            className="relative rounded-xl sm:rounded-2xl shadow-xl sm:shadow-2xl border border-border w-full overflow-hidden">
            <CarouselContent>
              <CarouselItem>
                <div className="aspect-video w-full overflow-hidden">
                  <img src={heroForeground1} alt="Futuristic Truck" className="w-full h-full object-cover transform hover:scale-[1.05] transition-transform duration-700" loading="eager" />
                </div>
              </CarouselItem>
              <CarouselItem>
                <div className="aspect-video w-full overflow-hidden">
                  <img src={heroForeground2} alt="Logistics Network" className="w-full h-full object-cover transform hover:scale-[1.05] transition-transform duration-700" loading="eager" />
                </div>
              </CarouselItem>
              <CarouselItem>
                <div className="aspect-video w-full overflow-hidden">
                  <img src={heroForeground1} alt="Modern Logistics" className="w-full h-full object-cover transform hover:scale-[1.05] transition-transform duration-700" loading="eager" />
                </div>
              </CarouselItem>
              <CarouselItem>
                <div className="aspect-video w-full overflow-hidden">
                  <img src={heroForeground4} alt="Supply Chain" className="w-full h-full object-cover transform hover:scale-[1.05] transition-transform duration-700" loading="eager" />
                </div>
              </CarouselItem>
            </CarouselContent>
            <CarouselPrevious className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/40 border-none text-white backdrop-blur-sm" />
            <CarouselNext className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/40 border-none text-white backdrop-blur-sm" />
          </Carousel>
        </div>
      </div>
    </section>
  );
};