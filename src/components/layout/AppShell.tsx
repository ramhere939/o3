import { useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Sidebar } from "./Sidebar";
import { Navbar } from "./Navbar";
import { AIAssistant } from "../shared/AIAssistant";
import { GlobalChatWidget } from "../shared/GlobalChatWidget";

export function AppShell() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const location = useLocation();
  const hideSidebar = location.pathname === "/buyer/catalog" || location.pathname === "/buyer/messages" || location.pathname.startsWith("/buyer/product/");

  return (
    <div className="flex flex-col h-screen bg-slate-50 overflow-hidden">
      <Navbar />

      <div className="flex flex-1 min-h-0 overflow-hidden relative">
        {/* Sidebar */}
        {!hideSidebar && (
          <Sidebar
            collapsed={sidebarCollapsed}
            onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
          />
        )}

        {/* Main area */}
        <div className="flex flex-col flex-1 min-w-0 overflow-hidden relative">

        <main className="flex-1 overflow-y-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="p-6 min-h-full"
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </main>
        <AIAssistant />
        <GlobalChatWidget />
      </div>
    </div>
  </div>
  );
}
