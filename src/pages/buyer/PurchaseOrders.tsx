import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ShoppingCart, Download, AlertCircle } from "lucide-react";
import { getOrders } from "@/lib/mock-api";
import { formatCurrency, formatDate } from "@/lib/utils";
import { StatusChip } from "@/components/shared/StatusChip";
import { PageHeader, SectionCard, EmptyState, TableSkeleton } from "@/components/shared/UIHelpers";
import { useState } from "react";

export default function PurchaseOrders() {
  const navigate = useNavigate();
  const [filter, setFilter] = useState("");
  const { data: orders, isLoading } = useQuery({ 
    queryKey: ["orders"], 
    queryFn: () => getOrders(),
    refetchInterval: 5000 
  });
  const filtered = filter ? orders?.filter((o) => o.status === filter) : orders;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Purchase Orders"
        subtitle="All orders across your suppliers"
        breadcrumb={["Buyer Portal", "Purchase Orders"]}
      />

      {/* Status filter */}
      <div className="flex gap-2 flex-wrap">
        {["", "confirmed", "invoice_generated", "dispatched", "in_transit", "delivered"].map((s) => (
          <button key={s} onClick={() => setFilter(s)}
            className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all ${
              filter === s ? "bg-indigo-600 text-white" : "bg-white border border-slate-200 text-slate-600 hover:border-slate-300"
            }`}>
            {s === "" ? "All" : s.split("_").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ")}
          </button>
        ))}
      </div>

      <SectionCard noPadding>
        {isLoading ? (
          <div className="p-6"><TableSkeleton /></div>
        ) : filtered?.length === 0 ? (
          <EmptyState icon={<ShoppingCart className="w-8 h-8" />} title="No orders found" description="Orders will appear here once you accept quotes" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px]">
              <thead>
                <tr className="border-b border-slate-100">
                  {["PO Number", "Product", "Supplier", "Qty & Value", "Status", "Payment", "Expected Delivery", ""].map((h) => (
                    <th key={h} className="text-left text-xs font-medium text-slate-400 px-5 py-3">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filtered?.map((order, i) => (
                  <motion.tr
                    key={order.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.04 }}
                    onClick={() => navigate('/buyer/shipments')}
                    className="table-row-hover cursor-pointer"
                  >
                    <td className="px-5 py-4">
                      <p className="text-sm font-semibold text-slate-900">{order.poNumber}</p>
                      <p className="text-xs text-slate-400">{formatDate(order.createdAt)}</p>
                    </td>
                    <td className="px-5 py-4">
                      <p className="text-sm text-slate-700 max-w-[160px] truncate">{order.productName}</p>
                    </td>
                    <td className="px-5 py-4">
                      <p className="text-sm text-slate-600 max-w-[140px] truncate">{order.supplierName}</p>
                    </td>
                    <td className="px-5 py-4">
                      <p className="text-sm font-medium text-slate-800">{formatCurrency(order.totalAmount)}</p>
                      <p className="text-xs text-slate-400">{order.quantity.toLocaleString()} {order.quantityUnit}</p>
                    </td>
                    <td className="px-5 py-4"><StatusChip status={order.status} /></td>
                    <td className="px-5 py-4">
                      <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                        order.paymentStatus === "paid" ? "bg-emerald-100 text-emerald-700" :
                        order.paymentStatus === "overdue" ? "bg-rose-100 text-rose-700" :
                        "bg-amber-100 text-amber-700"
                      }`}>
                        {order.paymentStatus.charAt(0).toUpperCase() + order.paymentStatus.slice(1)}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <p className="text-sm text-slate-600">{formatDate(order.expectedDelivery)}</p>
                    </td>
                    <td className="px-5 py-4">
                      <button className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-indigo-600 transition-colors">
                        <Download className="w-3.5 h-3.5" /> PO
                      </button>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </SectionCard>
    </div>
  );
}
