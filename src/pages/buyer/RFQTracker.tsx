import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Clock, CheckCircle, Eye, AlertCircle, Plus, ChevronRight, MessageSquare, XCircle } from "lucide-react";
import { getRFQs } from "@/lib/mock-api";
import { formatDate, formatRelativeTime } from "@/lib/utils";
import { StatusChip } from "@/components/shared/StatusChip";
import { PageHeader, EmptyState, TableSkeleton } from "@/components/shared/UIHelpers";
import { RFQDetailModal } from "@/components/shared/RFQDetailModal";
import { useState } from "react";

const STATUS_FILTERS: { label: string; value: string }[] = [
  { label: "All", value: "" },
  { label: "Sent", value: "sent" },
  { label: "Viewed", value: "viewed" },
  { label: "Quote Received", value: "quote_received" },
  { label: "Accepted", value: "accepted" },
  { label: "Rejected", value: "rejected" },
  { label: "Expired", value: "expired" },
];

const TIMELINE_ICONS: Record<string, React.ElementType> = {
  sent: Clock,
  viewed: Eye,
  quote_received: CheckCircle,
  accepted: CheckCircle,
  rejected: XCircle,
  expired: AlertCircle,
};
const TIMELINE_COLORS: Record<string, string> = {
  sent: "text-blue-500 bg-blue-50 border-blue-200",
  viewed: "text-violet-500 bg-violet-50 border-violet-200",
  quote_received: "text-emerald-500 bg-emerald-50 border-emerald-200",
  accepted: "text-emerald-500 bg-emerald-50 border-emerald-200",
  rejected: "text-red-500 bg-red-50 border-red-200",
  expired: "text-slate-400 bg-slate-50 border-slate-200",
};

export default function RFQTracker() {
  const [statusFilter, setStatusFilter] = useState("");
  const [selectedRFQId, setSelectedRFQId] = useState<string | null>(null);

  const { data: rfqs, isLoading } = useQuery({
    queryKey: ["rfqs", statusFilter],
    queryFn: () => getRFQs({ status: statusFilter || undefined }),
    refetchInterval: 5000,
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="RFQ Tracker"
        subtitle="Monitor all your Requests for Quotation"
        breadcrumb={["Buyer Portal", "RFQ Tracker"]}
        action={
          <Link
            to="/buyer/rfq/create"
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" /> New RFQ
          </Link>
        }
      />

      {/* Status filter pills */}
      <div className="flex flex-wrap gap-2">
        {STATUS_FILTERS.map((f) => (
          <button
            key={f.value}
            onClick={() => setStatusFilter(f.value)}
            className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all ${
              statusFilter === f.value
                ? "bg-indigo-600 text-white shadow-sm"
                : "bg-white border border-slate-200 text-slate-600 hover:border-slate-300"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* RFQ list */}
      {isLoading ? (
        <TableSkeleton />
      ) : rfqs?.length === 0 ? (
        <EmptyState
          icon={<Clock className="w-8 h-8" />}
          title="No RFQs found"
          description="Create your first RFQ to start receiving quotes from suppliers"
          action={<Link to="/buyer/rfq/create" className="bg-indigo-600 text-white text-sm font-medium px-4 py-2 rounded-lg">Create RFQ</Link>}
        />
      ) : (
        <div className="space-y-3">
          {rfqs?.map((rfq, i) => {
            const Icon = TIMELINE_ICONS[rfq.status] || Clock;
            const colorClass = TIMELINE_COLORS[rfq.status] || TIMELINE_COLORS.sent;

            return (
              <motion.div
                key={rfq.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.04 }}
                onClick={() => setSelectedRFQId(rfq.id)}
                className="bg-white rounded-xl border border-slate-200 p-5 hover:shadow-md hover:border-indigo-200 transition-all cursor-pointer group"
              >
                <div className="flex items-start gap-4">
                  {/* Timeline icon */}
                  <div className={`w-10 h-10 rounded-xl border flex items-center justify-center flex-shrink-0 ${colorClass}`}>
                    <Icon className="w-4.5 h-4.5" />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="text-sm font-semibold text-slate-900 group-hover:text-indigo-700 transition-colors">{rfq.productName}</h3>
                          <StatusChip status={rfq.status} />
                        </div>
                        <p className="text-xs text-slate-400 mt-0.5">{rfq.rfqNumber} · {rfq.grade}</p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-sm font-semibold text-slate-800">
                          {rfq.quantity.toLocaleString()} {rfq.quantityUnit}
                        </p>
                        <p className="text-xs text-slate-400">{formatRelativeTime(rfq.createdAt)}</p>
                      </div>
                    </div>

                    {/* Details row */}
                    <div className="flex flex-wrap items-center gap-4 mt-3 text-xs text-slate-500">
                      <span>📍 {rfq.deliveryLocation}</span>
                      <span>📅 Needed by {formatDate(rfq.deliveryDate)}</span>
                      <span>💳 {rfq.paymentTerms.replace("_", " ")}</span>
                      {rfq.quotesReceived > 0 && (
                        <span className="text-emerald-600 font-medium">✓ {rfq.quotesReceived} quote{rfq.quotesReceived !== 1 ? "s" : ""} received</span>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col items-end gap-2 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
                    {(rfq.status === "quote_received" || rfq.status === "rejected" || rfq.status === "accepted") && (
                      <div className="flex flex-col gap-2 w-full">
                        <Link
                          to={`/buyer/quotes/compare?rfqId=${rfq.id}`}
                          className="flex items-center justify-center gap-1.5 text-xs bg-indigo-600 text-white px-3 py-1.5 rounded-lg font-medium hover:bg-indigo-700 transition-colors"
                        >
                          Compare <ChevronRight className="w-3 h-3" />
                        </Link>
                        {rfq.status === "rejected" ? (
                          <button
                            onClick={(e) => { e.preventDefault(); alert("Can't chat for rejected quotes"); }}
                            className="flex items-center justify-center gap-1.5 text-xs bg-slate-100 text-slate-400 px-3 py-1.5 rounded-lg font-medium cursor-not-allowed"
                            title="Cannot chat for rejected quotes"
                          >
                            <MessageSquare className="w-3 h-3" /> Chat
                          </button>
                        ) : (
                          <Link
                            to={`/buyer/quotes/negotiate?rfqId=${rfq.id}`}
                            className="flex items-center justify-center gap-1.5 text-xs bg-indigo-100 text-indigo-700 px-3 py-1.5 rounded-lg font-medium hover:bg-indigo-200 transition-colors"
                          >
                            <MessageSquare className="w-3 h-3" /> Chat
                          </Link>
                        )}
                      </div>
                    )}
                    {(rfq.status === "viewed" || rfq.status === "sent") && (
                      <span className="flex items-center gap-1 text-xs text-slate-400">
                        <Clock className="w-3 h-3" />
                        Expires {formatDate(rfq.expiresAt)}
                      </span>
                    )}
                    <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-indigo-400 transition-colors" />
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      <RFQDetailModal
        rfqId={selectedRFQId}
        onClose={() => setSelectedRFQId(null)}
        viewerRole="buyer"
      />
    </div>
  );
}
