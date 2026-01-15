import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Footer } from '../components/layout/Footer';
import { Search, Package, CheckCircle, Circle, MapPin, AlertTriangle, ArrowLeft, Truck } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import heroBackground from '../assets/heropic1.png';
import prolinkLogo from '../assets/prolink logo.png';

export const PublicTracking = () => {
    const navigate = useNavigate();
    const [searchId, setSearchId] = useState('');
    const [foundShipment, setFoundShipment] = useState<any>(null);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setFoundShipment(null);

        if (!searchId.trim()) {
            setError('Please enter a tracking ID');
            return;
        }

        setLoading(true);
        try {
            // Determine API URL based on environment or hardcoded for now since useStore handles base URL usually
            // Assuming standard vite proxy or relative path if served from same origin
            // But we need the direct URL. Let's use relative path /api which Vite proxies to backend.
            // If running separately, needs full URL. Usually imported from config.
            const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

            const response = await fetch(`${API_URL}/shipments/lookup/${searchId.trim()}`);
            const data = await response.json();

            if (response.ok) {
                setFoundShipment(data);
            } else {
                setError(data.message || 'No shipment found with that tracking ID.');
            }
        } catch (err) {
            setError('Failed to connect to tracking service. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const steps = [
        { key: 'pending', label: 'Order Placed' },
        { key: 'assigned', label: 'Driver Assigned' },
        { key: 'picked_up', label: 'Picked Up' },
        { key: 'in_transit', label: 'In Transit' },
        { key: 'delivered', label: 'Delivered' }
    ];

    const currentStepIndex = foundShipment ? steps.findIndex(s => s.key === foundShipment.status) : -1;

    return (
        <div className="min-h-screen bg-slate-50 relative overflow-hidden">
            {/* Background Decor */}
            <div className="absolute inset-0 opacity-5 pointer-events-none z-0">
                <img src={heroBackground} alt="" className="w-full h-full object-cover grayscale" />
            </div>

            {/* Navigation */}
            <nav className="relative z-50 bg-white/80 backdrop-blur-md border-b border-slate-200">
                <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
                    <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/')}>
                        <div className="w-10 h-10 flex items-center justify-center">
                            <img src={prolinkLogo} alt="ProLink Logo" className="w-full h-full object-contain" />
                        </div>
                        <span className="text-2xl font-bold uppercase tracking-widest text-[#ba0b0b]">ProLink</span>
                    </div>

                    <div className="hidden lg:flex gap-8 text-sm font-medium text-muted-foreground">
                        <a href="/" className="hover:text-foreground transition-colors">Home</a>
                        <a href="/#features" className="hover:text-foreground transition-colors">Features</a>
                        <a href="/#solutions" className="hover:text-foreground transition-colors">Solutions</a>
                        <a href="/#about" className="hover:text-foreground transition-colors">About Us</a>
                    </div>
                    <Button variant="ghost" onClick={() => navigate('/')} className="flex items-center gap-2">
                        <ArrowLeft size={18} />
                        Back to Home
                    </Button>
                </div>
            </nav>

            <main className="relative z-10 max-w-4xl mx-auto px-4 py-12 sm:py-20">
                <div className="text-center mb-12">
                    <h1 className="text-4xl sm:text-5xl font-extrabold text-[#0a0c65] mb-4 tracking-tight">
                        Track Your <span className="text-[#ba0b0b]">Cargo</span>
                    </h1>
                    <p className="text-slate-600 text-lg max-w-xl mx-auto">
                        Enter your tracking number below to see real-time updates on your shipment's journey.
                    </p>
                </div>

                {/* Search Section */}
                <Card className="mb-12 shadow-2xl border-none ring-1 ring-slate-200 overflow-hidden">
                    <CardContent className="p-2 sm:p-3 bg-white">
                        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-2">
                            <div className="relative flex-1">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                                <Label htmlFor="tracking-search" className="sr-only">Tracking ID</Label>
                                <Input
                                    id="tracking-search"
                                    name="trackingId"
                                    className="w-full pl-12 h-14 bg-slate-50 border-transparent focus:bg-white focus:border-[#ba0b0b]/20 rounded-xl text-lg font-medium transition-all"
                                    placeholder="Enter Tracking ID (e.g. TRK-XXXX)"
                                    value={searchId}
                                    onChange={(e) => setSearchId(e.target.value)}
                                    autoComplete="off"
                                />
                            </div>
                            <Button
                                type="submit"
                                disabled={loading}
                                className="h-14 px-8 bg-[#ba0b0b] hover:bg-[#940909] text-white font-bold rounded-xl shadow-lg shadow-[#ba0b0b]/20 transition-all active:scale-95 disabled:opacity-70"
                            >
                                {loading ? 'Searching...' : 'Track Now'}
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                {error && (
                    <div className="animate-in fade-in slide-in-from-top-4 duration-300">
                        <Card className="bg-red-50 border-red-100 mb-8">
                            <CardContent className="p-4 flex items-center gap-3 text-red-700 font-medium">
                                <AlertTriangle size={20} />
                                {error}
                            </CardContent>
                        </Card>
                    </div>
                )}

                {foundShipment && (
                    <div className="space-y-6 animate-in fade-in zoom-in-95 duration-500">
                        {/* Incident Alert */}
                        {foundShipment.incidentNote && (
                            <Card className="bg-amber-50 border-amber-200 border-l-4 border-l-amber-500">
                                <CardContent className="p-6">
                                    <div className="flex items-start gap-4">
                                        <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
                                            <AlertTriangle className="text-amber-600" size={20} />
                                        </div>
                                        <div>
                                            <h3 className="text-amber-900 font-bold flex items-center gap-2">
                                                Active Delay Reported
                                            </h3>
                                            <p className="text-amber-800/80 text-sm mt-1">
                                                {foundShipment.incidentNote}
                                            </p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            {/* Timeline Card */}
                            <Card className="lg:col-span-2 shadow-xl border-slate-100">
                                <CardHeader className="bg-slate-50 border-b border-slate-100">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <CardTitle className="text-xl">Journey Progress</CardTitle>
                                            <CardDescription>Update ID: {foundShipment.trackingId}</CardDescription>
                                        </div>
                                        <Badge className={foundShipment.status === 'delivered' ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700'}>
                                            {foundShipment.status.replace('_', ' ')}
                                        </Badge>
                                    </div>
                                </CardHeader>
                                <CardContent className="p-8">
                                    <div className="relative">
                                        <div className="absolute left-6 top-8 bottom-8 w-0.5 bg-slate-200"></div>
                                        <div className="space-y-8">
                                            {steps.map((step, index) => {
                                                const isCompleted = index <= currentStepIndex;
                                                const isCurrent = index === currentStepIndex;
                                                const historyItem = foundShipment.statusHistory.find((h: any) => h.status === step.key);

                                                return (
                                                    <div key={step.key} className="relative z-10 flex items-start gap-6">
                                                        <div className={`w-12 h-12 rounded-full flex items-center justify-center border-4 shrink-0 transition-colors ${isCompleted ? 'bg-blue-50 border-blue-500 text-blue-600' : 'bg-white border-slate-200 text-slate-300'}`}>
                                                            {isCompleted ? <CheckCircle size={24} /> : <Circle size={24} />}
                                                        </div>
                                                        <div className="pt-2">
                                                            <h3 className={`font-bold text-lg ${isCompleted ? 'text-slate-900' : 'text-slate-400'}`}>
                                                                {step.label}
                                                            </h3>
                                                            {historyItem && (
                                                                <p className="text-sm text-slate-500 mt-1">
                                                                    {new Date(historyItem.timestamp).toLocaleString()}
                                                                </p>
                                                            )}
                                                            {isCurrent && (
                                                                <span className="inline-block mt-2 px-2 py-0.5 bg-blue-100 text-blue-700 text-[10px] font-bold rounded-full uppercase tracking-wider animate-pulse">
                                                                    Live Point
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Summary Card */}
                            <div className="space-y-6">
                                <Card className="shadow-xl border-slate-100">
                                    <CardHeader className="bg-slate-50 border-b border-slate-100 p-4">
                                        <CardTitle className="text-sm uppercase tracking-widest text-[#0a0c65]">Shipment Details</CardTitle>
                                    </CardHeader>
                                    <CardContent className="p-5 space-y-4">
                                        <div className="flex items-start gap-3">
                                            <div className="p-2 bg-blue-50 rounded-lg text-blue-600 shrink-0">
                                                <Package size={20} />
                                            </div>
                                            <div>
                                                <p className="text-xs font-bold text-slate-400 uppercase">Cargo Type</p>
                                                <p className="font-bold text-[#0a0c65] uppercase italic">{foundShipment.cargoType || 'General Freight'}</p>
                                            </div>
                                        </div>
                                        <div className="space-y-4 pt-4 border-t border-slate-100">
                                            <div>
                                                <div className="flex items-center gap-2 mb-1">
                                                    <MapPin size={14} className="text-emerald-500" />
                                                    <span className="text-[10px] font-bold text-slate-400 uppercase">From</span>
                                                </div>
                                                <p className="text-sm font-bold pl-5">{foundShipment.origin}</p>
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2 mb-1">
                                                    <MapPin size={14} className="text-[#ba0b0b]" />
                                                    <span className="text-[10px] font-bold text-slate-400 uppercase">To</span>
                                                </div>
                                                <p className="text-sm font-bold pl-5">{foundShipment.destination}</p>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card className="bg-[#0a0c65] text-white shadow-2xl">
                                    <CardContent className="p-6 text-center">
                                        <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4">
                                            <Truck className="text-white" size={32} />
                                        </div>
                                        <h4 className="font-bold text-xl mb-2">Need to assign more?</h4>
                                        <p className="text-white/70 text-sm mb-6">
                                            Join Zambia's fastest growing logistics network as a guest or partner.
                                        </p>
                                        <Button
                                            onClick={() => navigate('/login')}
                                            className="w-full bg-white text-[#0a0c65] hover:bg-slate-100 font-bold h-12 rounded-xl"
                                        >
                                            Login to Dashboard
                                        </Button>
                                    </CardContent>
                                </Card>
                            </div>
                        </div>
                    </div>
                )}
            </main>

            <Footer />
        </div>
    );
};
