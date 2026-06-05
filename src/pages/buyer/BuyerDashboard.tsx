import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell
} from "recharts";
import {
  GitPullRequest, DollarSign, Package, TrendingUp,
  ArrowRight, Clock, CheckCircle, AlertCircle, Eye
} from "lucide-react";
import { getBuyerDashboardStats, getMonthlySpend, getRFQs, getOrders } from "@/lib/mock-api";
import { formatCurrency, formatDate, formatRelativeTime } from "@/lib/utils";
import { MetricCard } from "@/components/shared/MetricCard";
import { StatusChip } from "@/components/shared/StatusChip";
import { SectionCard, CardSkeleton, PageHeader } from "@/components/shared/UIHelpers";

const CONVERSION_DATA = [
  { name: "Sent", value: 50, color: "#6366f1" },
  { name: "Quoted", value: 35, color: "#8b5cf6" },
  { name: "Accepted", value: 20, color: "#10b981" },
  { name: "Ordered", value: 14, color: "#f59e0b" },
];

export default function BuyerDashboard() {
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["buyer-stats"],
    queryFn: () => getBuyerDashboardStats("b1"),
  });

  const { data: spendData, isLoading: spendLoading } = useQuery({
    queryKey: ["monthly-spend"],
    queryFn: () => getMonthlySpend("b1"),
  });

  const { data: rfqs, isLoading: rfqsLoading } = useQuery({
    queryKey: ["rfqs"],
    queryFn: () => getRFQs(),
  });

  const { data: orders, isLoading: ordersLoading } = useQuery({
    queryKey: ["orders"],
    queryFn: () => getOrders(),
  });

  const recentRFQs = rfqs?.slice(0, 5) || [];
  const recentOrders = orders?.slice(0, 4) || [];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Buyer Dashboard"
        subtitle="Overview of your procurement activity"
        breadcrumb={["Buyer Portal", "Dashboard"]}
        action={
          <Link
            to="/buyer/rfq/create"
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
          >
            + Create RFQ
          </Link>
        }
      />

      {/* Metric cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statsLoading ? (
          Array.from({ length: 4 }).map((_, i) => <CardSkeleton key={i} />)
        ) : (
          <>
            <MetricCard
              title="Active RFQs"
              value={stats?.activeRFQs ?? 0}
              subtitle="Awaiting quotes"
              icon={<GitPullRequest />}
              color="indigo"
              trend={{ value: 12, label: "vs last month" }}
              index={0}
            />
            <MetricCard
              title="Quotes Received"
              value={stats?.quotesReceived ?? 0}
              subtitle="Ready to compare"
              icon={<Package />}
              color="violet"
              trend={{ value: 8, label: "vs last month" }}
              index={1}
            />
            <MetricCard
              title="Active Orders"
              value={stats?.totalOrders ?? 0}
              subtitle="In progress"
              icon={<CheckCircle />}
              color="emerald"
              trend={{ value: 5, label: "vs last month" }}
              index={2}
            />
            <MetricCard
              title="Spend This Month"
              value={formatCurrency(stats?.spend ?? 0)}
              subtitle="Across all suppliers"
              icon={<DollarSign />}
              color="amber"
              trend={{ value: -3, label: "vs last month" }}
              index={3}
            />
          </>
        )}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Monthly Spend Chart */}
        <SectionCard
          title="Monthly Spend"
          subtitle="Jan – Sep 2024"
          className="lg:col-span-2"
        >
          {spendLoading ? (
            <div className="h-48 skeleton rounded-lg" />
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={spendData}>
                <defs>
                  <linearGradient id="spendGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false}
                  tickFormatter={(v) => `₹${(v / 100000).toFixed(0)}L`} />
                <Tooltip
                  formatter={(v: number) => [formatCurrency(v), "Spend"]}
                  contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #e2e8f0" }}
                />
                <Area type="monotone" dataKey="spend" stroke="#6366f1" strokeWidth={2}
                  fill="url(#spendGrad)" dot={false} activeDot={{ r: 4 }} />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </SectionCard>

        {/* RFQ Conversion */}
        <SectionCard title="RFQ Conversion" subtitle="Current pipeline">
          <div className="flex flex-col items-center">
            <ResponsiveContainer width="100%" height={160}>
              <PieChart>
                <Pie
                  data={CONVERSION_DATA}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {CONVERSION_DATA.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #e2e8f0" }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-2 w-full mt-1">
              {CONVERSION_DATA.map((item) => (
                <div key={item.name} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="text-slate-600">{item.name}</span>
                  </div>
                  <span className="font-semibold text-slate-800">{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </SectionCard>
      </div>

      {/* Recent Activity row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent RFQs */}
        <SectionCard
          title="Recent RFQs"
          action={
            <Link to="/buyer/rfq/tracker" className="text-xs text-indigo-600 font-medium flex items-center gap-1 hover:text-indigo-700">
              View all <ArrowRight className="w-3 h-3" />
            </Link>
          }
          noPadding
        >
          {rfqsLoading ? (
            <div className="p-6 space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex gap-3 items-center">
                  <div className="skeleton h-4 w-1/3" />
                  <div className="skeleton h-4 w-1/4 ml-auto" />
                  <div className="skeleton h-5 w-16" />
                </div>
              ))}
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="text-left text-xs font-medium text-slate-400 px-6 py-3">Product</th>
                  <th className="text-left text-xs font-medium text-slate-400 py-3">Qty</th>
                  <th className="text-left text-xs font-medium text-slate-400 py-3">Quotes</th>
                  <th className="text-right text-xs font-medium text-slate-400 py-3 pr-6">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {recentRFQs.map((rfq) => (
                  <tr key={rfq.id} className="table-row-hover">
                    <td className="px-6 py-3">
                      <div>
                        <p className="text-sm font-medium text-slate-800 truncate max-w-[160px]">{rfq.productName}</p>
                        <p className="text-xs text-slate-400">{rfq.rfqNumber}</p>
                      </div>
                    </td>
                    <td className="py-3 text-sm text-slate-600 whitespace-nowrap">
                      {rfq.quantity} {rfq.quantityUnit}
                    </td>
                    <td className="py-3">
                      <span className="inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold bg-indigo-100 text-indigo-700">
                        {rfq.quotesReceived}
                      </span>
                    </td>
                    <td className="py-3 pr-6 text-right">
                      <StatusChip status={rfq.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </SectionCard>

        {/* Recent Orders */}
        <SectionCard
          title="Recent Orders"
          action={
            <Link to="/buyer/orders" className="text-xs text-indigo-600 font-medium flex items-center gap-1 hover:text-indigo-700">
              View all <ArrowRight className="w-3 h-3" />
            </Link>
          }
          noPadding
        >
          {ordersLoading ? (
            <div className="p-6 space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex gap-3 items-center">
                  <div className="skeleton h-4 w-1/3" />
                  <div className="skeleton h-4 w-1/4 ml-auto" />
                  <div className="skeleton h-5 w-16" />
                </div>
              ))}
            </div>
          ) : (
            <div className="divide-y divide-slate-50">
              {recentOrders.map((order) => (
                <div key={order.id} className="px-6 py-4 hover:bg-slate-50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium text-slate-800">{order.poNumber}</p>
                        <StatusChip status={order.status} />
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5 truncate">{order.productName}</p>
                      <p className="text-xs text-slate-400 mt-0.5">{order.supplierName}</p>
                    </div>
                    <div className="text-right ml-3">
                      <p className="text-sm font-bold text-slate-900">{formatCurrency(order.totalAmount)}</p>
                      <p className="text-xs text-slate-400">{formatDate(order.createdAt)}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </SectionCard>
      </div>

      {/* Quick actions */}
      <SectionCard title="Quick Actions">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: "Create RFQ", icon: GitPullRequest, to: "/buyer/rfq/create", color: "text-indigo-600 bg-indigo-50" },
            { label: "AI Search", icon: TrendingUp, to: "/buyer/search", color: "text-violet-600 bg-violet-50" },
            { label: "Compare Quotes", icon: Eye, to: "/buyer/quotes/compare", color: "text-emerald-600 bg-emerald-50" },
            { label: "Track Shipments", icon: Clock, to: "/buyer/shipments", color: "text-amber-600 bg-amber-50" },
          ].map((action) => (
            <Link
              key={action.label}
              to={action.to}
              className="flex flex-col items-center gap-2 p-4 rounded-xl border border-slate-200 hover:border-indigo-200 hover:bg-indigo-50/30 transition-all group"
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${action.color} group-hover:scale-110 transition-transform`}>
                <action.icon className="w-5 h-5" />
              </div>
              <span className="text-xs font-medium text-slate-700">{action.label}</span>
            </Link>
          ))}
        </div>
      </SectionCard>
    </div>
  );
}
