import { LayoutDashboard, Truck, Package, UserCircle, LogOut, PlusCircle, CreditCard, X, UserCheck, MessageCircle, Users } from 'lucide-react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useStore } from '../../store/useStore';
import { Badge } from '../ui/badge';
import clsx from 'clsx';
import prolinkLogo from '../../assets/prolink logo.png';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar = ({ isOpen, onClose }: SidebarProps) => {
  const { currentUser, logout } = useStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!currentUser) return null;

  const links = {
    broker: [
      { icon: LayoutDashboard, label: 'Dashboard', to: '/broker' },
      { icon: Package, label: 'Cargo Management', to: '/broker/cargo' },
      { icon: Truck, label: 'Transporters', to: '/broker/drivers' },
      { icon: CreditCard, label: 'Billing & Payments', to: '/broker/billing' },
      { icon: UserCheck, label: 'User Approvals', to: '/broker/approvals' },
      { icon: MessageCircle, label: 'Messages', to: '/broker/messages' },
      { icon: UserCircle, label: 'My Profile', to: '/broker/profile' },
    ],
    owner: [
      { icon: Package, label: 'My Shipments', to: '/owner/shipments' },
      { icon: PlusCircle, label: 'Book Shipment', to: '/owner/book' },
      { icon: MessageCircle, label: 'Messages', to: '/owner/messages' },
      { icon: UserCircle, label: 'My Profile', to: '/owner/profile' },
    ],
    driver: [
      { icon: Truck, label: 'My Jobs', to: '/driver/jobs' },
      { icon: UserCircle, label: 'My Profile', to: '/driver/profile' },
      { icon: MessageCircle, label: 'Messages', to: '/driver/messages' },
    ],
    admin: [
      { icon: LayoutDashboard, label: 'Dashboard', to: '/admin' },
      { icon: Users, label: 'User Management', to: '/admin/users' },
      { icon: Package, label: 'Cargo Management', to: '/admin/cargo' },
      { icon: Truck, label: 'Transporters', to: '/admin/drivers' },
      { icon: CreditCard, label: 'Billing & Payments', to: '/admin/billing' },
      { icon: UserCheck, label: 'User Approvals', to: '/admin/approvals' },
      { icon: MessageCircle, label: 'Messages', to: '/admin/messages' },
      { icon: UserCircle, label: 'My Profile', to: '/admin/profile' },
    ]
  };

  const roleLinks = links[currentUser.role] || [];
  const conversations = useStore(state => state.getConversations(currentUser.id));
  const totalUnread = conversations.reduce((sum, conv) => sum + conv.unreadCount, 0);
  const messagesPath = `/${currentUser.role}/messages`;

  return (
    <>
      {/* Backdrop for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm"
          onClick={onClose}
        />
      )}

      <div className={clsx(
        "h-screen w-64 bg-[#ba0b0b] text-destructive-foreground flex flex-col fixed left-0 top-0 z-50 transition-transform duration-300 transform lg:translate-x-0 shadow-2xl lg:shadow-none",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="p-6 border-b border-destructive-foreground/20 relative">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-white p-1.5 rounded-xl shadow-lg">
              <img src={prolinkLogo} alt="ProLink Logo" className="w-full h-full object-contain" />
            </div>
            <h1 className="text-2xl font-bold text-white uppercase tracking-tighter">
              ProLink
            </h1>
          </div>
          <p className="text-sm text-destructive-foreground/80 lowercase">Logistics Management</p>

          {/* Close button for mobile */}
          <button
            onClick={onClose}
            className="lg:hidden absolute top-6 right-4 text-white hover:bg-white/10 p-1 rounded-md transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {roleLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.to === '/broker' || link.to === '/admin'}
              onClick={() => {
                if (window.innerWidth < 1024) onClose();
              }}
              className={({ isActive }) =>
                clsx(
                  'flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200',
                  isActive
                    ? 'bg-secondary text-secondary-foreground shadow-lg'
                    : 'text-destructive-foreground/80 hover:bg-white/20 hover:text-white hover:translate-x-1'
                )
              }
            >
              <link.icon size={20} />
              <div className="flex-1 flex items-center justify-between">
                <span className="font-medium">{link.label}</span>
                {link.to === messagesPath && totalUnread > 0 && (
                  <Badge className="bg-white text-[#ba0b0b] hover:bg-white border-none h-5 min-w-[20px] px-1.5 flex items-center justify-center font-bold">
                    {totalUnread}
                  </Badge>
                )}
              </div>
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-destructive-foreground/20">
          <div className="flex items-center gap-3 px-4 py-3 mb-2">
            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-sm font-bold text-white overflow-hidden">
              {currentUser.avatar ? (
                <img src={currentUser.avatar} alt={currentUser.name} className="w-full h-full object-cover" />
              ) : (
                currentUser.name.charAt(0)
              )}
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="text-sm font-medium truncate text-white">{currentUser.name}</p>
              <p className="text-xs text-destructive-foreground/80 capitalize">{currentUser.role}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-2 text-destructive-foreground/80 hover:bg-white/20 hover:text-white hover:translate-x-1 rounded-lg transition-all text-sm"
          >
            <LogOut size={18} />
            Sign Out
          </button>
        </div>
      </div >
    </>
  );
};
