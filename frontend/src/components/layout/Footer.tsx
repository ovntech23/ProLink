import { useNavigate } from 'react-router-dom';
import { MapPin, Phone, Mail } from 'lucide-react';
import prolinkLogo from '../../assets/prolink logo.png';

export const Footer = () => {
    const navigate = useNavigate();

    return (
        <footer id="about" className="py-16 bg-[#0a0c65] text-white">
            <div className="max-w-7xl mx-auto px-6">
                <div className="grid md:grid-cols-4 gap-12 mb-12">
                    <div className="space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="w-14 h-14 bg-white p-2 rounded-xl">
                                <img src={prolinkLogo} alt="ProLink Logo" className="w-full h-full object-contain" />
                            </div>
                            <span className="text-2xl font-bold uppercase tracking-widest text-[#ba0b0b]">ProLink</span>
                        </div>
                        <p className="text-blue-100/60 text-sm leading-relaxed">
                            Zambia's fastest-growing and most trusted professional transport and logistics brokers. Customised solutions for your global trade needs.
                        </p>
                    </div>

                    <div className="space-y-4">
                        <h4 className="font-bold text-lg border-b border-white/10 pb-2">Contact Us</h4>
                        <ul className="space-y-3">
                            <li className="flex items-start gap-3">
                                <MapPin size={18} className="text-[#ba0b0b] shrink-0 mt-1" />
                                <span className="text-blue-100/80 text-sm">17 Nangwenya Road, Rhodes Park, Lusaka, Zambia</span>
                            </li>
                            <li className="flex items-center gap-3">
                                <Phone size={18} className="text-[#ba0b0b] shrink-0" />
                                <span className="text-blue-100/80 text-sm">+260 977 596 029</span>
                            </li>
                            <li className="flex items-center gap-3">
                                <Mail size={18} className="text-[#ba0b0b] shrink-0" />
                                <span className="text-blue-100/80 text-sm">info@prolinkafrica.com</span>
                            </li>
                        </ul>
                    </div>

                    <div className="space-y-4">
                        <h4 className="font-bold text-lg border-b border-white/10 pb-2">Quick Links</h4>
                        <ul className="space-y-2 text-sm text-blue-100/60">
                            <li><a href="/#features" className="hover:text-white transition-colors">Core Values</a></li>
                            <li><a href="/#about" className="hover:text-white transition-colors">Vision & Mission</a></li>
                            <li><a href="/#solutions" className="hover:text-white transition-colors">Our Partners</a></li>
                            <li><button onClick={() => navigate('/track')} className="hover:text-white transition-colors">Track Shipment</button></li>
                        </ul>
                    </div>

                    <div className="space-y-4">
                        <h4 className="font-bold text-lg border-b border-white/10 pb-2">Business Hours</h4>
                        <ul className="space-y-2 text-sm text-blue-100/60">
                            <li className="flex justify-between">
                                <span>Mon - Fri:</span>
                                <span className="text-white">08:00 - 17:00</span>
                            </li>
                            <li className="flex justify-between">
                                <span>Saturday:</span>
                                <span className="text-white">09:00 - 13:00</span>
                            </li>
                            <li className="flex justify-between">
                                <span>Sunday:</span>
                                <span className="text-[#ba0b0b]">Closed</span>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-blue-100/40">
                    <div className="flex flex-col gap-1 text-center md:text-left">
                        <p>© 2026 ProLink Enterprises. All rights reserved.</p>
                        <p className="text-[10px] uppercase tracking-[0.2em] font-medium text-white/20">
                            Designed by <span className="text-white/40">Ovine Nyalazi</span> • <a href="mailto:ovine@nyalazi.com" className="hover:text-[#ba0b0b] transition-colors">ovine@nyalazi.com</a>
                        </p>
                    </div>
                    <div className="flex gap-6">
                        <button onClick={() => navigate('/privacy')} className="hover:text-white transition-colors">Privacy Policy</button>
                        <button onClick={() => navigate('/terms')} className="hover:text-white transition-colors">Terms of Service</button>
                    </div>
                </div>
            </div>
        </footer>
    );
};
