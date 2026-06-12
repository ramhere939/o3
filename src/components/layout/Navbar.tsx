import { useState, useRef, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
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
  ShoppingCart,
  Globe,
  MessageSquare,
  ClipboardList,
  MapPin,
  Zap
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
  const [cartCount, setCartCount] = useState(0);
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
    const updateCartCount = () => {
      const saved = localStorage.getItem("o3_buyer_cart");
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          setCartCount(Array.isArray(parsed) ? parsed.length : 0);
        } catch {
          setCartCount(0);
        }
      } else {
        setCartCount(0);
      }
    };
    
    updateCartCount();
    window.addEventListener("storage", updateCartCount);
    window.addEventListener("cartUpdated", updateCartCount);

    const handleClickOutside = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setShowNotifications(false);
      }
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setShowProfile(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("storage", updateCartCount);
      window.removeEventListener("cartUpdated", updateCartCount);
    };
  }, []);

  if (user.role === "buyer") {
    return (
      <header className="h-16 bg-white border-b border-slate-200 flex items-center px-6 gap-6 flex-shrink-0 z-20 sticky top-0">
        <Link to="/buyer/catalog" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-indigo-600 rounded flex items-center justify-center">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold text-indigo-600 tracking-tight">O3.com</span>
        </Link>
        
        <div className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-700">
          <Link to="/buyer/catalog" className="hover:text-indigo-600">All categories</Link>
        </div>

        <div className="flex items-center gap-5 ml-auto text-xs font-medium text-slate-600">
          <Link to="/buyer/messages" className="flex flex-col items-center gap-1 hover:text-indigo-600">
            <MessageSquare className="w-5 h-5" />
            <span className="text-[10px]">Messages</span>
          </Link>
          
          <Link to="/buyer/dashboard?tab=orders" className="flex flex-col items-center gap-1 hover:text-indigo-600">
            <ClipboardList className="w-5 h-5" />
            <span className="text-[10px]">Orders</span>
          </Link>
          
          <Link to="/buyer/cart" className="flex flex-col items-center gap-1 hover:text-indigo-600 cursor-pointer">
            <div className="relative">
              <ShoppingCart className="w-5 h-5" />
              {cartCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 w-3.5 h-3.5 bg-indigo-600 text-white text-[8px] font-bold flex items-center justify-center rounded-full leading-none">
                  {cartCount}
                </span>
              )}
            </div>
            <span className="text-[10px]">Cart</span>
          </Link>

          <div className="relative" ref={profileRef}>
            <button
              onClick={() => setShowProfile(!showProfile)}
              className="flex flex-col items-center gap-1 hover:text-indigo-600"
            >
              <User className="w-5 h-5" />
              <span className="text-[10px] flex items-center">
                Profile <ChevronDown className="w-3 h-3 ml-0.5" />
              </span>
            </button>
            <AnimatePresence>
              {showProfile && (
                <ProfileDropdown user={user} onClose={() => setShowProfile(false)} navigate={navigate} />
              )}
            </AnimatePresence>
          </div>

          <button
            onClick={switchRole}
            className="flex items-center gap-1 px-2 py-1 bg-slate-100 rounded text-slate-500 hover:bg-slate-200 ml-2"
            title="Switch to Supplier view"
          >
            <RefreshCw className="w-3 h-3" />
          </button>
        </div>
      </header>
    );
  }

  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center px-6 gap-6 flex-shrink-0 z-20 sticky top-0">
      {/* Left Section */}
      <div className="flex items-center gap-4">
        <Link to="/supplier/dashboard" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-indigo-600 rounded flex items-center justify-center">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold text-indigo-600 tracking-tight">O3.com</span>
        </Link>
        <span className="text-lg font-medium text-slate-700 ml-2">Supplier Portal</span>
        <button
          onClick={switchRole}
          className="ml-2 px-3 py-1 text-[11px] font-medium border border-slate-300 rounded-full text-slate-600 hover:bg-slate-50 transition-colors whitespace-nowrap"
          title="Switch to Buyer view"
        >
          Switch to Buyer
        </button>
      </div>

      {/* Middle Section: Search */}
      <form onSubmit={handleSearch} className="flex-1 max-w-xl ml-4 lg:ml-8 hidden sm:block">
        <div className="flex w-full">
          <input
            type="text"
            placeholder="Search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 px-4 py-2 text-sm bg-white border-2 border-[#165DFF] rounded-l-full focus:outline-none placeholder:text-slate-400"
          />
          <button type="submit" className="px-6 bg-[#165DFF] text-white rounded-r-full hover:bg-blue-700 transition-colors flex items-center justify-center">
            <Search className="w-4 h-4" />
          </button>
        </div>
      </form>

      {/* Right Section */}
      <div className="flex items-center gap-3 lg:gap-5 ml-auto text-xs font-medium text-slate-600 flex-shrink-0">
        {/* Profile */}
        <div className="relative" ref={profileRef}>
          <button
            onClick={() => setShowProfile(!showProfile)}
            className="flex items-center gap-2 hover:text-indigo-600"
          >
            <div className="relative">
              <img src={`https://ui-avatars.com/api/?name=${user.name}&background=165DFF&color=fff`} alt="User" className="w-7 h-7 rounded-full" />
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-rose-500 border border-white text-white text-[8px] font-bold flex items-center justify-center rounded-full">99+</span>
            </div>
            <span className="flex items-center">
              My Account <ChevronDown className="w-3 h-3 ml-1" />
            </span>
          </button>
          <AnimatePresence>
            {showProfile && (
              <ProfileDropdown user={user} onClose={() => setShowProfile(false)} navigate={navigate} />
            )}
          </AnimatePresence>
        </div>

        {/* Messages / Inquiries */}
        <button 
          onClick={() => window.dispatchEvent(new CustomEvent("openChat"))}
          className="flex items-center gap-1 hover:text-indigo-600 relative"
        >
          <MessageSquare className="w-4 h-4" />
          <span className="hidden sm:inline">{user.role === "supplier" ? "Inquiries" : "Messages"}</span>
        </button>

        {/* Help */}
        <button className="flex items-center hover:text-indigo-600">
          Help <ChevronDown className="w-3 h-3 ml-1" />
        </button>

        {/* Notifications */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="flex items-center gap-1 hover:text-indigo-600"
          >
            <Bell className="w-4 h-4" />
            <span className="hidden sm:inline">Notifications</span>
          </button>

          <AnimatePresence>
            {showNotifications && (
              <NotificationDropdown onClose={() => setShowNotifications(false)} />
            )}
          </AnimatePresence>
        </div>

        {/* Language */}
        <button className="hidden md:flex items-center hover:text-indigo-600 border border-slate-200 px-3 py-1.5 rounded-full bg-slate-50">
          English <ChevronDown className="w-3 h-3 ml-1" />
        </button>
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
  const links = user.role === "buyer" ? [
    { label: "My Profile", path: "/buyer/dashboard" },
    { label: "Orders", path: "/buyer/dashboard?tab=orders" },
    { label: "Messages", path: "/buyer/messages" },
    { label: "RFQs", path: "/buyer/rfq/create" },
    { label: "Favorites", path: "/buyer/favorites" },
    { label: "Account", path: "/buyer/account" },
  ] : [
    { label: "Messages", path: "/buyer/messages" },
    { label: "Account", path: "/buyer/account" },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 8, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 8, scale: 0.95 }}
      transition={{ duration: 0.15 }}
      className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl border border-slate-200 shadow-xl z-50 overflow-hidden"
    >
      <div className="px-4 py-3 border-b border-slate-100">
        <p className="text-sm font-bold text-slate-900">Hi, {user.name.split(" ")[0]}</p>
      </div>
      <div className="py-1">
        {links.map((item) => (
          <button
            key={item.label}
            onClick={() => {
              if (item.path !== "#") navigate(item.path);
              onClose();
            }}
            className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
          >
            {item.label}
          </button>
        ))}
      </div>
      <div className="py-1 border-t border-slate-100">
        <button
          onClick={() => { navigate("/"); onClose(); }}
          className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
        >
          Sign out
        </button>
      </div>
    </motion.div>
  );
}
