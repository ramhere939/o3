import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Bell,
  ChevronDown,
  User,
  Settings,
  LogOut,
  HelpCircle,
  RefreshCw,
  Moon,
  Sun,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useApp } from "@/context/AppContext";

interface NavbarProps {
  onMobileMenuToggle?: () => void;
}

export function Navbar({ onMobileMenuToggle }: NavbarProps) {
  const { user, setRole, notifications } = useApp();
  const [searchQuery, setSearchQuery] = useState("");
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const navigate = useNavigate();
  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/buyer/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  const switchRole = () => {
    const newRole = user.role === "buyer" ? "supplier" : "buyer";
    setRole(newRole);
    navigate(newRole === "buyer" ? "/buyer/dashboard" : "/supplier/dashboard");
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setShowNotifications(false);
      }
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setShowProfile(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center px-4 gap-4 flex-shrink-0 z-20">
      {/* Search */}
      <form onSubmit={handleSearch} className="flex-1 max-w-md">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search chemicals, suppliers, RFQs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all placeholder:text-slate-400"
          />
        </div>
      </form>

      <div className="flex items-center gap-2 ml-auto">
        {/* Dark mode toggle */}
        <button
          onClick={() => setDarkMode(!darkMode)}
          className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 transition-colors"
        >
          {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>

        {/* Role switcher */}
        <button
          onClick={switchRole}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors"
          title={`Switch to ${user.role === "buyer" ? "Supplier" : "Buyer"} view`}
        >
          <RefreshCw className="w-3 h-3" />
          Switch to {user.role === "buyer" ? "Supplier" : "Buyer"}
        </button>

        {/* Notifications */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative w-9 h-9 flex items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 transition-colors"
            id="notification-bell"
          >
            <Bell className="w-4.5 h-4.5" />
            {notifications > 0 && (
              <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-rose-500 text-white text-[9px] font-bold flex items-center justify-center rounded-full leading-none">
                {notifications}
              </span>
            )}
          </button>

          <AnimatePresence>
            {showNotifications && (
              <NotificationDropdown onClose={() => setShowNotifications(false)} />
            )}
          </AnimatePresence>
        </div>

        {/* Profile */}
        <div className="relative" ref={profileRef}>
          <button
            onClick={() => setShowProfile(!showProfile)}
            className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-slate-50 transition-colors"
            id="user-profile-btn"
          >
            <div className="w-7 h-7 rounded-lg bg-indigo-100 flex items-center justify-center text-indigo-700 text-xs font-semibold">
              {user.name.charAt(0)}
            </div>
            <div className="hidden md:block text-left">
              <p className="text-xs font-medium text-slate-800 leading-tight">
                {user.name}
              </p>
              <p className="text-[10px] text-slate-500 capitalize">{user.role}</p>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          <AnimatePresence>
            {showProfile && (
              <ProfileDropdown user={user} onClose={() => setShowProfile(false)} navigate={navigate} />
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
}

// ─── Notification Dropdown ────────────────────────────────────────────────────

const recentNotifs = [
  { id: 1, title: "New Quote Received", message: "Aditya Chemicals quoted ₹182/kg for TiO2", time: "5m ago", unread: true, color: "bg-indigo-500" },
  { id: 2, title: "Shipment Dispatched", message: "PO-2024-0005 dispatched from Ahmedabad", time: "1h ago", unread: true, color: "bg-emerald-500" },
  { id: 3, title: "Price Alert", message: "TiO2 prices dropped 4.2% in Gujarat region", time: "3h ago", unread: true, color: "bg-amber-500" },
  { id: 4, title: "Quote Expiring", message: "QT-2024-0004 expires in 2 days", time: "6h ago", unread: false, color: "bg-rose-500" },
  { id: 5, title: "Order Delivered", message: "PO-2024-0001 delivered to Mumbai", time: "1d ago", unread: false, color: "bg-slate-400" },
];

function NotificationDropdown({ onClose }: { onClose: () => void }) {
  const navigate = useNavigate();
  return (
    <motion.div
      initial={{ opacity: 0, y: 8, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 8, scale: 0.95 }}
      transition={{ duration: 0.15 }}
      className="absolute right-0 top-full mt-2 w-80 bg-white rounded-xl border border-slate-200 shadow-xl z-50"
    >
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
        <span className="text-sm font-semibold text-slate-900">Notifications</span>
        <span className="text-xs bg-rose-100 text-rose-600 px-1.5 py-0.5 rounded-full font-medium">
          3 new
        </span>
      </div>
      <div className="divide-y divide-slate-50">
        {recentNotifs.map((n) => (
          <button
            key={n.id}
            className={cn(
              "w-full text-left px-4 py-3 hover:bg-slate-50 transition-colors",
              n.unread && "bg-indigo-50/40"
            )}
          >
            <div className="flex items-start gap-3">
              <div className={cn("w-2 h-2 rounded-full mt-1.5 flex-shrink-0", n.color)} />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-slate-800">{n.title}</p>
                <p className="text-xs text-slate-500 mt-0.5 truncate">{n.message}</p>
              </div>
              <span className="text-[10px] text-slate-400 flex-shrink-0">{n.time}</span>
            </div>
          </button>
        ))}
      </div>
      <div className="px-4 py-3 border-t border-slate-100">
        <button
          onClick={() => { navigate("/notifications"); onClose(); }}
          className="w-full text-center text-xs text-indigo-600 font-medium hover:text-indigo-700"
        >
          View all notifications
        </button>
      </div>
    </motion.div>
  );
}

// ─── Profile Dropdown ─────────────────────────────────────────────────────────

function ProfileDropdown({ user, onClose, navigate }: { user: any; onClose: () => void; navigate: any }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 8, scale: 0.95 }}
      transition={{ duration: 0.15 }}
      className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl border border-slate-200 shadow-xl z-50"
    >
      <div className="px-4 py-3 border-b border-slate-100">
        <p className="text-sm font-semibold text-slate-900">{user.name}</p>
        <p className="text-xs text-slate-500">{user.email}</p>
        <p className="text-xs text-slate-500">{user.companyName}</p>
        <span className={cn(
          "inline-flex items-center mt-1.5 px-2 py-0.5 rounded-full text-[10px] font-medium",
          user.kycStatus === "approved" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"
        )}>
          KYC {user.kycStatus === "approved" ? "Verified ✓" : "Pending"}
        </span>
      </div>
      <div className="py-1">
        {[
          { label: "My Profile", icon: User },
          { label: "Settings", icon: Settings },
          { label: "Help & Support", icon: HelpCircle },
        ].map((item) => (
          <button
            key={item.label}
            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-600 hover:bg-slate-50 transition-colors"
          >
            <item.icon className="w-4 h-4 text-slate-400" />
            {item.label}
          </button>
        ))}
      </div>
      <div className="py-1 border-t border-slate-100">
        <button
          onClick={() => { navigate("/"); onClose(); }}
          className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-rose-600 hover:bg-rose-50 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          Sign Out
        </button>
      </div>
    </motion.div>
  );
}
