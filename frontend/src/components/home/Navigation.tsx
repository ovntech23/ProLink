import prolinkLogo from '../../assets/prolink logo.png';

interface NavigationProps {
  onNavigateToLogin: () => void;
  onNavigateToSignup: () => void;
}

export const Navigation = ({ onNavigateToLogin, onNavigateToSignup }: NavigationProps) => {
  return (
    <nav className="fixed w-full z-50 bg-background/80 backdrop-blur-md border-b border-border">
      <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 flex items-center justify-center">
            <img src={prolinkLogo} alt="ProLink Logo" className="w-full h-full object-contain" />
          </div>
          <span className="text-xl font-bold" style={{ color: '#0a0c65' }}>ProLink</span>
        </div>
        <div className="hidden md:flex gap-8 text-sm font-medium text-muted-foreground">
          <a href="#features" className="hover:text-foreground transition-colors">Features</a>
          <a href="#solutions" className="hover:text-foreground transition-colors">Solutions</a>
          <a href="#about" className="hover:text-foreground transition-colors">About Us</a>
        </div>
        <div className="flex gap-4">
          <button 
            onClick={onNavigateToLogin}
            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            Sign In
          </button>
          <button 
            onClick={onNavigateToSignup}
            className="px-4 py-2 hover:bg-[#940909] rounded-lg text-sm font-medium text-white transition-colors shadow-lg" 
            style={{ backgroundColor: '#ba0b0b' }}
          >
            Get Started
          </button>
        </div>
      </div>
    </nav>
  );
};