import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Bell, CheckCircle, ShoppingCart, Package, Tag, FileText, Shield } from "lucide-react";
import { getNotifications } from "@/lib/mock-api";
import { formatRelativeTime } from "@/lib/utils";
import { PageHeader, SectionCard, EmptyState } from "@/components/shared/UIHelpers";
import { useState } from "react";

const CATEGORY_ICONS: Record<string, React.ElementType> = {
  rfq: FileText, quote: Tag, order: ShoppingCart, shipment: Package, kyc: Shield, price_alert: Bell,
};
const CATEGORY_COLORS: Record<string, string> = {
  rfq: "bg-indigo-100 text-indigo-600",
  quote: "bg-violet-100 text-violet-600",
  order: "bg-emerald-100 text-emerald-600",
  shipment: "bg-blue-100 text-blue-600",
  kyc: "bg-amber-100 text-amber-600",
  price_alert: "bg-rose-100 text-rose-600",
};

export default function NotificationsPage() {
  const [filter, setFilter] = useState("");
  const { data: notifications, isLoading } = useQuery({
    queryKey: ["notifications", filter],
    queryFn: () => getNotifications({ category: filter || undefined }),
  });

  const unreadCount = notifications?.filter((n) => !n.read).length || 0;

  return (
    <div className="space-y-6 max-w-3xl">
      <PageHeader
        title="Notifications"
        subtitle={`${unreadCount} unread notifications`}
        breadcrumb={["Platform", "Notifications"]}
        action={
          <button className="text-sm text-indigo-600 font-medium hover:text-indigo-700">
            Mark all as read
          </button>
        }
      />

      {/* Category filters */}
      <div className="flex gap-2 flex-wrap">
        {["", "rfq", "quote", "order", "shipment", "kyc", "price_alert"].map((cat) => (
          <button
            key={cat}
            onClick={() => setFilter(cat)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all capitalize ${
              filter === cat ? "bg-indigo-600 text-white" : "bg-white border border-slate-200 text-slate-600 hover:border-slate-300"
            }`}
          >
            {cat === "" ? "All" : cat.replace("_", " ")}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => <div key={i} className="skeleton h-20 rounded-xl" />)}
        </div>
      ) : notifications?.length === 0 ? (
        <EmptyState icon={<Bell className="w-8 h-8" />} title="No notifications" description="You're all caught up!" />
      ) : (
        <div className="space-y-2">
          {notifications?.map((notif, i) => {
            const Icon = CATEGORY_ICONS[notif.category] || Bell;
            return (
              <motion.div
                key={notif.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.04 }}
                className={`flex items-start gap-4 p-4 rounded-xl border transition-all cursor-pointer hover:shadow-sm ${
                  !notif.read ? "bg-indigo-50/50 border-indigo-100" : "bg-white border-slate-200"
                }`}
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${CATEGORY_COLORS[notif.category] || "bg-slate-100 text-slate-500"}`}>
                  <Icon className="w-4.5 h-4.5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <p className={`text-sm font-semibold ${!notif.read ? "text-slate-900" : "text-slate-700"}`}>
                      {notif.title}
                    </p>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {!notif.read && <div className="w-2 h-2 bg-indigo-600 rounded-full" />}
                      <span className="text-xs text-slate-400">{formatRelativeTime(notif.timestamp)}</span>
                    </div>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{notif.message}</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
