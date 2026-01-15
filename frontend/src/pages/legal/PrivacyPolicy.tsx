import { Shield, Lock, Eye, Mail, FileText, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Footer } from '@/components/layout/Footer';

export const PrivacyPolicy = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col">
            <header className="bg-white border-b sticky top-0 z-50">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Shield className="text-[#ba0b0b]" size={24} />
                        <h1 className="text-xl font-bold text-[#0a0c65]">Privacy Policy</h1>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="gap-2">
                        <ArrowLeft size={16} /> Back
                    </Button>
                </div>
            </header>

            <main className="flex-grow py-8 sm:py-12 px-4 sm:px-6">
                <div className="max-w-4xl mx-auto space-y-8">
                    <div className="text-center mb-12">
                        <h2 className="text-4xl font-black text-[#0a0c65] mb-4">Your Privacy Matters</h2>
                        <p className="text-slate-500 max-w-2xl mx-auto">
                            At ProLink, we are committed to protecting your personal data and being transparent about how we use it.
                            Last updated: January 2026.
                        </p>
                    </div>

                    <Card className="border-none shadow-xl shadow-slate-200/50 overflow-hidden">
                        <CardContent className="p-8 md:p-12 prose prose-slate max-w-none">
                            <section className="mb-10">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="p-2 bg-blue-50 rounded-lg text-[#0a0c65]">
                                        <Eye size={20} />
                                    </div>
                                    <h3 className="text-2xl font-bold m-0 text-[#0a0c65]">1. Data We Collect</h3>
                                </div>
                                <p>
                                    In order to provide our logistics brokerage services, we collect various types of information from our users:
                                </p>
                                <ul className="list-disc pl-6 space-y-2">
                                    <li><strong>Personal Information:</strong> Name, email address, phone number, and physical addresses provided during registration or booking.</li>
                                    <li><strong>Vehicle Information:</strong> For drivers, we collect vehicle types, license plates, and categories.</li>
                                    <li><strong>Location Data:</strong> We may collect real-time location data from drivers during active shipments to provide tracking updates to cargo owners.</li>
                                    <li><strong>Shipment Details:</strong> Information about the cargo, weight, dimensions, and special instructions.</li>
                                </ul>
                            </section>

                            <section className="mb-10">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="p-2 bg-blue-50 rounded-lg text-[#0a0c65]">
                                        <Lock size={20} />
                                    </div>
                                    <h3 className="text-2xl font-bold m-0 text-[#0a0c65]">2. How We Use Your Data</h3>
                                </div>
                                <p>We use the collected information for the following purposes:</p>
                                <ul className="list-disc pl-6 space-y-2">
                                    <li><strong>Facilitating Logistics:</strong> To connect cargo owners with vetted transporters in Zambia.</li>
                                    <li><strong>Real-time Tracking:</strong> Providing status updates and location tracking for active shipments.</li>
                                    <li><strong>Billing & Payments:</strong> Processing invoices and driver payments.</li>
                                    <li><strong>Service Improvement:</strong> Analyzing platform usage to improve our system's efficiency.</li>
                                    <li><strong>Support:</strong> Responding to inquiries and resolving logistics issues.</li>
                                </ul>
                            </section>

                            <section className="mb-10">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="p-2 bg-blue-50 rounded-lg text-[#0a0c65]">
                                        <FileText size={20} />
                                    </div>
                                    <h3 className="text-2xl font-bold m-0 text-[#0a0c65]">3. Data Sharing</h3>
                                </div>
                                <p>
                                    ProLink is a brokerage platform. Your data is shared only when necessary to perform the requested services:
                                </p>
                                <p>
                                    Cargo owner contact details are shared with assigned drivers to facilitate pick-up and delivery.
                                    Driver details (name, vehicle, location) are shared with cargo owners to provide transparency during transit.
                                    We do not sell your personal data to third parties for marketing purposes.
                                </p>
                            </section>

                            <section className="mb-10">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="p-2 bg-blue-50 rounded-lg text-[#0a0c65]">
                                        <Shield size={20} />
                                    </div>
                                    <h3 className="text-2xl font-bold m-0 text-[#0a0c65]">4. Security Information</h3>
                                </div>
                                <p>
                                    We implement industry-standard security measures to protect your information from unauthorized access, alteration, or destruction.
                                    However, no method of transmission over the Internet is 100% secure, and we cannot guarantee absolute security.
                                </p>
                            </section>

                            <section>
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="p-2 bg-blue-50 rounded-lg text-[#0a0c65]">
                                        <Mail size={20} />
                                    </div>
                                    <h3 className="text-2xl font-bold m-0 text-[#0a0c65]">5. Contact Us</h3>
                                </div>
                                <p>
                                    If you have any questions about this Privacy Policy or our data practices, please contact our team at:
                                </p>
                                <div className="bg-slate-50 p-6 rounded-xl border border-slate-100 flex flex-col md:flex-row gap-6 md:gap-12 mt-4">
                                    <div>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Email</p>
                                        <p className="font-bold text-[#ba0b0b]">info@prolinkafrica.com</p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Office</p>
                                        <p className="text-sm font-medium">17 Nangwenya Road, Lusaka, Zambia</p>
                                    </div>
                                </div>
                            </section>
                        </CardContent>
                    </Card>
                </div>
            </main>

            <Footer />
        </div>
    );
};
