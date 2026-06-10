import { useState, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { CheckCircle, ArrowLeft, FlaskConical, Paperclip, X } from "lucide-react";
import { rfqSchema, type RFQInput } from "@/lib/validations";
import { PageHeader, SectionCard } from "@/components/shared/UIHelpers";
import { createRFQ, parseRfqText } from "@/lib/mock-api";
import { useQueryClient } from "@tanstack/react-query";

export default function CreateRFQ() {
  const queryClient = useQueryClient();
  const [searchParams] = useSearchParams();
  const [submitted, setSubmitted] = useState(false);
  const [aiPrompt, setAiPrompt] = useState("");
  const [isParsing, setIsParsing] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  const { register, handleSubmit, setValue, formState: { errors, isSubmitting } } = useForm<RFQInput>({
    resolver: zodResolver(rfqSchema),
    defaultValues: {
      productName: searchParams.get("product") || "",
      quantityUnit: "kg",
      paymentTerms: "net_30",
      dispatchMethod: "auto",
      expiryDays: 7,
    },
  });

  const onSubmit = async (data: RFQInput) => {
    // We mock the buyerId and buyerName since we don't have real auth state attached to this form right now
    await createRFQ({
      ...data,
      buyerId: "b1",
      buyerName: "O3 Demo Buyer",
      casNumber: data.casNumber || "",
      notes: data.notes || "",
    });
    queryClient.invalidateQueries({ queryKey: ["rfqs"] });
    queryClient.invalidateQueries({ queryKey: ["open-rfqs"] });
    setSubmitted(true);
  };

  const handleAiFill = async () => {
    if (!aiPrompt && !selectedFile) return;
    setIsParsing(true);
    try {
      let fileData: { data: string, mimeType: string } | undefined = undefined;
      if (selectedFile) {
        const reader = new FileReader();
        const base64Promise = new Promise<string>((resolve) => {
          reader.onload = () => resolve((reader.result as string).split(',')[1]);
        });
        reader.readAsDataURL(selectedFile);
        const base64Data = await base64Promise;
        fileData = { data: base64Data, mimeType: selectedFile.type };
      }

      const parsed = await parseRfqText(aiPrompt, fileData);
      if (parsed.productName) setValue("productName", parsed.productName, { shouldValidate: true });
      if (parsed.grade) setValue("grade", parsed.grade, { shouldValidate: true });
      if (parsed.casNumber) setValue("casNumber", parsed.casNumber, { shouldValidate: true });
      if (parsed.quantity) setValue("quantity", parsed.quantity, { shouldValidate: true });
      if (parsed.quantityUnit) setValue("quantityUnit", parsed.quantityUnit, { shouldValidate: true });
      if (parsed.targetPrice) setValue("targetPrice", parsed.targetPrice, { shouldValidate: true });
      if (parsed.paymentTerms) setValue("paymentTerms", parsed.paymentTerms, { shouldValidate: true });
      if (parsed.notes) setValue("notes", parsed.notes, { shouldValidate: true });
      if (parsed.deliveryLocation) setValue("deliveryLocation", parsed.deliveryLocation, { shouldValidate: true });
      if (parsed.deliveryDate) setValue("deliveryDate", parsed.deliveryDate, { shouldValidate: true });
    } catch (err) {
      console.error("AI parse failed", err);
    } finally {
      setIsParsing(false);
    }
  };

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
          <h2 className="text-xl font-bold text-slate-900 mb-2">RFQ Created!</h2>
          <p className="text-slate-500 text-sm mb-6">
            Your RFQ has been sent to matching verified suppliers. You'll receive quotes within 24-48 hours.
          </p>
          <div className="flex gap-3">
            <button
              onClick={() => navigate("/buyer/rfq/tracker")}
              className="flex-1 bg-indigo-600 text-white font-medium py-2.5 rounded-xl text-sm hover:bg-indigo-700 transition-colors"
            >
              Track RFQ
            </button>
            <button
              onClick={() => setSubmitted(false)}
              className="flex-1 border border-slate-200 text-slate-600 font-medium py-2.5 rounded-xl text-sm hover:bg-slate-50"
            >
              Create Another
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl space-y-6">
      <PageHeader
        title="Create RFQ"
        subtitle="Send a Request for Quotation to suppliers"
        breadcrumb={["Buyer Portal", "RFQ Tracker", "Create RFQ"]}
        action={
          <button onClick={() => navigate(-1)} className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700">
            <ArrowLeft className="w-4 h-4" /> Back
          </button>
        }
      />

      <SectionCard title="AI Copilot" className="mb-4 border-indigo-200 bg-indigo-50/30">
        <div className="flex flex-col gap-3">
          <div className="flex gap-3 items-start">
            <div className="flex-1 relative">
              <textarea 
                value={aiPrompt}
                onChange={e => setAiPrompt(e.target.value)}
                placeholder="e.g. I need 50 MT of Titanium Dioxide delivered to Mumbai next week. Or attach a document..."
                className="w-full px-4 py-2.5 border border-indigo-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none pr-12"
                rows={2}
              />
              <button 
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute right-3 bottom-3 text-indigo-400 hover:text-indigo-600 transition-colors"
                title="Attach Document"
              >
                <Paperclip className="w-5 h-5" />
              </button>
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={(e) => e.target.files && setSelectedFile(e.target.files[0])}
                className="hidden" 
                accept="application/pdf,image/*,.doc,.docx"
              />
            </div>
            <button 
              type="button"
              onClick={handleAiFill}
              disabled={isParsing || (!aiPrompt && !selectedFile)}
              className="bg-indigo-600 text-white px-4 py-2.5 rounded-lg text-sm font-semibold hover:bg-indigo-700 disabled:bg-indigo-300 transition-colors flex items-center shrink-0 h-[62px]"
            >
              {isParsing ? "Analyzing..." : "Auto-Fill with AI"}
            </button>
          </div>
          {selectedFile && (
            <div className="flex items-center gap-2 text-sm text-slate-600 bg-white/60 px-3 py-1.5 rounded-lg border border-indigo-100 w-fit">
              <span className="truncate max-w-[200px] font-medium">{selectedFile.name}</span>
              <button type="button" onClick={() => setSelectedFile(null)} className="text-slate-400 hover:text-rose-500">
                <X className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </SectionCard>

      <form onSubmit={handleSubmit(onSubmit)}>
        <SectionCard title="Product Details" className="mb-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Product Name *</label>
              <input
                {...register("productName")}
                placeholder="e.g. Titanium Dioxide (Rutile Grade)"
                className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              {errors.productName && <p className="text-xs text-rose-500 mt-1">{errors.productName.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">CAS Number</label>
              <input
                {...register("casNumber")}
                placeholder="e.g. 13463-67-7"
                className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Grade *</label>
              <input
                {...register("grade")}
                placeholder="e.g. Technical, USP, BP, Food Grade"
                className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              {errors.grade && <p className="text-xs text-rose-500 mt-1">{errors.grade.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Quantity *</label>
              <input
                {...register("quantity", { valueAsNumber: true })}
                type="number"
                placeholder="e.g. 500"
                className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              {errors.quantity && <p className="text-xs text-rose-500 mt-1">{errors.quantity.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Unit *</label>
              <select
                {...register("quantityUnit")}
                className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
              >
                <option value="kg">KG</option>
                <option value="mt">MT</option>
                <option value="litre">Litre</option>
                <option value="drum">Drum</option>
                <option value="bag">Bag</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Target Price (₹)</label>
              <input
                {...register("targetPrice", { valueAsNumber: true })}
                type="number"
                placeholder="Optional — helps filter quotes"
                className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>
        </SectionCard>

        <SectionCard title="Delivery Requirements" className="mb-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Required by Date *</label>
              <input
                {...register("deliveryDate")}
                type="date"
                className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              {errors.deliveryDate && <p className="text-xs text-rose-500 mt-1">{errors.deliveryDate.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Delivery Location *</label>
              <input
                {...register("deliveryLocation")}
                placeholder="e.g. Mumbai, Maharashtra"
                className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              {errors.deliveryLocation && <p className="text-xs text-rose-500 mt-1">{errors.deliveryLocation.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Payment Terms *</label>
              <select
                {...register("paymentTerms")}
                className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
              >
                <option value="advance">100% Advance</option>
                <option value="net_30">Net 30 Days</option>
                <option value="net_60">Net 60 Days</option>
                <option value="lc">Letter of Credit</option>
                <option value="cad">Cash Against Documents</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Additional Notes</label>
              <textarea
                {...register("notes")}
                rows={3}
                placeholder="Any specific requirements, certifications needed, packaging instructions..."
                className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
              />
            </div>
          </div>
        </SectionCard>

        <SectionCard title="Dispatch Settings" className="mb-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Supplier Selection *</label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
                  <input type="radio" value="auto" {...register("dispatchMethod")} className="text-indigo-600 focus:ring-indigo-500" />
                  Auto-match (AI Recommended)
                </label>
                <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
                  <input type="radio" value="shortlist" {...register("dispatchMethod")} className="text-indigo-600 focus:ring-indigo-500" />
                  Select from Shortlist
                </label>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">RFQ Expiry *</label>
              <select
                {...register("expiryDays", { valueAsNumber: true })}
                className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
              >
                <option value={2}>48 Hours</option>
                <option value={3}>72 Hours</option>
                <option value={7}>7 Days</option>
              </select>
            </div>
          </div>
        </SectionCard>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="px-6 py-2.5 border border-slate-200 text-slate-600 rounded-xl text-sm font-medium hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex-1 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-semibold py-2.5 rounded-xl transition-colors flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <><FlaskConical className="w-4 h-4" /> Create & Send RFQ</>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
