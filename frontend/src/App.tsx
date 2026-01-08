import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { DashboardLayout } from './components/layout/DashboardLayout';
import { Login } from './pages/Login';
import { SignUp } from './pages/SignUp';
import { BrokerDashboard } from './pages/broker/Dashboard';
import { CargoList } from './pages/broker/CargoList';
import { DriversList } from './pages/broker/DriversList';
import { Billing } from './pages/broker/Billing';
import { DriverProfile } from './pages/broker/DriverProfile';
import { MyShipments } from './pages/owner/MyShipments';
import { BookShipment } from './pages/owner/BookShipment';
import { Tracking } from './pages/owner/Tracking';
import { Home } from './pages/Home';
import { PublicTracking } from './pages/PublicTracking';
import { JobBoard } from './pages/driver/JobBoard';
import { Profile } from './pages/driver/Profile';
import { Toaster } from '@/components/ui/toaster';
import { Toaster as Sonner } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { UserApproval } from './pages/broker/UserApproval';
import { PrivacyPolicy } from './pages/legal/PrivacyPolicy';
import { TermsOfService } from './pages/legal/TermsOfService';
import { MessagesPage } from './pages/Messages';

function App() {
  return (
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<SignUp />} />

      {/* Broker Routes */}
      <Route path="/broker" element={<DashboardLayout />}>
        <Route index element={<BrokerDashboard />} />
        <Route path="cargo" element={<CargoList />} />
        <Route path="drivers" element={<DriversList />} />
        <Route path="drivers/:driverId" element={<DriverProfile />} />
        <Route path="billing" element={<Billing />} />
        <Route path="approvals" element={<UserApproval />} />
        <Route path="messages" element={<MessagesPage />} />
      </Route>

      {/* Cargo Owner Routes */}
      <Route path="/owner" element={<DashboardLayout />}>
        <Route index element={<Navigate to="shipments" replace />} />
        <Route path="shipments" element={<MyShipments />} />
        <Route path="book" element={<BookShipment />} />
        <Route path="tracking/:id" element={<Tracking />} />
        <Route path="messages" element={<MessagesPage />} />
      </Route>

      {/* Driver Routes */}
      <Route path="/driver" element={<DashboardLayout />}>
        <Route index element={<Navigate to="jobs" replace />} />
        <Route path="jobs" element={<JobBoard />} />
        <Route path="profile" element={<Profile />} />
        <Route path="messages" element={<MessagesPage />} />
      </Route>

          <Route path="/track" element={<PublicTracking />} />
          <Route path="/privacy" element={<PrivacyPolicy />} />
          <Route path="/terms" element={<TermsOfService />} />
          <Route path="/" element={<Home />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  );
}

export default App;
