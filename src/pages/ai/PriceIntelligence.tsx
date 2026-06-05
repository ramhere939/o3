import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from "recharts";
import { TrendingUp, TrendingDown, Minus, BarChart2, Search } from "lucide-react";
import { getPriceTrend, getProducts } from "@/lib/mock-api";
import { PageHeader, SectionCard } from "@/components/shared/UIHelpers";

const PRICE_PRODUCTS = [
  { id: "tio2", name: "Titanium Dioxide (Rutile)", current: 182, change: -4.2, unit: "kg" },
  { id: "caustic", name: "Caustic Soda Flakes", current: 32, change: 6.8, unit: "kg" },
  { id: "glycerine", name: "Glycerine USP", current: 92, change: 8.3, unit: "kg" },
  { id: "methanol", name: "Methanol Technical", current: 27, change: -3.1, unit: "litre" },
  { id: "ipa", name: "IPA 99.9%", current: 112, change: 1.5, unit: "litre" },
  { id: "carbon_black", name: "Carbon Black N330", current: 72, change: -0.8, unit: "kg" },
  { id: "hcl", name: "HCl 33%", current: 16, change: 2.2, unit: "kg" },
  { id: "h2so4", name: "Sulphuric Acid 98%", current: 12.5, change: -1.5, unit: "kg" },
];

const TIME_FILTERS: { label: string; value: 7 | 30 | 90 }[] = [
  { label: "7 Days", value: 7 },
  { label: "30 Days", value: 30 },
  { label: "90 Days", value: 90 },
];

export default function PriceIntelligence() {
  const [selectedProduct, setSelectedProduct] = useState(PRICE_PRODUCTS[0]);
  const [period, setPeriod] = useState<7 | 30 | 90>(30);

  const { data: trend, isLoading } = useQuery({
    queryKey: ["price-trend", selectedProduct.name, period],
    queryFn: () => getPriceTrend(selectedProduct.name, period),
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Price Intelligence"
        subtitle="Live chemical price trends and market insights"
        breadcrumb={["Platform", "Price Intelligence"]}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Market Overview */}
        <div className="space-y-3">
          <h2 className="text-sm font-semibold text-slate-700">Market Prices</h2>
          {PRICE_PRODUCTS.map((p) => (
            <button
              key={p.id}
              onClick={() => setSelectedProduct(p)}
              className={`w-full text-left p-3.5 rounded-xl border transition-all ${
                selectedProduct.id === p.id
                  ? "border-indigo-400 bg-indigo-50 shadow-sm"
                  : "border-slate-200 bg-white hover:border-slate-300"
              }`}
            >
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-slate-800 leading-tight">{p.name}</p>
                <div className="flex items-center gap-1 flex-shrink-0">
                  {p.change > 0 ? (
                    <TrendingUp className="w-3.5 h-3.5 text-rose-500" />
                  ) : p.change < 0 ? (
                    <TrendingDown className="w-3.5 h-3.5 text-emerald-500" />
                  ) : (
                    <Minus className="w-3.5 h-3.5 text-slate-400" />
                  )}
                  <span className={`text-xs font-semibold ${
                    p.change > 0 ? "text-rose-600" : p.change < 0 ? "text-emerald-600" : "text-slate-500"
                  }`}>
                    {p.change > 0 ? "+" : ""}{p.change}%
                  </span>
                </div>
              </div>
              <p className="text-base font-bold text-indigo-600 mt-1">
                ₹{p.current}
                <span className="text-xs font-normal text-slate-400 ml-1">/{p.unit}</span>
              </p>
            </button>
          ))}
        </div>

        {/* Price Trend Chart */}
        <div className="lg:col-span-2 space-y-4">
          <SectionCard
            title={selectedProduct.name}
            subtitle="Price trend over selected period"
            action={
              <div className="flex gap-1">
                {TIME_FILTERS.map((f) => (
                  <button
                    key={f.value}
                    onClick={() => setPeriod(f.value)}
                    className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                      period === f.value ? "bg-indigo-600 text-white" : "text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            }
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-3xl font-bold text-slate-900">₹{selectedProduct.current}</p>
                <p className="text-xs text-slate-400">per {selectedProduct.unit} · Current market rate</p>
              </div>
              <div className={`flex items-center gap-2 px-4 py-2 rounded-xl ${
                selectedProduct.change > 0 ? "bg-rose-50 border border-rose-200" :
                selectedProduct.change < 0 ? "bg-emerald-50 border border-emerald-200" :
                "bg-slate-50 border border-slate-200"
              }`}>
                {selectedProduct.change > 0 ? (
                  <TrendingUp className="w-5 h-5 text-rose-500" />
                ) : (
                  <TrendingDown className="w-5 h-5 text-emerald-500" />
                )}
                <div>
                  <p className={`text-lg font-bold ${
                    selectedProduct.change > 0 ? "text-rose-600" : "text-emerald-600"
                  }`}>
                    {selectedProduct.change > 0 ? "+" : ""}{selectedProduct.change}%
                  </p>
                  <p className="text-[10px] text-slate-400">7-day change</p>
                </div>
              </div>
            </div>

            {isLoading ? (
              <div className="skeleton h-48 rounded-lg" />
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={trend}>
                  <defs>
                    <linearGradient id="priceGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.12} />
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="date" tick={{ fontSize: 10, fill: "#94a3b8" }} axisLine={false} tickLine={false}
                    tickFormatter={(d) => {
                      const dt = new Date(d);
                      return period <= 7 ? dt.toLocaleDateString("en-IN", { weekday: "short" }) :
                        dt.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
                    }} />
                  <YAxis tick={{ fontSize: 10, fill: "#94a3b8" }} axisLine={false} tickLine={false}
                    domain={["dataMin - 5", "dataMax + 5"]}
                    tickFormatter={(v) => `₹${v}`} />
                  <Tooltip
                    formatter={(v: number) => [`₹${v.toFixed(2)}`, "Price"]}
                    labelFormatter={(d) => new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "long" })}
                    contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #e2e8f0" }}
                  />
                  <Area type="monotone" dataKey="price" stroke="#6366f1" strokeWidth={2}
                    fill="url(#priceGrad)" dot={false} activeDot={{ r: 4 }} />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </SectionCard>

          {/* Insights */}
          <SectionCard title="Market Insights">
            <div className="space-y-3">
              {[
                { label: "Recommendation", value: selectedProduct.change < 0 ? "Good time to procure — prices trending down" : "Consider delay — prices trending up", color: selectedProduct.change < 0 ? "text-emerald-600" : "text-amber-600" },
                { label: "30-Day Avg", value: `₹${(selectedProduct.current * (1 + (Math.random() - 0.5) * 0.05)).toFixed(2)}/${selectedProduct.unit}`, color: "text-slate-700" },
                { label: "YTD High", value: `₹${(selectedProduct.current * 1.12).toFixed(2)}/${selectedProduct.unit}`, color: "text-rose-600" },
                { label: "YTD Low", value: `₹${(selectedProduct.current * 0.88).toFixed(2)}/${selectedProduct.unit}`, color: "text-emerald-600" },
              ].map((item) => (
                <div key={item.label} className="flex justify-between text-sm">
                  <span className="text-slate-500">{item.label}</span>
                  <span className={`font-medium ${item.color}`}>{item.value}</span>
                </div>
              ))}
            </div>
          </SectionCard>
        </div>
      </div>
    </div>
  );
}
