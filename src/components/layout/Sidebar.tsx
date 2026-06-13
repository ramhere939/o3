import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  Search,
  Package,
  FileText,
  GitPullRequest,
  Scale,
  MessageSquare,
  ShoppingCart,
  Truck,
  FolderOpen,
  Bell,
  Boxes,
  Inbox,
  Quote,
  BarChart2,
  DollarSign,
  Sparkles,
  BookOpen,
  Star,
  ChevronLeft,
  ChevronRight,
  Zap,
  FlaskConical,
  ClipboardList,
  Clock,
  Store,
  Users,
  Megaphone,
  HelpCircle,
  Code,
  Settings
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useApp } from "@/context/AppContext";
import { useState } from "react";

const buyerNav = [
  { label: "Dashboard", icon: LayoutDashboard, to: "/buyer/dashboard" },
  { label: "Create RFQ", icon: FileText, to: "/buyer/rfq/create" },
  { label: "RFQ Tracker", icon: GitPullRequest, to: "/buyer/rfq/tracker" },
  { label: "Compare Quotes", icon: Scale, to: "/buyer/quotes/compare" },
  { label: "Shipment Tracking", icon: Truck, to: "/buyer/shipments" },
  { label: "Documents Vault", icon: FolderOpen, to: "/buyer/documents" },
];

const supplierNav = [
  { label: "Home", icon: LayoutDashboard, to: "/supplier/dashboard" },
  { label: "Products", icon: Package, to: "/supplier/inventory" },
  { label: "RFQ Inbox", icon: MessageSquare, to: "/supplier/rfq-inbox" },
  { label: "Analytics", icon: BarChart2, to: "/supplier/earnings" },
  { label: "Orders", icon: ClipboardList, to: "/supplier/fulfillment" },
];

const globalNav = [
  { label: "Price Intelligence", icon: BarChart2, to: "/price-intelligence" },
  { label: "SDS Assistant", icon: FlaskConical, to: "/sds-assistant" },
  { label: "Notifications", icon: Bell, to: "/notifications" },
];

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const { user } = useApp();
  const location = useLocation();
  const isSupplier = user.role === "supplier";
  const primaryNav = isSupplier ? supplierNav : buyerNav;

  const isActive = (to: string) =>
    location.pathname === to ||
    (to !== "/" && location.pathname.startsWith(to)) ||
    (location.pathname + location.search) === to;

  return (
    <motion.aside
      animate={{ width: collapsed ? 72 : 240 }}
      transition={{ duration: 0.2, ease: "easeInOut" }}
      className={cn(
        "h-full border-r flex flex-col flex-shrink-0 overflow-hidden z-30 bg-white border-slate-200"
      )}
    >


      {/* Nav sections */}
      <div className="flex-1 overflow-y-auto py-4 space-y-6 px-2 scrollbar-hide">
        {/* Role nav */}
        <NavSection
          label={isSupplier ? "Supplier Portal" : "Buyer Portal"}
          items={primaryNav}
          collapsed={collapsed}
          isActive={isActive}
          isSupplier={isSupplier}
        />

        {/* Global nav */}
        <NavSection
          label="Platform"
          items={globalNav}
          collapsed={collapsed}
          isActive={isActive}
          isSupplier={isSupplier}
        />
      </div>

      {/* Collapse toggle */}
      <button
        onClick={onToggle}
        className={cn(
          "h-12 flex items-center justify-center border-t transition-colors",
          "border-slate-100 text-slate-400 hover:text-slate-700 hover:bg-slate-50"
        )}
        aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
      >
        {collapsed ? (
          <ChevronRight className="w-4 h-4" />
        ) : (
          <ChevronLeft className="w-4 h-4" />
        )}
      </button>
    </motion.aside>
  );
}

interface NavSectionProps {
  label: string;
  items: { label: string; icon: React.ElementType; to: string }[];
  collapsed: boolean;
  isActive: (to: string) => boolean;
  isSupplier: boolean;
}

function NavSection({ label, items, collapsed, isActive, isSupplier }: NavSectionProps) {
  return (
    <div>
      <AnimatePresence>
        {!collapsed && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={cn("text-[10px] font-semibold uppercase tracking-widest px-3 mb-2 text-slate-400")}
          >
            {label}
          </motion.p>
        )}
      </AnimatePresence>
      <ul className="space-y-0.5">
        {items.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.to);

          let navItemClasses = active ? "nav-item-active" : "nav-item-inactive";

          return (
            <li key={item.to}>
              <Link
                to={item.to}
                title={collapsed ? item.label : undefined}
                className={cn(
                  "nav-item w-full relative",
                  navItemClasses,
                  collapsed && "justify-center px-0"
                )}
              >
                <Icon
                  className={cn(
                    "flex-shrink-0 z-10",
                    active ? "w-4 h-4 text-indigo-600" : "w-4 h-4"
                  )}
                />
                <AnimatePresence>
                  {!collapsed && (
                    <motion.span
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -8 }}
                      transition={{ duration: 0.15 }}
                      className="truncate z-10"
                    >
                      {item.label}
                    </motion.span>
                  )}
                </AnimatePresence>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
