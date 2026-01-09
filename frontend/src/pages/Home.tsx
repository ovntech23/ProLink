import { useNavigate } from 'react-router-dom';
import { Navigation } from '../components/home/Navigation';
import { HeroSection } from '../components/home/HeroSection';
import { FeaturesSection } from '../components/home/FeaturesSection';
import { VisionMissionSection } from '../components/home/VisionMissionSection';
import { CargoListSection } from '../components/home/CargoListSection';
import { StatsSection } from '../components/home/StatsSection';
import { ApiTestSection } from '../components/home/ApiTestSection';
import { PartnersSection } from '../components/home/PartnersSection';
import { CtaSection } from '../components/home/CtaSection';
import { Footer } from '../components/layout/Footer';

export const Home = () => {
  const navigate = useNavigate();
  
  const handleNavigateToLogin = () => {
    navigate('/login');
  };
  
  const handleNavigateToSignup = () => {
    navigate('/signup');
  };
  
  const handleNavigateToTrack = () => {
    navigate('/track');
  };

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      <Navigation 
        onNavigateToLogin={handleNavigateToLogin}
        onNavigateToSignup={handleNavigateToSignup}
      />
      
      <HeroSection 
        onNavigateToSignup={handleNavigateToSignup}
        onNavigateToTrack={handleNavigateToTrack}
      />
      
      <FeaturesSection />
      
      <VisionMissionSection />
      
      <CargoListSection />
      
<StatsSection />
<ApiTestSection />
      
      <PartnersSection />
      
      <CtaSection />
      
      <Footer />
    </div>
  );
};