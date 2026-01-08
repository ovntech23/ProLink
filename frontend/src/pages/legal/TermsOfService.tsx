import { FileCheck, Scale, AlertCircle, Info, ArrowLeft, Gavel } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Footer } from '@/components/layout/Footer';

export const TermsOfService = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col">
            <header className="bg-white border-b sticky top-0 z-50">
                <div className="max-w-4xl mx-auto px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Scale className="text-[#ba0b0b]" size={24} />
                        <h1 className="text-xl font-bold text-[#0a0c65]">Terms of Service</h1>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="gap-2">
                        <ArrowLeft size={16} /> Back
                    </Button>
                </div>
            </header>

            <main className="flex-grow py-12 px-6">
                <div className="max-w-4xl mx-auto space-y-8">
                    <div className="text-center mb-12">
                        <h2 className="text-4xl font-black text-[#0a0c65] mb-4">Terms & Conditions</h2>
                        <p className="text-slate-500 max-w-2xl mx-auto">
                            By using ProLink, you agree to the following terms. Please read them carefully to understand our mutual obligations.
                        </p>
                    </div>

                    <Card className="border-none shadow-xl shadow-slate-200/50 overflow-hidden">
                        <CardContent className="p-8 md:p-12 prose prose-slate max-w-none">
                            <section className="mb-10">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="p-2 bg-blue-50 rounded-lg text-[#0a0c65]">
                                        <Info size={20} />
                                    </div>
                                    <h3 className="text-2xl font-bold m-0 text-[#0a0c65]">1. Acceptance of Terms</h3>
                                </div>
                                <p>
                                    Welcome to ProLink Enterprises ("ProLink," "we," "us," or "our"). These Terms of Service ("Terms") govern your access to and use of our platform, including our website and logistics management system. By registering an account or using our services, you agree to be bound by these Terms and our Privacy Policy.
                                </p>
                            </section>

                            <section className="mb-10">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="p-2 bg-blue-50 rounded-lg text-[#0a0c65]">
                                        <FileCheck size={20} />
                                    </div>
                                    <h3 className="text-2xl font-bold m-0 text-[#0a0c65]">2. Description of Services</h3>
                                </div>
                                <p>
                                    ProLink operates as a logistics brokerage platform that connects cargo owners ("Owners") with transport providers ("Drivers" or "Transporters"). ProLink facilitates the matching of cargo to available vehicles, tracking of shipments, and management of logistics data.
                                </p>
                                <p><strong>Note:</strong> ProLink acts as a facilitator and broker. The actual contract for carriage of goods is between the Cargo Owner and the Transporter.</p>
                            </section>

                            <section className="mb-10">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="p-2 bg-blue-50 rounded-lg text-[#0a0c65]">
                                        <AlertCircle size={20} />
                                    </div>
                                    <h3 className="text-2xl font-bold m-0 text-[#0a0c65]">3. User Obligations</h3>
                                </div>
                                <div className="space-y-4">
                                    <div className="p-4 bg-slate-50 rounded-lg border-l-4 border-[#ba0b0b]">
                                        <p className="font-bold text-sm text-[#0a0c65] mb-1 uppercase tracking-wider">For Cargo Owners</p>
                                        <p className="text-sm">You must provide accurate descriptions of cargo, weight, dimensions, and pick-up/delivery points. You are responsible for ensuring cargo is properly packed and ready for transport.</p>
                                    </div>
                                    <div className="p-4 bg-slate-50 rounded-lg border-l-4 border-blue-400">
                                        <p className="font-bold text-sm text-[#0a0c65] mb-1 uppercase tracking-wider">For Transporters</p>
                                        <p className="text-sm">You must maintain valid vehicle registration, insurance, and licensing required by Zambian law. You agree to provide real-time tracking updates and handle cargo with professional care.</p>
                                    </div>
                                </div>
                            </section>

                            <section className="mb-10">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="p-2 bg-blue-50 rounded-lg text-[#0a0c65]">
                                        <Scale size={20} />
                                    </div>
                                    <h3 className="text-2xl font-bold m-0 text-[#0a0c65]">4. Liability & Insurance</h3>
                                </div>
                                <p>
                                    Transporters are responsible for the safe delivery of goods. ProLink's liability is limited to the brokerage commission earned on a specific transaction. We recommend all Cargo Owners maintain appropriate marine/transit insurance for their goods.
                                </p>
                            </section>

                            <section>
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="p-2 bg-blue-50 rounded-lg text-[#0a0c65]">
                                        <Gavel size={20} />
                                    </div>
                                    <h3 className="text-2xl font-bold m-0 text-[#0a0c65]">5. Governing Law</h3>
                                </div>
                                <p>
                                    These Terms are governed by and construed in accordance with the laws of the Republic of Zambia. Any disputes arising from these Terms or use of the platform shall be subject to the exclusive jurisdiction of the courts in Lusaka, Zambia.
                                </p>
                            </section>
                        </CardContent>
                    </Card>
                </div>
            </main>

            <Footer />
        </div>
    );
};
