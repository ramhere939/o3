import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { getOrders } from "@/lib/mock-api";
import { formatCurrency, formatDate } from "@/lib/utils";
import { StatusChip } from "@/components/shared/StatusChip";
import { PageHeader, SectionCard, EmptyState } from "@/components/shared/UIHelpers";
import { Truck, CheckCircle, Package } from "lucide-react";
import { useState } from "react";

export default function SupplierFulfillment() {
  const [filter, setFilter] = useState("");
  const { data: orders, isLoading } = useQuery({
    queryKey: ["orders"],
    queryFn: () => getOrders(),
  });

  const supplierOrders = orders?.filter((o) => o.supplierId === "s1") || [];
  const filtered = filter ? supplierOrders.filter((o) => o.status === filter) : supplierOrders;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Fulfillment"
        subtitle="Manage order dispatch and delivery confirmation"
        breadcrumb={["Supplier Portal", "Fulfillment"]}
      />

      {/* Status filter */}
      <div className="flex gap-2 flex-wrap">
        {["", "confirmed", "invoice_generated", "dispatched", "in_transit", "delivered"].map((s) => (
          <button key={s} onClick={() => setFilter(s)}
            className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all ${
              filter === s ? "bg-indigo-600 text-white" : "bg-white border border-slate-200 text-slate-600 hover:border-slate-300"
            }`}>
            {s === "" ? "All" : s.split("_").map((w) => w[0].toUpperCase() + w.slice(1)).join(" ")}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => <div key={i} className="skeleton h-28 rounded-xl" />)}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState icon={<Truck className="w-8 h-8" />} title="No orders found" description="Orders will appear here once buyers accept your quotes" />
      ) : (
        <div className="space-y-4">
          {filtered.map((order, i) => {
            const completedSteps = order.shipmentEvents.filter((e) => e.completed).length;
            const totalSteps = order.shipmentEvents.length;
            const progress = (completedSteps / totalSteps) * 100;

            return (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }}
                className="bg-white rounded-xl border border-slate-200 p-5"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-bold text-slate-900">{order.poNumber}</h3>
                      <StatusChip status={order.status} />
                    </div>
                    <p className="text-sm text-slate-600 mt-0.5">{order.productName}</p>
                    <p className="text-xs text-slate-400">Buyer: {order.buyerName} · {order.quantity.toLocaleString()} {order.quantityUnit}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-base font-bold text-slate-900">{formatCurrency(order.totalAmount)}</p>
                    <p className="text-xs text-slate-400">Expected: {formatDate(order.expectedDelivery)}</p>
                    <div className={`text-xs font-medium mt-1 ${
                      order.paymentStatus === "paid" ? "text-emerald-600" :
                      order.paymentStatus === "overdue" ? "text-rose-600" : "text-amber-600"
                    }`}>
                      Payment: {order.paymentStatus}
                    </div>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="mb-4">
                  <div className="flex justify-between items-center mb-1.5">
                    <p className="text-xs font-medium text-slate-600">Fulfillment Progress</p>
                    <p className="text-xs text-slate-500">{completedSteps}/{totalSteps} stages</p>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${progress}%` }}
                      transition={{ duration: 0.8, ease: "easeOut" }}
                      className={`h-full rounded-full ${progress === 100 ? "bg-emerald-500" : "bg-indigo-500"}`}
                    />
                  </div>
                </div>

                {/* Step chips */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {order.shipmentEvents.map((event) => (
                    <div
                      key={event.status}
                      className={`flex items-center gap-1 text-[10px] font-medium px-2.5 py-1 rounded-full ${
                        event.completed
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-slate-100 text-slate-400"
                      }`}
                    >
                      {event.completed ? <CheckCircle className="w-3 h-3" /> : <Package className="w-3 h-3" />}
                      {event.label}
                    </div>
                  ))}
                </div>

                {/* Actions */}
                {order.status !== "delivered" && (
                  <div className="flex gap-2">
                    {order.status === "confirmed" && (
                      <button className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-medium py-2 rounded-lg transition-colors">
                        Generate Invoice
                      </button>
                    )}
                    {order.status === "invoice_generated" && (
                      <button className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-medium py-2 rounded-lg transition-colors">
                        Mark as Dispatched
                      </button>
                    )}
                    {order.status === "dispatched" && (
                      <button className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-medium py-2 rounded-lg transition-colors">
                        Update Tracking
                      </button>
                    )}
                    {order.status === "in_transit" && (
                      <button className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium py-2 rounded-lg transition-colors">
                        Confirm Delivery
                      </button>
                    )}
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
