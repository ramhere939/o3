import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Clock, ArrowRight, Package } from "lucide-react";
import { getRFQs } from "@/lib/mock-api";
import { formatDate, formatRelativeTime } from "@/lib/utils";
import { StatusChip } from "@/components/shared/StatusChip";
import { PageHeader, EmptyState, TableSkeleton } from "@/components/shared/UIHelpers";
import { RFQDetailModal } from "@/components/shared/RFQDetailModal";
import { useState } from "react";

export default function RFQInbox() {
  const [filter, setFilter] = useState("");
  const [selectedRFQId, setSelectedRFQId] = useState<string | null>(null);

  const { data: rfqs, isLoading } = useQuery({
    queryKey: ["rfqs-inbox", filter],
    queryFn: () => getRFQs({ status: filter || undefined }),
    refetchInterval: 5000,
  });

  const openRFQs = rfqs?.filter((r) => r.status === "sent" || r.status === "viewed") || [];
  const displayRFQs = filter ? rfqs : openRFQs;

  return (
    <div className="space-y-6">
      <PageHeader
        title="RFQ Inbox"
        subtitle={`${openRFQs.length} new RFQs awaiting your quote`}
        breadcrumb={["Supplier Portal", "RFQ Inbox"]}
      />

      {/* Status filters */}
      <div className="flex gap-2 flex-wrap">
        {[
          { id: "", label: "Open RFQs" },
          { id: "sent", label: "New RFQs" },
          { id: "viewed", label: "Viewed" },
          { id: "quote_received", label: "Quoted" },
          { id: "expired", label: "Expired" },
        ].map((f) => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id)}
            className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all ${
              filter === f.id
                ? "bg-indigo-600 text-white"
                : "bg-white border border-slate-200 text-slate-600 hover:border-slate-300"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <TableSkeleton />
      ) : displayRFQs?.length === 0 ? (
        <EmptyState
          icon={<Package className="w-8 h-8" />}
          title="No RFQs found"
          description="New RFQs matching your product catalog will appear here"
        />
      ) : (
        <div className="space-y-3">
          {displayRFQs?.map((rfq, i) => (
            <motion.div
              key={rfq.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.04 }}
              onClick={() => setSelectedRFQId(rfq.id)}
              className="bg-white rounded-xl border border-slate-200 p-5 hover:shadow-md hover:border-indigo-200 transition-all cursor-pointer group"
            >
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center flex-shrink-0">
                  <Package className="w-4.5 h-4.5 text-indigo-600" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-sm font-semibold text-slate-900 group-hover:text-indigo-700 transition-colors">
                          {rfq.productName}
                        </h3>
                        <StatusChip status={rfq.status} role="supplier" />
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {rfq.rfqNumber} · {rfq.grade}
                      </p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-sm font-semibold text-slate-800">
                        {rfq.quantity.toLocaleString()} {rfq.quantityUnit}
                      </p>
                      {rfq.targetPrice && (
                        <p className="text-xs text-emerald-600 font-medium">
                          Target: ₹{rfq.targetPrice}/{rfq.quantityUnit}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-4 mt-2.5 text-xs text-slate-500">
                    <span>🏢 {rfq.buyerName}</span>
                    <span>📍 {rfq.deliveryLocation}</span>
                    <span>📅 Deliver by {formatDate(rfq.deliveryDate)}</span>
                    <span>💳 {rfq.paymentTerms.replace("_", " ")}</span>
                    <span className="text-slate-400">
                      Posted {formatRelativeTime(rfq.createdAt)}
                    </span>
                  </div>

                  {rfq.notes && (
                    <p className="mt-2 text-xs text-slate-500 bg-slate-50 rounded-lg px-3 py-2 border border-slate-100">
                      <span className="font-medium text-slate-600">Notes:</span> {rfq.notes}
                    </p>
                  )}
                </div>

                <div
                  className="flex-shrink-0 flex flex-col items-end gap-1.5"
                  onClick={(e) => e.stopPropagation()}
                >
                  {rfq.status === 'quote_received' || rfq.status === 'negotiating' ? (
                    <div className="flex flex-col gap-1.5 w-full">
                      <Link
                        to={`/supplier/quotes/negotiate?rfqId=${rfq.id}`}
                        className="flex items-center justify-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-medium px-4 py-2 rounded-lg transition-colors w-full"
                      >
                         Chat <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                      <Link
                        to={`/supplier/quotes?rfqId=${rfq.id}&edit=true`}
                        className="flex items-center justify-center gap-1.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-medium px-4 py-2 rounded-lg transition-colors w-full"
                      >
                         Edit Quote
                      </Link>
                    </div>
                  ) : (
                    <Link
                      to={`/supplier/quotes?rfqId=${rfq.id}`}
                      className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-medium px-4 py-2 rounded-lg transition-colors"
                    >
                      Submit Quote <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  )}
                  <p className="text-[10px] text-slate-400 flex items-center gap-0.5 justify-end">
                    <Clock className="w-3 h-3" />
                    Closes {formatDate(rfq.expiresAt)}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* RFQ Detail Modal (supplier view) */}
      <RFQDetailModal
        rfqId={selectedRFQId}
        onClose={() => setSelectedRFQId(null)}
        viewerRole="supplier"
      />
    </div>
  );
}
