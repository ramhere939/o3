import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line
} from "recharts";
import {
  Inbox, DollarSign, Star, TrendingUp, ArrowRight, Package, ShieldCheck, Award
} from "lucide-react";
import { getSupplierDashboardStats, getRevenueByMonth, getQuotes, getRFQs } from "@/lib/mock-api";
import { formatCurrency } from "@/lib/utils";
import { MetricCard } from "@/components/shared/MetricCard";
import { StatusChip } from "@/components/shared/StatusChip";
import { PageHeader, SectionCard, CardSkeleton } from "@/components/shared/UIHelpers";

export default function SupplierDashboard() {
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["supplier-stats"],
    queryFn: () => getSupplierDashboardStats("s1"),
    refetchInterval: 5000,
  });

  const { data: revenue, isLoading: revenueLoading } = useQuery({
    queryKey: ["revenue-by-month"],
    queryFn: () => getRevenueByMonth("s1"),
  });

  const { data: quotes } = useQuery({
    queryKey: ["supplier-quotes"],
    queryFn: () => getQuotes({ supplierId: "s1" }),
    refetchInterval: 5000,
  });

  const { data: rfqs } = useQuery({
    queryKey: ["open-rfqs"],
    queryFn: () => getRFQs({ status: "sent" }),
    refetchInterval: 5000,
  });

  const recentQuotes = quotes?.slice(0, 5) || [];
  const openRFQs = rfqs?.slice(0, 4) || [];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Supplier Dashboard"
        subtitle="Track performance and manage your quotes"
        breadcrumb={["Supplier Portal", "Dashboard"]}
        action={
          <Link
            to="/supplier/inventory"
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
          >
            + List Product
          </Link>
        }
      />

      {/* O3 Assured badge */}
      <div className="flex items-center gap-3 bg-gradient-to-r from-indigo-600 to-violet-700 rounded-xl p-4 text-white">
        <ShieldCheck className="w-8 h-8 text-indigo-200 flex-shrink-0" />
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <Award className="w-4 h-4 text-amber-300" />
            <p className="font-semibold">O3 Assured Supplier</p>
          </div>
          <p className="text-xs text-indigo-200 mt-0.5">Your profile is verified. Buyers trust your listings 3x more.</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-indigo-200">Win Rate</p>
          <p className="text-2xl font-bold">68%</p>
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statsLoading ? (
          Array.from({ length: 4 }).map((_, i) => <CardSkeleton key={i} />)
        ) : (
          <>
            <MetricCard title="Open RFQs" value={stats?.openRFQs ?? 0} subtitle="Awaiting your quotes" icon={<Inbox />} color="indigo" trend={{ value: 15, label: "this week" }} index={0} />
            <MetricCard title="Active Quotes" value={stats?.activeQuotes ?? 0} subtitle="Pending decisions" icon={<Package />} color="violet" trend={{ value: 6 }} index={1} />
            <MetricCard title="Total Orders" value={stats?.totalOrders ?? 0} subtitle="Fulfilled orders" icon={<Star />} color="emerald" trend={{ value: 8, label: "vs last month" }} index={2} />
            <MetricCard title="Revenue (MTD)" value={formatCurrency(stats?.revenue ?? 0)} subtitle="Month to date" icon={<DollarSign />} color="amber" trend={{ value: 12, label: "vs last month" }} index={3} />
          </>
        )}
      </div>

      {/* Revenue chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SectionCard title="Monthly Revenue" subtitle="Jan – Sep 2024">
          {revenueLoading ? (
            <div className="h-48 skeleton rounded-lg" />
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={revenue}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false}
                  tickFormatter={(v) => `₹${(v / 100000).toFixed(0)}L`} />
                <Tooltip formatter={(v: number) => [formatCurrency(v), "Revenue"]}
                  contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #e2e8f0" }} />
                <Bar dataKey="revenue" fill="#6366f1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </SectionCard>

        {/* Win rate trend */}
        <SectionCard title="Quote Win Rate" subtitle="Monthly performance">
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={[
              { month: "Jan", rate: 52 }, { month: "Feb", rate: 55 }, { month: "Mar", rate: 48 },
              { month: "Apr", rate: 60 }, { month: "May", rate: 58 }, { month: "Jun", rate: 62 },
              { month: "Jul", rate: 65 }, { month: "Aug", rate: 64 }, { month: "Sep", rate: 68 },
            ]}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false}
                tickFormatter={(v) => `${v}%`} domain={[40, 80]} />
              <Tooltip formatter={(v: number) => [`${v}%`, "Win Rate"]}
                contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #e2e8f0" }} />
              <Line type="monotone" dataKey="rate" stroke="#10b981" strokeWidth={2} dot={false} activeDot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </SectionCard>
      </div>

      {/* Recent quotes & Open RFQs */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* My Recent Quotes */}
        <SectionCard
          title="Recent Quotes Submitted"
          action={<Link to="/supplier/quotes" className="text-xs text-indigo-600 font-medium flex items-center gap-1">View all <ArrowRight className="w-3 h-3" /></Link>}
          noPadding
        >
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100">
                {["Product", "Price", "Status"].map((h) => (
                  <th key={h} className="text-left text-xs font-medium text-slate-400 px-5 py-3">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {recentQuotes.map((q) => (
                <tr key={q.id} className="table-row-hover">
                  <td className="px-5 py-3">
                    <p className="text-xs font-medium text-slate-800">{q.quoteNumber}</p>
                    <p className="text-xs text-slate-400 truncate max-w-[130px]">{q.rfqId}</p>
                  </td>
                  <td className="px-5 py-3">
                    <p className="text-sm font-bold text-indigo-600">₹{q.price}</p>
                    <p className="text-xs text-slate-400">{q.priceUnit}</p>
                  </td>
                  <td className="px-5 py-3 text-right pr-5">
                    <StatusChip status={q.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </SectionCard>

        {/* Open RFQ opportunities */}
        <SectionCard
          title="New RFQ Opportunities"
          action={<Link to="/supplier/rfq-inbox" className="text-xs text-indigo-600 font-medium flex items-center gap-1">View all <ArrowRight className="w-3 h-3" /></Link>}
        >
          <div className="space-y-3">
            {openRFQs.map((rfq) => (
              <div key={rfq.id} className="flex items-start justify-between p-3 rounded-xl bg-slate-50 hover:bg-indigo-50/50 transition-colors">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-800 truncate">{rfq.productName}</p>
                  <p className="text-xs text-slate-500">{rfq.quantity.toLocaleString()} {rfq.quantityUnit} · {rfq.deliveryLocation}</p>
                  <p className="text-xs text-slate-400">Buyer: {rfq.buyerName}</p>
                </div>
                <Link
                  to={`/supplier/quotes?rfqId=${rfq.id}`}
                  className="text-xs bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 rounded-lg font-medium flex items-center gap-1 ml-3 flex-shrink-0"
                >
                  Quote <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            ))}
          </div>
        </SectionCard>
      </div>
    </div>
  );
}
