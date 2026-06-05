import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  X,
  Package,
  MapPin,
  Calendar,
  CreditCard,
  Clock,
  FileText,
  Users,
  TrendingDown,
  ChevronRight,
  Star,
  CheckCircle,
  XCircle,
  MessageSquare,
  Loader2,
  BarChart3,
  AlertCircle,
  Eye,
} from "lucide-react";
import { getRFQById, getQuotes } from "@/lib/mock-api";
import { formatDate, formatRelativeTime, formatCurrency } from "@/lib/utils";
import { StatusChip } from "./StatusChip";
import type { RFQ, Quote } from "@/types";

interface RFQDetailModalProps {
  rfqId: string | null;
  onClose: () => void;
  viewerRole?: "buyer" | "supplier";
}

const QUOTE_STATUS_COLORS: Record<string, string> = {
  pending: "bg-amber-50 border-amber-200 text-amber-700",
  accepted: "bg-emerald-50 border-emerald-200 text-emerald-700",
  rejected: "bg-red-50 border-red-200 text-red-700",
  negotiating: "bg-blue-50 border-blue-200 text-blue-700",
  expired: "bg-slate-50 border-slate-200 text-slate-500",
};

function QuoteCard({
  quote,
  rfq,
  viewerRole,
  onAccept,
  onReject,
  onNegotiate,
}: {
  quote: Quote;
  rfq: RFQ;
  viewerRole: "buyer" | "supplier";
  onAccept: (id: string) => void;
  onReject: (id: string) => void;
  onNegotiate: (id: string) => void;
}) {
  const belowTarget =
    rfq.targetPrice && quote.price <= rfq.targetPrice;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className={`rounded-xl border p-4 ${
        quote.status === "accepted"
          ? "border-emerald-300 bg-emerald-50/60"
          : "border-slate-200 bg-white"
      }`}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center">
            <Users className="w-4 h-4 text-indigo-600" />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-900">
              {quote.supplierName}
            </p>
            <div className="flex items-center gap-1">
              <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
              <span className="text-xs text-slate-500">
                {quote.supplierRating || "N/A"}
              </span>
              <span className="text-xs text-slate-400 ml-1">
                · {quote.quoteNumber}
              </span>
            </div>
          </div>
        </div>
        <span
          className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border capitalize ${
            QUOTE_STATUS_COLORS[quote.status] || ""
          }`}
        >
          {quote.status}
        </span>
      </div>

      {/* Price & Amount */}
      <div className="grid grid-cols-2 gap-3 mb-3">
        <div className="bg-slate-50 rounded-lg p-3">
          <p className="text-xs text-slate-500">Unit Price</p>
          <p className="text-lg font-bold text-indigo-600 mt-0.5">
            ₹{quote.price.toLocaleString("en-IN")}
            <span className="text-xs font-normal text-slate-400">
              /{quote.priceUnit}
            </span>
          </p>
          {belowTarget && (
            <span className="text-[10px] text-emerald-600 font-medium flex items-center gap-0.5 mt-0.5">
              <TrendingDown className="w-3 h-3" /> Below target
            </span>
          )}
        </div>
        <div className="bg-slate-50 rounded-lg p-3">
          <p className="text-xs text-slate-500">Total Amount</p>
          <p className="text-lg font-bold text-slate-800 mt-0.5">
            {formatCurrency(quote.totalAmount)}
          </p>
          <p className="text-[10px] text-slate-400">
            {quote.quantity.toLocaleString()} {quote.quantityUnit}
          </p>
        </div>
      </div>

      {/* Details grid */}
      <div className="grid grid-cols-3 gap-2 mb-3">
        <div className="text-center bg-white border border-slate-100 rounded-lg py-2">
          <p className="text-[10px] text-slate-400">Lead Time</p>
          <p className="text-xs font-semibold text-slate-700 mt-0.5">
            {quote.leadTimeDays}d
          </p>
        </div>
        <div className="text-center bg-white border border-slate-100 rounded-lg py-2">
          <p className="text-[10px] text-slate-400">Payment</p>
          <p className="text-xs font-semibold text-slate-700 mt-0.5 truncate px-1">
            {quote.paymentTerms}
          </p>
        </div>
        <div className="text-center bg-white border border-slate-100 rounded-lg py-2">
          <p className="text-[10px] text-slate-400">Logistics</p>
          <p className="text-xs font-semibold text-slate-700 mt-0.5 uppercase">
            {quote.logisticsTerms.replace("_", " ")}
          </p>
        </div>
      </div>

      {quote.notes && (
        <p className="text-xs text-slate-500 bg-slate-50 rounded-lg px-3 py-2 border border-slate-100 mb-3 leading-relaxed">
          <span className="font-medium text-slate-600">Note:</span> {quote.notes}
        </p>
      )}

      <p className="text-[10px] text-slate-400 mb-3">
        Valid until {formatDate(quote.validUntil)} · Submitted{" "}
        {formatRelativeTime(quote.createdAt)}
      </p>

      {/* Buyer Actions */}
      {viewerRole === "buyer" && quote.status === "pending" && (
        <div className="flex gap-2">
          <button
            onClick={() => onAccept(quote.id)}
            className="flex-1 flex items-center justify-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium py-2 rounded-lg transition-colors"
          >
            <CheckCircle className="w-3.5 h-3.5" /> Accept
          </button>
          <button
            onClick={() => onNegotiate(quote.id)}
            className="flex-1 flex items-center justify-center gap-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-medium py-2 rounded-lg transition-colors"
          >
            <MessageSquare className="w-3.5 h-3.5" /> Negotiate
          </button>
          <button
            onClick={() => onReject(quote.id)}
            className="flex items-center justify-center gap-1.5 border border-slate-200 hover:bg-red-50 hover:border-red-200 hover:text-red-600 text-slate-500 text-xs font-medium py-2 px-3 rounded-lg transition-colors"
          >
            <XCircle className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
      {viewerRole === "buyer" && quote.status === "accepted" && (
        <div className="flex items-center gap-1.5 text-emerald-600 text-xs font-medium">
          <CheckCircle className="w-4 h-4" /> Quote Accepted
        </div>
      )}
    </motion.div>
  );
}

export function RFQDetailModal({
  rfqId,
  onClose,
  viewerRole = "buyer",
}: RFQDetailModalProps) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: rfq, isLoading: rfqLoading } = useQuery({
    queryKey: ["rfq", rfqId],
    queryFn: () => getRFQById(rfqId!),
    enabled: !!rfqId,
  });

  const { data: quotes, isLoading: quotesLoading } = useQuery({
    queryKey: ["quotes", rfqId],
    queryFn: () => getQuotes({ rfqId: rfqId! }),
    enabled: !!rfqId,
  });

  const updateQuoteMutation = useMutation({
    mutationFn: async ({
      quoteId,
      status,
    }: {
      quoteId: string;
      status: string;
    }) => {
      const res = await fetch(`/api/quotes/${quoteId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error("Failed to update quote");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["quotes", rfqId] });
      queryClient.invalidateQueries({ queryKey: ["rfqs"] });
    },
  });

  const handleAccept = (quoteId: string) =>
    updateQuoteMutation.mutate({ quoteId, status: "accepted" });
  const handleReject = (quoteId: string) =>
    updateQuoteMutation.mutate({ quoteId, status: "rejected" });
  const handleNegotiate = (quoteId: string) => {
    onClose();
    navigate(`/buyer/quotes/negotiate?quoteId=${quoteId}&rfqId=${rfqId}`);
  };

  const isLoading = rfqLoading || quotesLoading;

  return (
    <AnimatePresence>
      {rfqId && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
          />

          {/* Drawer */}
          <motion.div
            key="drawer"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 260 }}
            className="fixed right-0 top-0 h-full w-full max-w-xl bg-slate-50 z-50 flex flex-col shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 bg-white border-b border-slate-200 flex-shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-indigo-100 flex items-center justify-center">
                  <Package className="w-4.5 h-4.5 text-indigo-600" />
                </div>
                <div>
                  <p className="text-xs text-slate-400 font-medium">
                    {rfq?.rfqNumber || "Loading..."}
                  </p>
                  <h2 className="text-base font-bold text-slate-900 leading-tight">
                    {rfq?.productName || "RFQ Details"}
                  </h2>
                </div>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Scrollable body */}
            <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
              {isLoading ? (
                <div className="flex items-center justify-center py-20 text-indigo-500">
                  <Loader2 className="w-8 h-8 animate-spin" />
                </div>
              ) : !rfq ? (
                <div className="flex flex-col items-center justify-center py-20 text-slate-400">
                  <AlertCircle className="w-10 h-10 mb-3" />
                  <p>RFQ not found</p>
                </div>
              ) : (
                <>
                  {/* Status banner */}
                  <div className="flex items-center justify-between bg-white rounded-xl border border-slate-200 px-4 py-3">
                    <StatusChip status={rfq.status} />
                    <div className="text-right">
                      <p className="text-xs text-slate-400">Quotes Received</p>
                      <p className="text-xl font-bold text-indigo-600">
                        {rfq.quotesReceived}
                      </p>
                    </div>
                  </div>

                  {/* RFQ Details */}
                  <div className="bg-white rounded-xl border border-slate-200 divide-y divide-slate-100">
                    <div className="px-5 py-3">
                      <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">
                        Product Details
                      </p>
                      <div className="space-y-2.5">
                        <DetailRow
                          icon={<Package className="w-3.5 h-3.5" />}
                          label="Product"
                          value={rfq.productName}
                        />
                        {rfq.casNumber && (
                          <DetailRow
                            icon={<FileText className="w-3.5 h-3.5" />}
                            label="CAS Number"
                            value={rfq.casNumber}
                          />
                        )}
                        {rfq.grade && (
                          <DetailRow
                            icon={<BarChart3 className="w-3.5 h-3.5" />}
                            label="Grade"
                            value={rfq.grade}
                          />
                        )}
                        <DetailRow
                          icon={<Package className="w-3.5 h-3.5" />}
                          label="Quantity"
                          value={`${rfq.quantity.toLocaleString()} ${rfq.quantityUnit}`}
                          highlight
                        />
                        {rfq.targetPrice && (
                          <DetailRow
                            icon={<TrendingDown className="w-3.5 h-3.5" />}
                            label="Target Price"
                            value={`₹${rfq.targetPrice}/${rfq.quantityUnit}`}
                            highlight
                          />
                        )}
                      </div>
                    </div>

                    <div className="px-5 py-3">
                      <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">
                        Delivery & Terms
                      </p>
                      <div className="space-y-2.5">
                        <DetailRow
                          icon={<MapPin className="w-3.5 h-3.5" />}
                          label="Delivery Location"
                          value={rfq.deliveryLocation}
                        />
                        <DetailRow
                          icon={<Calendar className="w-3.5 h-3.5" />}
                          label="Required By"
                          value={formatDate(rfq.deliveryDate)}
                        />
                        <DetailRow
                          icon={<CreditCard className="w-3.5 h-3.5" />}
                          label="Payment Terms"
                          value={rfq.paymentTerms.replace(/_/g, " ")}
                        />
                        <DetailRow
                          icon={<Clock className="w-3.5 h-3.5" />}
                          label="Posted"
                          value={formatRelativeTime(rfq.createdAt)}
                        />
                        <DetailRow
                          icon={<Clock className="w-3.5 h-3.5" />}
                          label="Expires"
                          value={formatDate(rfq.expiresAt)}
                        />
                      </div>
                    </div>

                    {rfq.notes && (
                      <div className="px-5 py-3">
                        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">
                          Notes
                        </p>
                        <p className="text-sm text-slate-600 leading-relaxed">
                          {rfq.notes}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Quotes Section */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-sm font-bold text-slate-800">
                        Quotes Received ({quotes?.length || 0})
                      </h3>
                      {viewerRole === "buyer" &&
                        (quotes?.length || 0) > 1 && (
                          <button
                            onClick={() => {
                              onClose();
                              navigate(
                                `/buyer/quotes/compare?rfqId=${rfqId}`
                              );
                            }}
                            className="flex items-center gap-1 text-xs text-indigo-600 font-medium hover:text-indigo-700"
                          >
                            Compare all{" "}
                            <ChevronRight className="w-3.5 h-3.5" />
                          </button>
                        )}
                    </div>

                    {quotesLoading ? (
                      <div className="flex justify-center py-8 text-indigo-400">
                        <Loader2 className="w-6 h-6 animate-spin" />
                      </div>
                    ) : quotes && quotes.length > 0 ? (
                      <div className="space-y-3">
                        {quotes.map((quote) => (
                          <QuoteCard
                            key={quote.id}
                            quote={quote}
                            rfq={rfq}
                            viewerRole={viewerRole}
                            onAccept={handleAccept}
                            onReject={handleReject}
                            onNegotiate={handleNegotiate}
                          />
                        ))}
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center py-10 bg-white rounded-xl border border-slate-200 text-slate-400">
                        <Eye className="w-8 h-8 mb-2" />
                        <p className="text-sm font-medium text-slate-500">
                          No quotes yet
                        </p>
                        <p className="text-xs text-slate-400 mt-1">
                          Suppliers will respond here
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Supplier: Submit Quote CTA */}
                  {viewerRole === "supplier" &&
                    (rfq.status === "sent" || rfq.status === "viewed") && (
                      <button
                        onClick={() => {
                          onClose();
                          navigate(
                            `/supplier/quotes?rfqId=${rfqId}`
                          );
                        }}
                        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-xl transition-colors flex items-center justify-center gap-2 text-sm"
                      >
                        Submit Quote <ChevronRight className="w-4 h-4" />
                      </button>
                    )}
                </>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

function DetailRow({
  icon,
  label,
  value,
  highlight,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <div className="flex items-center gap-2 text-slate-400 min-w-0">
        {icon}
        <span className="text-xs text-slate-500 truncate">{label}</span>
      </div>
      <span
        className={`text-xs font-medium text-right ${
          highlight ? "text-indigo-700 font-semibold" : "text-slate-700"
        }`}
      >
        {value}
      </span>
    </div>
  );
}
