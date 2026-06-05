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
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useApp } from "@/context/AppContext";
import { useState } from "react";

const buyerNav = [
  { label: "Dashboard", icon: LayoutDashboard, to: "/buyer/dashboard" },
  { label: "AI Search", icon: Sparkles, to: "/buyer/search" },
  { label: "Product Catalog", icon: Package, to: "/buyer/catalog" },
  { label: "Create RFQ", icon: FileText, to: "/buyer/rfq/create" },
  { label: "RFQ Tracker", icon: GitPullRequest, to: "/buyer/rfq/tracker" },
  { label: "Compare Quotes", icon: Scale, to: "/buyer/quotes/compare" },
  { label: "Negotiate", icon: MessageSquare, to: "/buyer/quotes/negotiate" },
  { label: "Purchase Orders", icon: ShoppingCart, to: "/buyer/orders" },
  { label: "Shipment Tracking", icon: Truck, to: "/buyer/shipments" },
  { label: "Documents Vault", icon: FolderOpen, to: "/buyer/documents" },
];

const supplierNav = [
  { label: "Dashboard", icon: LayoutDashboard, to: "/supplier/dashboard" },
  { label: "Inventory", icon: Boxes, to: "/supplier/inventory" },
  { label: "RFQ Inbox", icon: Inbox, to: "/supplier/rfq-inbox" },
  { label: "Quote Generator", icon: Quote, to: "/supplier/quotes" },
  { label: "Fulfillment", icon: Truck, to: "/supplier/fulfillment" },
  { label: "Earnings", icon: DollarSign, to: "/supplier/earnings" },
];

const globalNav = [
  { label: "AI Tools", icon: Sparkles, to: "/buyer/search" },
  { label: "Price Intelligence", icon: BarChart2, to: "/price-intelligence" },
  { label: "SDS Assistant", icon: FlaskConical, to: "/sds-assistant" },
  { label: "Content Hub", icon: BookOpen, to: "/content-hub" },
  { label: "Notifications", icon: Bell, to: "/notifications" },
];

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const { user } = useApp();
  const location = useLocation();
  const primaryNav = user.role === "buyer" ? buyerNav : supplierNav;

  const isActive = (to: string) =>
    location.pathname === to ||
    (to !== "/" && location.pathname.startsWith(to));

  return (
    <motion.aside
      animate={{ width: collapsed ? 72 : 240 }}
      transition={{ duration: 0.2, ease: "easeInOut" }}
      className="h-screen bg-white border-r border-slate-200 flex flex-col flex-shrink-0 overflow-hidden z-30"
    >
      {/* Logo */}
      <div className="h-16 flex items-center px-4 border-b border-slate-100 flex-shrink-0">
        <div className="flex items-center gap-2.5 overflow-hidden">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center flex-shrink-0">
            <Zap className="w-4 h-4 text-white" />
          </div>
          <AnimatePresence>
            {!collapsed && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.15 }}
              >
                <span className="text-lg font-bold text-slate-900">O3</span>
                <span className="text-xs text-slate-400 ml-1.5">Procurement</span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Nav sections */}
      <div className="flex-1 overflow-y-auto py-4 space-y-6 px-2">
        {/* Role nav */}
        <NavSection
          label={user.role === "buyer" ? "Buyer Portal" : "Supplier Portal"}
          items={primaryNav}
          collapsed={collapsed}
          isActive={isActive}
        />

        {/* Global nav */}
        <NavSection
          label="Platform"
          items={globalNav}
          collapsed={collapsed}
          isActive={isActive}
        />
      </div>

      {/* Collapse toggle */}
      <button
        onClick={onToggle}
        className="h-12 flex items-center justify-center border-t border-slate-100 text-slate-400 hover:text-slate-700 hover:bg-slate-50 transition-colors"
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
}

function NavSection({ label, items, collapsed, isActive }: NavSectionProps) {
  return (
    <div>
      <AnimatePresence>
        {!collapsed && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 px-3 mb-2"
          >
            {label}
          </motion.p>
        )}
      </AnimatePresence>
      <ul className="space-y-0.5">
        {items.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.to);
          return (
            <li key={item.to}>
              <Link
                to={item.to}
                title={collapsed ? item.label : undefined}
                className={cn(
                  "nav-item w-full",
                  active ? "nav-item-active" : "nav-item-inactive",
                  collapsed && "justify-center px-0"
                )}
              >
                <Icon
                  className={cn(
                    "flex-shrink-0",
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
                      className="truncate"
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
