import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { Footer } from '../components/layout/Footer';
import { Truck, Shield, Package, MapPin } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import prolinkLogo from '../assets/prolink logo.png';

export const Login = () => {
  const { login, users } = useStore();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const handleLogin = (email: string, role: string) => {
    const user = users.find(u => u.email === email);
    if (user && !user.isApproved) {
      toast({
        title: "Account Pending Approval",
        description: "Your account is pending admin approval. You will be able to log in once approved.",
        variant: "destructive",
      });
      return;
    }

    login(email);
    if (role === 'broker') navigate('/broker');
    else if (role === 'owner') navigate('/owner/shipments');
    else if (role === 'driver') navigate('/driver/jobs');
  };

  const handleSignUp = () => {
    navigate('/signup');
  };

  const handleFormChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Basic validation
    if (!formData.email || !formData.password) {
      toast({
        title: "Missing Information",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast({
        title: "Invalid Email",
        description: "Please enter a valid email address",
        variant: "destructive",
      });
      return;
    }

    // Password validation (minimum 6 characters)
    if (formData.password.length < 6) {
      toast({
        title: "Weak Password",
        description: "Password must be at least 6 characters long",
        variant: "destructive",
      });
      return;
    }

    // Find user by email
    const user = users.find(u => u.email === formData.email);
    if (user) {
      handleLogin(user.email, user.role);
    } else {
      toast({
        title: "Invalid Credentials",
        description: "Invalid email or password",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      {/* Navigation */}
      <nav className="fixed w-full z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/')}>
            <div className="w-10 h-10 flex items-center justify-center">
              <img src={prolinkLogo} alt="ProLink Logo" className="w-full h-full object-contain" />
            </div>
            <span className="text-xl font-bold" style={{ color: '#0a0c65' }}> ProLink </span>
          </div>
          <div className="hidden lg:flex gap-8 text-sm font-medium text-muted-foreground">
            <a href="/" className="hover:text-foreground transition-colors">Home</a>
            <a href="/#features" className="hover:text-foreground transition-colors">Features</a>
            <a href="/#solutions" className="hover:text-foreground transition-colors">Solutions</a>
            <a href="/#about" className="hover:text-foreground transition-colors">About Us</a>
          </div>
          <div className="flex gap-2 sm:gap-4">
            <button onClick={() => navigate('/login')} className="text-xs sm:text-sm font-medium text-muted-foreground hover:text-foreground transition-colors px-2" >
              Sign In
            </button>
            <button onClick={() => navigate('/signup')} className="px-3 py-1.5 sm:px-4 sm:py-2 hover:bg-[#940909] rounded-lg text-xs sm:text-sm font-medium text-white transition-colors shadow-lg" style={{ backgroundColor: '#ba0b0b' }}>
              Get Started
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="pt-20 min-h-screen flex items-center justify-center p-4">
        <Card className="max-w-md w-full shadow-2xl">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="w-20 h-20 bg-white p-3 rounded-2xl shadow-xl border border-slate-100 transform -rotate-3 hover:rotate-0 transition-transform duration-500">
                <img src={prolinkLogo} alt="ProLink Logo" className="w-full h-full object-contain" />
              </div>
            </div>
            <CardTitle className="text-3xl font-black text-[#0a0c65] uppercase tracking-tighter"> ProLink </CardTitle>
            <CardDescription className="uppercase text-[10px] font-bold tracking-[0.2em] text-[#ba0b0b]">Join Zambia's Professional Logistics Network</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleFormSubmit} className="space-y-4 mb-8 pb-8 border-b border-border">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={(e) => handleFormChange('email', e.target.value)}
                  required
                  autoComplete="email"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={(e) => handleFormChange('password', e.target.value)}
                  required
                  autoComplete="current-password"
                />
              </div>
              <Button type="submit" className="w-full">
                Sign In
              </Button>
            </form>

            <div className="space-y-4">
              <p className="text-sm font-medium text-muted-foreground text-center uppercase tracking-wider">Select Login Role (Demo)</p>
              {[
                users.find(u => u.role === 'broker' && u.isApproved),
                users.find(u => u.role === 'owner' && u.isApproved),
                users.find(u => u.role === 'driver' && u.isApproved)
              ].filter(Boolean).map((user) => (
                <Button key={user!.id} variant="outline" className="w-full p-4 rounded-xl border border-border hover:border-primary hover:bg-primary/10 transition-all flex items-center gap-4 group justify-start" onClick={() => handleLogin(user!.email, user!.role)} >
                  <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-foreground group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                    {user!.role === 'broker' && <Shield size={20} />}
                    {user!.role === 'owner' && <Package size={20} />}
                    {user!.role === 'driver' && <Truck size={20} />}
                  </div>
                  <div className="text-left">
                    <MapPin size={14} className="text-[#ba0b0b]" />
                    <p className="font-bold text-foreground group-hover:text-primary">{user!.name}</p>
                    <p className="text-xs text-muted-foreground capitalize">{user!.role} Account</p>
                  </div>
                </Button>
              ))}
              <Button variant="outline" className="w-full p-4 rounded-xl border border-border hover:border-primary hover:bg-primary/10 transition-all flex items-center gap-4 justify-center" onClick={handleSignUp} >
                Sign Up for an Account
              </Button>
            </div>
          </CardContent>
<CardFooter className="text-center text-xs text-muted-foreground">
        ProLink Logistics © 2026
      </CardFooter>
        </Card>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
};
