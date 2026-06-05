import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Star, Check, X, MessageSquare, Shield, Clock, DollarSign } from "lucide-react";
import { getQuotes } from "@/lib/mock-api";
import { formatCurrency, formatDate } from "@/lib/utils";
import { StatusChip } from "@/components/shared/StatusChip";
import { PageHeader, SectionCard, EmptyState } from "@/components/shared/UIHelpers";

const FEATURED_RFQ = { id: "rfq1", name: "Titanium Dioxide (Rutile Grade)", qty: "2,000 kg" };

export default function QuoteCompare() {
  const { data: quotes, isLoading } = useQuery({
    queryKey: ["quotes", "rfq1"],
    queryFn: () => getQuotes({ rfqId: "rfq1" }),
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        <PageHeader title="Quote Comparison" breadcrumb={["Buyer Portal", "Compare Quotes"]} />
        <div className="skeleton h-64 rounded-xl" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Quote Comparison"
        subtitle={`Comparing ${quotes?.length || 0} quotes for ${FEATURED_RFQ.name}`}
        breadcrumb={["Buyer Portal", "Compare Quotes"]}
      />

      {/* RFQ context */}
      <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-indigo-500 font-medium uppercase tracking-wide">RFQ-2024-0001</p>
            <h2 className="text-base font-semibold text-indigo-900">{FEATURED_RFQ.name}</h2>
            <p className="text-sm text-indigo-600">{FEATURED_RFQ.qty} · Net 30 Days · Mumbai</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-indigo-500">Target Price</p>
            <p className="text-xl font-bold text-indigo-700">₹180/kg</p>
          </div>
        </div>
      </div>

      {/* Comparison table */}
      {quotes && quotes.length > 0 ? (
        <div className="overflow-x-auto">
          <div className="min-w-[700px]">
            {/* Header row */}
            <div className="grid gap-3 mb-3" style={{ gridTemplateColumns: `200px repeat(${quotes.length}, 1fr)` }}>
              <div className="p-4" />
              {quotes.map((q, i) => (
                <motion.div
                  key={q.id}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className={`p-4 rounded-t-xl border-t border-x ${
                    q.status === "accepted"
                      ? "border-emerald-300 bg-emerald-50"
                      : "border-slate-200 bg-white"
                  }`}
                >
                  {q.status === "accepted" && (
                    <div className="text-[10px] font-bold text-emerald-700 bg-emerald-200 px-2 py-0.5 rounded-full inline-flex items-center gap-1 mb-2">
                      <Check className="w-3 h-3" /> ACCEPTED
                    </div>
                  )}
                  <p className="text-sm font-semibold text-slate-900">{q.supplierName}</p>
                  <div className="flex items-center gap-1 mt-1">
                    <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                    <span className="text-xs font-medium text-slate-600">{q.supplierRating}</span>
                  </div>
                  <StatusChip status={q.status} className="mt-1.5" />
                </motion.div>
              ))}
            </div>

            {/* Rows */}
            {[
              {
                label: "Price",
                icon: <DollarSign className="w-4 h-4" />,
                render: (q: typeof quotes[0]) => (
                  <div>
                    <p className="text-lg font-bold text-indigo-600">₹{q.price.toLocaleString("en-IN")}</p>
                    <p className="text-xs text-slate-400">{q.priceUnit}</p>
                    {q.price <= 182 && (
                      <span className="text-[10px] text-emerald-600 font-medium">✓ Below target</span>
                    )}
                  </div>
                ),
                best: (q: typeof quotes[0]) => q.status === "accepted",
              },
              {
                label: "Total Amount",
                render: (q: typeof quotes[0]) => (
                  <p className="text-sm font-semibold text-slate-800">{formatCurrency(q.totalAmount)}</p>
                ),
              },
              {
                label: "Lead Time",
                icon: <Clock className="w-4 h-4" />,
                render: (q: typeof quotes[0]) => (
                  <p className="text-sm font-medium text-slate-700">{q.leadTimeDays} days</p>
                ),
              },
              {
                label: "Payment Terms",
                render: (q: typeof quotes[0]) => (
                  <p className="text-sm text-slate-600">{q.paymentTerms}</p>
                ),
              },
              {
                label: "Logistics Terms",
                render: (q: typeof quotes[0]) => (
                  <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full capitalize">
                    {q.logisticsTerms.replace("_", " ")}
                  </span>
                ),
              },
              {
                label: "Quote Valid Until",
                render: (q: typeof quotes[0]) => (
                  <p className="text-xs text-slate-500">{formatDate(q.validUntil)}</p>
                ),
              },
              {
                label: "Notes",
                render: (q: typeof quotes[0]) => (
                  <p className="text-xs text-slate-500 leading-relaxed">{q.notes || "—"}</p>
                ),
              },
            ].map((row, ri) => (
              <div key={row.label} className={`grid gap-3 ${ri % 2 === 0 ? "bg-slate-50/50" : "bg-white"}`}
                style={{ gridTemplateColumns: `200px repeat(${quotes.length}, 1fr)` }}>
                <div className="p-4 flex items-center gap-2">
                  {row.icon && <span className="text-slate-400">{row.icon}</span>}
                  <span className="text-xs font-medium text-slate-500">{row.label}</span>
                </div>
                {quotes.map((q) => (
                  <div key={q.id} className={`p-4 border-x ${
                    q.status === "accepted" ? "border-emerald-200 bg-emerald-50/30" : "border-slate-200"
                  }`}>
                    {row.render(q)}
                  </div>
                ))}
              </div>
            ))}

            {/* Action row */}
            <div className="grid gap-3 pt-2" style={{ gridTemplateColumns: `200px repeat(${quotes.length}, 1fr)` }}>
              <div className="p-4" />
              {quotes.map((q) => (
                <div key={q.id} className={`p-4 rounded-b-xl border border-t-0 ${
                  q.status === "accepted" ? "border-emerald-300 bg-emerald-50" : "border-slate-200 bg-white"
                }`}>
                  {q.status === "pending" ? (
                    <div className="flex flex-col gap-2">
                      <button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium py-2 rounded-lg flex items-center justify-center gap-1.5 transition-colors">
                        <Check className="w-3.5 h-3.5" /> Accept
                      </button>
                      <Link
                        to="/buyer/quotes/negotiate"
                        className="w-full bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-medium py-2 rounded-lg flex items-center justify-center gap-1.5 transition-colors"
                      >
                        <MessageSquare className="w-3.5 h-3.5" /> Negotiate
                      </Link>
                      <button className="w-full border border-slate-200 text-slate-500 hover:bg-slate-50 text-xs font-medium py-2 rounded-lg flex items-center justify-center gap-1.5 transition-colors">
                        <X className="w-3.5 h-3.5" /> Reject
                      </button>
                    </div>
                  ) : q.status === "accepted" ? (
                    <button className="w-full bg-emerald-600 text-white text-xs font-semibold py-2 rounded-lg flex items-center justify-center gap-1.5" disabled>
                      <Check className="w-3.5 h-3.5" /> Accepted
                    </button>
                  ) : (
                    <span className="block text-center text-xs text-slate-400">—</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <EmptyState
          icon={<Shield className="w-8 h-8" />}
          title="No quotes yet"
          description="Quotes from suppliers will appear here once they respond to your RFQ"
        />
      )}
    </div>
  );
}
