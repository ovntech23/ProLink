import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Footer } from '../components/layout/Footer';
import prolinkLogo from '../assets/prolink logo.png';

export const SignUp = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    company: '',
    phone: '',
    role: 'owner',
  });

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Basic validation
    if (formData.password !== formData.confirmPassword) {
      alert('Passwords do not match!');
      return;
    }
    if (formData.password.length < 6) {
      alert('Password must be at least 6 characters long!');
      return;
    }
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      alert('Please enter a valid email address!');
      return;
    }
    const { signUp } = useStore.getState();
    signUp({
      name: formData.name,
      email: formData.email,
      password: formData.password,
      role: formData.role as any,
      phone: formData.phone,
    });
    alert(`Registration successful! Your account is pending admin approval. You will be able to log in once approved.`);
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      {/* Navigation */}
      <nav className="fixed w-full z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-4 flex justify-between items-center">
          <div className="flex items-center gap-2 sm:gap-3 cursor-pointer" onClick={() => navigate('/')}>
            <div className="w-8 h-8 sm:w-12 sm:h-12 flex items-center justify-center">
              <img src={prolinkLogo} alt="ProLink Logo" className="w-full h-full object-contain" />
            </div>
            <span className="text-lg sm:text-xl font-bold truncate max-w-[100px] sm:max-w-none" style={{ color: '#0a0c65' }}> ProLink </span>
          </div>
          <div className="hidden lg:flex gap-8 text-sm font-medium text-muted-foreground">
            <a href="/" className="hover:text-foreground transition-colors">Home</a>
            <a href="/#features" className="hover:text-foreground transition-colors">Features</a>
            <a href="/#solutions" className="hover:text-foreground transition-colors">Solutions</a>
            <a href="/#about" className="hover:text-foreground transition-colors">About Us</a>
          </div>
          <div className="flex gap-2 sm:gap-4 items-center">
            <button onClick={() => navigate('/login')} className="text-xs sm:text-sm font-medium text-muted-foreground hover:text-foreground transition-colors px-2" >
              Sign In
            </button>
            <button onClick={() => navigate('/signup')} className="px-3 py-1.5 sm:px-4 sm:py-2 hover:bg-[#940909] rounded-lg text-xs sm:text-sm font-medium text-white transition-colors shadow-lg whitespace-nowrap" style={{ backgroundColor: '#ba0b0b' }}>
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
            <CardTitle className="text-3xl font-black text-[#0a0c65] uppercase tracking-tighter"> Create Account </CardTitle>
            <CardDescription className="uppercase text-[10px] font-bold tracking-[0.2em] text-[#ba0b0b]">Join Zambia's Professional Logistics Network</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">Full Name</Label>
                <Input id="name" name="name" type="text" placeholder="Enter your full name" value={formData.name} onChange={(e) => handleChange('name', e.target.value)} required autoComplete="name" />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input id="email" name="email" type="email" placeholder="Enter your email" value={formData.email} onChange={(e) => handleChange('email', e.target.value)} required autoComplete="email" />
              </div>
              <div>
                <Label htmlFor="password">Password</Label>
                <Input id="password" name="password" type="password" placeholder="Create a password" value={formData.password} onChange={(e) => handleChange('password', e.target.value)} required autoComplete="new-password" />
              </div>
              <div>
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input id="confirmPassword" name="confirmPassword" type="password" placeholder="Confirm your password" value={formData.confirmPassword} onChange={(e) => handleChange('confirmPassword', e.target.value)} required autoComplete="new-password" />
              </div>
              <div>
                <Label htmlFor="company">Company Name</Label>
                <Input id="company" name="company" type="text" placeholder="Enter your company name" value={formData.company} onChange={(e) => handleChange('company', e.target.value)} autoComplete="organization" />
              </div>
              <div>
                <Label htmlFor="phone">Phone Number</Label>
                <Input id="phone" name="phone" type="tel" placeholder="Enter your phone number" value={formData.phone} onChange={(e) => handleChange('phone', e.target.value)} autoComplete="tel" />
              </div>
              <div>
                <Label htmlFor="role">Role</Label>
                <Select value={formData.role} onValueChange={(value) => handleChange('role', value)} >
                  <SelectTrigger id="role" name="role">
                    <SelectValue placeholder="Select a role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="owner">Cargo Owner</SelectItem>
                    <SelectItem value="transporter">Transporter</SelectItem>
                    <SelectItem value="driver">Driver</SelectItem>
                  </SelectContent>
                </Select>
                <input type="hidden" name="role" value={formData.role} />
              </div>
              <div className="text-[10px] text-muted-foreground text-center leading-relaxed">
                By registering, you agree to our <button type="button" onClick={() => navigate('/terms')} className="text-[#ba0b0b] font-bold hover:underline">Terms of Service</button> and <button type="button" onClick={() => navigate('/privacy')} className="text-[#ba0b0b] font-bold hover:underline">Privacy Policy</button>.
              </div>
              <Button type="submit" className="w-full bg-[#0a0c65] hover:bg-[#0a0c65]/90 text-white font-bold h-12 rounded-xl transition-all shadow-lg hover:shadow-xl active:scale-95 uppercase tracking-widest text-xs">
                Register Account
              </Button>
            </form>
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

export default SignUp;
