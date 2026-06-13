import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { DollarSign, TrendingUp, Package, CreditCard, Download } from "lucide-react";
import { getRevenueByMonth, getOrders } from "@/lib/mock-api";
import { formatCurrency, formatDate } from "@/lib/utils";
import { MetricCard } from "@/components/shared/MetricCard";
import { PageHeader as PH, SectionCard as SC } from "@/components/shared/UIHelpers";

export default function SupplierEarnings() {
  const { data: revenue } = useQuery({ queryKey: ["revenue"], queryFn: () => getRevenueByMonth("s1") });
  const { data: orders } = useQuery({ queryKey: ["orders"], queryFn: () => getOrders() });

  const myOrders = orders?.filter((o: any) => o.supplierId === "s1") || [];
  const totalRevenue = myOrders.reduce((s: number, o: any) => s + o.totalAmount, 0);
  const paidOrders = myOrders.filter((o: any) => o.paymentStatus === "paid");
  const pendingRevenue = myOrders.filter((o: any) => o.paymentStatus === "pending").reduce((s: number, o: any) => s + o.totalAmount, 0);
  const overdueRevenue = myOrders.filter((o: any) => o.paymentStatus === "overdue").reduce((s: number, o: any) => s + o.totalAmount, 0);

  return (
    <div className="space-y-6">
      <PH
        title="Earnings & Payments"
        subtitle="Track revenue, payments, and financial health"
        breadcrumb={["Supplier Portal", "Earnings"]}
        action={
          <button className="flex items-center gap-2 border border-slate-200 text-slate-600 text-sm font-medium px-4 py-2 rounded-lg hover:bg-slate-50">
            <Download className="w-4 h-4" /> Export Report
          </button>
        }
      />

      {/* Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { title: "Total Revenue", value: formatCurrency(totalRevenue), icon: <DollarSign />, color: "indigo" as const, trend: { value: 12 } },
          { title: "Paid Invoices", value: paidOrders.length, subtitle: `${formatCurrency(paidOrders.reduce((s: number, o: any) => s + o.totalAmount, 0))}`, icon: <TrendingUp />, color: "emerald" as const },
          { title: "Pending Payment", value: formatCurrency(pendingRevenue), icon: <CreditCard />, color: "amber" as const },
          { title: "Overdue", value: formatCurrency(overdueRevenue), icon: <Package />, color: "rose" as const },
        ].map((m, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
            <MetricCard {...m} index={i} />
          </motion.div>
        ))}
      </div>

      {/* Revenue chart */}
      <SC title="Monthly Revenue" subtitle="Jan – Sep 2024">
        <ResponsiveContainer width="100%" height={220}>
          <AreaChart data={revenue}>
            <defs>
              <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.15} />
                <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false}
              tickFormatter={(v) => `₹${(v / 100000).toFixed(0)}L`} />
            <Tooltip formatter={(v: any) => [formatCurrency(v), "Revenue"]}
              contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #e2e8f0" }} />
            <Area type="monotone" dataKey="revenue" stroke="#6366f1" strokeWidth={2} fill="url(#revGrad)" dot={false} activeDot={{ r: 4 }} />
          </AreaChart>
        </ResponsiveContainer>
      </SC>

      {/* Payments table */}
      <SC title="Payment History" noPadding>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[600px]">
            <thead>
              <tr className="border-b border-slate-100">
                {["Order", "Buyer", "Amount", "Status", "Date"].map((h) => (
                  <th key={h} className="text-left text-xs font-medium text-slate-400 px-5 py-3">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {myOrders.slice(0, 10).map((order: any, i: number) => (
                <motion.tr key={order.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.04 }} className="table-row-hover">
                  <td className="px-5 py-3">
                    <p className="text-sm font-medium text-slate-800">{order.poNumber}</p>
                    <p className="text-xs text-slate-400 truncate max-w-[140px]">{order.productName}</p>
                  </td>
                  <td className="px-5 py-3">
                    <p className="text-sm text-slate-600 max-w-[140px] truncate">{order.buyerName}</p>
                  </td>
                  <td className="px-5 py-3">
                    <p className="text-sm font-semibold text-slate-900">{formatCurrency(order.totalAmount)}</p>
                  </td>
                  <td className="px-5 py-3">
                    <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                      order.paymentStatus === "paid" ? "bg-emerald-100 text-emerald-700" :
                      order.paymentStatus === "overdue" ? "bg-rose-100 text-rose-700" :
                      "bg-amber-100 text-amber-700"
                    }`}>
                      {order.paymentStatus.charAt(0).toUpperCase() + order.paymentStatus.slice(1)}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    <p className="text-sm text-slate-500">{formatDate(order.createdAt)}</p>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </SC>
    </div>
  );
}
