import { Outlet, Navigate } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { useStore } from '../../store/useStore';
import { useState } from 'react';
import { Menu } from 'lucide-react';
import prolinkLogo from '../../assets/prolink logo.png';

export const DashboardLayout = () => {
    const { currentUser, isAuthChecking } = useStore();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    // Show loading state while checking authentication
    if (isAuthChecking) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-[#ba0b0b] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-muted-foreground">Loading...</p>
                </div>
            </div>
        );
    }

    if (!currentUser) {
        return <Navigate to="/login" replace />;
    }

    return (
        <div className="min-h-screen bg-background">
            {/* Mobile Header */}
            <div className="lg:hidden flex items-center justify-between p-4 bg-[#ba0b0b] text-white sticky top-0 z-30 shadow-md">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white p-1 rounded-lg shadow-inner">
                        <img src={prolinkLogo} alt="ProLink Logo" className="w-full h-full object-contain" />
                    </div>
                    <span className="font-bold text-xl uppercase tracking-tighter">ProLink</span>
                </div>
                <button
                    onClick={() => setIsSidebarOpen(true)}
                    className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                >
                    <Menu size={24} />
                </button>
            </div>

            <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

            <main className="lg:pl-64 min-h-screen transition-all duration-300">
                <div className="p-4 sm:p-8 max-w-7xl mx-auto">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};
