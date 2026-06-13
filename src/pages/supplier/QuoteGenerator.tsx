import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { CheckCircle, Send, Loader2 } from "lucide-react";
import { quoteSchema, type QuoteInput } from "@/lib/validations";
import { PageHeader, SectionCard } from "@/components/shared/UIHelpers";
import { createQuote, getRFQById, getProducts } from "@/lib/mock-api";
import { useQuery, useQueryClient } from "@tanstack/react-query";

export default function QuoteGenerator() {
  const queryClient = useQueryClient();
  const [searchParams] = useSearchParams();
  const rfqId = searchParams.get("rfqId") || "";
  const [submitted, setSubmitted] = useState(false);
  const navigate = useNavigate();

  const editMode = searchParams.get("edit") === "true";

  const { data: rfq, isLoading: rfqLoading } = useQuery({
    queryKey: ["rfq", rfqId],
    queryFn: () => getRFQById(rfqId),
    enabled: !!rfqId,
  });

  const { data: quotes, isLoading: quotesLoading } = useQuery({
    queryKey: ["quotes", rfqId],
    queryFn: () => import("@/lib/mock-api").then(m => m.getQuotes({ rfqId })),
    enabled: !!rfqId && editMode,
  });

  const existingQuote = quotes?.[0];

  const { data: matchingProducts } = useQuery({
    queryKey: ["products", rfq?.productName],
    queryFn: () => getProducts({ search: rfq?.productName }),
    enabled: !!rfq?.productName,
  });

  const { register, handleSubmit, watch, setValue, formState: { errors, isSubmitting } } = useForm<QuoteInput>({
    resolver: zodResolver(quoteSchema),
    defaultValues: {
      logisticsTerms: "ex_works",
      validityDays: 14,
    },
  });

  useEffect(() => {
    if (rfq) {
      setValue("quantity", rfq.quantity);
      
      if (editMode && existingQuote) {
        setValue("price", existingQuote.price);
        setValue("leadTimeDays", existingQuote.leadTimeDays);
        setValue("validityDays", existingQuote.validityDays);
        setValue("paymentTerms", existingQuote.paymentTerms);
        setValue("logisticsTerms", existingQuote.logisticsTerms as "ex_works" | "fob" | "cif" | "door_delivery");
        setValue("notes", existingQuote.notes || "");
      } else if (!editMode && matchingProducts && matchingProducts.length > 0) {
        // Pre-fill price and lead time from the first matching product
        const match = matchingProducts[0];
        setValue("price", match.price);
        setValue("leadTimeDays", match.leadTimeDays);
      }
    }
  }, [rfq, matchingProducts, existingQuote, editMode, setValue]);

  const price = watch("price");
  const quantity = rfq?.quantity || 0;
  const totalAmount = price && quantity ? price * quantity : 0;

  const onSubmit = async (data: QuoteInput) => {
    if (!rfq) return;
    await createQuote({
      ...data,
      rfqId,
      supplierId: "s1",
      supplierName: "O3 Demo Supplier",
      priceUnit: rfq.quantityUnit, // Assume price matches requested unit
      totalAmount,
      quantity: rfq.quantity,
      quantityUnit: rfq.quantityUnit,
      validUntil: new Date(Date.now() + (data.validityDays * 24 * 60 * 60 * 1000)).toISOString()
    });
    queryClient.invalidateQueries({ queryKey: ["supplier-quotes"] });
    queryClient.invalidateQueries({ queryKey: ["rfqs-inbox"] });
    queryClient.invalidateQueries({ queryKey: ["supplier-stats"] });
    setSubmitted(true);
  };

  if (rfqLoading || (editMode && quotesLoading)) {
    return (
      <div className="flex items-center justify-center py-20 text-indigo-600">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  if (!rfq) {
    return <div className="p-10 text-center text-slate-500">RFQ not found.</div>;
  }

  if (submitted) {
    return (
      <div className="max-w-md mx-auto">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-white rounded-2xl border border-slate-200 shadow-lg p-10 text-center"
        >
          <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-emerald-600" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 mb-2">Quote Submitted!</h2>
          <p className="text-slate-500 text-sm mb-6">
            Your quote has been sent to {rfq.buyerName}. You'll be notified of their decision.
          </p>
          <div className="flex gap-3">
            <button onClick={() => navigate("/supplier/rfq-inbox")} className="flex-1 bg-indigo-600 text-white font-medium py-2.5 rounded-xl text-sm">
              Back to Inbox
            </button>
            <button onClick={() => setSubmitted(false)} className="flex-1 border border-slate-200 text-slate-600 font-medium py-2.5 rounded-xl text-sm">
              New Quote
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl space-y-6">
      <PageHeader
        title="Quote Generator"
        subtitle="Submit your quote for an RFQ"
        breadcrumb={["Supplier Portal", "Quote Generator"]}
      />

      {/* RFQ Context */}
      <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-4">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs text-indigo-500 font-medium">{rfq.rfqNumber}</p>
            <h2 className="text-base font-semibold text-indigo-900">{rfq.productName}</h2>
            <p className="text-sm text-indigo-600 mt-0.5">
              {rfq.quantity.toLocaleString()} {rfq.quantityUnit} {rfq.grade && `· ${rfq.grade}`}
            </p>
            <p className="text-xs text-indigo-500 mt-1">Buyer: {rfq.buyerName}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-indigo-500">Target Price</p>
            <p className="text-xl font-bold text-indigo-700">
              {rfq.targetPrice ? `₹${rfq.targetPrice}/${rfq.quantityUnit}` : "Not specified"}
            </p>
            <p className="text-xs text-indigo-500">Deliver by {rfq.deliveryDate}</p>
          </div>
        </div>
        {rfq.notes && (
          <p className="mt-3 text-xs text-indigo-600 bg-indigo-100 rounded-lg px-3 py-2">
            <strong>Buyer notes:</strong> {rfq.notes}
          </p>
        )}
      </div>

      {/* Quote Form */}
      <form onSubmit={handleSubmit(onSubmit)}>
        {/* Hidden field for quantity to satisfy Zod schema */}
        <input type="hidden" {...register("quantity", { valueAsNumber: true })} />
        
        <SectionCard title="Pricing & Terms" className="mb-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Unit Price (₹) *</label>
              <input
                {...register("price", { valueAsNumber: true })}
                type="number"
                step="0.01"
                placeholder={rfq.targetPrice ? `Target: ₹${rfq.targetPrice}` : "Enter unit price"}
                className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              {errors.price && <p className="text-xs text-rose-500 mt-1">{errors.price.message}</p>}
            </div>

            <div className="bg-slate-50 rounded-lg p-4 flex flex-col justify-center">
              <p className="text-xs text-slate-500">Estimated Order Value</p>
              <p className="text-2xl font-bold text-indigo-600 mt-1">
                {totalAmount > 0 ? `₹${totalAmount.toLocaleString("en-IN")}` : "—"}
              </p>
              <p className="text-xs text-slate-400">{rfq.quantity.toLocaleString()} × {price || 0} {rfq.quantityUnit}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Lead Time (days) *</label>
              <input
                {...register("leadTimeDays", { valueAsNumber: true })}
                type="number"
                placeholder="e.g. 7"
                className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              {errors.leadTimeDays && <p className="text-xs text-rose-500 mt-1">{errors.leadTimeDays.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Quote Validity (days) *</label>
              <input
                {...register("validityDays", { valueAsNumber: true })}
                type="number"
                placeholder="e.g. 14"
                className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              {errors.validityDays && <p className="text-xs text-rose-500 mt-1">{errors.validityDays.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Payment Terms *</label>
              <select
                {...register("paymentTerms")}
                className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
              >
                <option value="">Select payment terms</option>
                <option value="100% Advance">100% Advance</option>
                <option value="Net 30 days">Net 30 days</option>
                <option value="Net 45 days">Net 45 days</option>
                <option value="Net 60 days">Net 60 days</option>
                <option value="LC at sight">Letter of Credit (Sight)</option>
              </select>
              {errors.paymentTerms && <p className="text-xs text-rose-500 mt-1">{errors.paymentTerms.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Logistics Terms *</label>
              <select
                {...register("logisticsTerms")}
                className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
              >
                <option value="ex_works">Ex Works (EXW)</option>
                <option value="door_delivery">Door Delivery</option>
                <option value="cif">CIF</option>
                <option value="fob">FOB</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Additional Notes</label>
              <textarea
                {...register("notes")}
                rows={3}
                placeholder="Mention any special capabilities, certifications, or terms..."
                className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
              />
            </div>
          </div>
        </SectionCard>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-semibold py-3 rounded-xl transition-colors flex items-center justify-center gap-2"
        >
          {isSubmitting ? (
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <><Send className="w-4 h-4" /> {editMode ? "Resend Quote" : "Submit Quote"}</>
          )}
        </button>
      </form>
    </div>
  );
}
