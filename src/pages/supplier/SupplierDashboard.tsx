import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line
} from "recharts";
import {
  Inbox, DollarSign, Star, TrendingUp, ArrowRight, Package, ShieldCheck, Award, HelpCircle, FileText
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
      {/* Alibaba Welcome Banner */}
      <div className="bg-gradient-to-r from-[#165DFF] to-[#4080FF] rounded-t-xl rounded-b shadow-sm overflow-hidden text-white">
        {/* Top half: Welcome */}
        <div className="flex items-center justify-center py-6 bg-[url('https://img.alicdn.com/tfs/TB1..')] bg-cover bg-no-repeat bg-center" style={{ backgroundImage: "url('https://img.alicdn.com/imgextra/i3/O1CN01D6U0n21wQ4L3D8mX0_!!6000000006301-2-tps-2880-480.png')", backgroundColor: "#f8f9fa" }}>
          <div className="bg-white/90 backdrop-blur px-8 py-3 rounded-full text-slate-800 font-semibold shadow-sm inline-flex items-center gap-2">
            Welcome back, SUPPLIER!
          </div>
        </div>

        {/* Bottom half: Ratings */}
        <div className="flex flex-col sm:flex-row items-center justify-between px-6 py-4 bg-[#0A3DBC]">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Current Star Rating</span>
              <div className="flex text-white/40">
                <Star className="w-4 h-4 fill-current" />
                <Star className="w-4 h-4 fill-current" />
                <Star className="w-4 h-4 fill-current" />
                <Star className="w-4 h-4 fill-current" />
                <Star className="w-4 h-4 fill-current" />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Forecasted Star Rating</span>
              <span className="bg-[#10B981] text-white text-xs px-2 py-0.5 rounded font-medium">0-Star Supplier</span>
            </div>
          </div>
        </div>
      </div>

      {/* Performance Card */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <div className="flex items-center gap-4 mb-6">
          <h2 className="text-xl font-bold text-slate-900">Performance</h2>
          <div className="flex items-center gap-3">
            <div className="relative">
              <span className="absolute -top-2 -right-2 bg-[#10B981] text-white text-[8px] font-bold px-1 rounded-sm">NEW</span>
              <button className="flex items-center gap-1 text-sm bg-indigo-50 text-indigo-600 px-3 py-1.5 rounded-full font-medium">
                <TrendingUp className="w-3 h-3" /> Funnel
              </button>
            </div>
            <span className="text-sm text-slate-500">12/18 2022 to 12/24 2022</span>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
          <div className="flex flex-col">
            <span className="text-sm text-slate-500 flex items-center gap-1">Unique visitors (UV) <HelpCircle className="w-3 h-3"/></span>
            <span className="text-2xl font-bold text-slate-900 mt-2 mb-1">0</span>
            <span className="text-xs text-rose-500 font-medium">100% - vs. your peers</span>
          </div>
          <div className="flex flex-col">
            <span className="text-sm text-slate-500 flex items-center gap-1">Inquiries <HelpCircle className="w-3 h-3"/></span>
            <span className="text-2xl font-bold text-slate-900 mt-2 mb-1">0</span>
            <span className="text-xs text-rose-500 font-medium">100% - vs. your peers</span>
          </div>
          <div className="flex flex-col">
            <span className="text-sm text-slate-500 flex items-center gap-1">Messages <HelpCircle className="w-3 h-3"/></span>
            <span className="text-2xl font-bold text-slate-900 mt-2 mb-1">0</span>
            <span className="text-xs text-rose-500 font-medium">100% - vs. your peers</span>
          </div>
          <div className="flex flex-col">
            <span className="text-sm text-slate-500 flex items-center gap-1">Store response time <HelpCircle className="w-3 h-3"/></span>
            <span className="text-2xl font-bold text-slate-900 mt-2 mb-1">0.00hr</span>
            <span className="text-xs text-emerald-500 font-medium">0% - vs. your peers</span>
          </div>
          <div className="flex flex-col border-l border-slate-100 pl-6">
            <span className="text-sm text-slate-500">Unread inquires</span>
            <span className="text-3xl font-bold text-slate-900 mt-1 mb-3">5</span>
          </div>
        </div>
      </div>

      {/* Our Suggestions Card */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-bold text-slate-900">Our suggestions</h2>
            <span className="text-xs text-slate-500">Updated on every Monday</span>
          </div>
          <span className="text-sm text-slate-500 flex items-center gap-1 cursor-pointer">
            My industry: <Package className="w-3 h-3" />
          </span>
        </div>
        <ul className="space-y-4 list-disc pl-5 text-sm text-slate-700">
          <li>
            Compared to your peers, your UV is <span className="text-rose-500">200.0%-</span>, the number of inquiries is <span className="text-rose-500">200.0%-</span>, the number of messages is <span className="text-rose-500">200.0%-</span>
          </li>
          <li>
            To outperform your peers, adjust marketing strategies to increase UV and impressions, and improve your products to become Top and Super Products and get more inquiries or messages. <span className="text-indigo-600 cursor-pointer">Act Now</span>
          </li>
        </ul>
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
                {["Product", "Price", "Status", "Action"].map((h) => (
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
                  <td className="px-5 py-3">
                    <Link to={`/supplier/quotes/negotiate?rfqId=${q.rfqId}&quoteId=${q.id}`} className="text-xs font-medium text-indigo-600 hover:text-indigo-800 flex items-center gap-1">
                      Chat <ArrowRight className="w-3 h-3"/>
                    </Link>
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
