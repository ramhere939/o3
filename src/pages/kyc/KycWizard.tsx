import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Building2, FileText, Upload, CheckCircle, ChevronRight,
  AlertCircle, X, Zap
} from "lucide-react";
import { kycStep1Schema, kycStep2Schema } from "@/lib/validations";

const steps = [
  { label: "Business Info", icon: Building2 },
  { label: "GST Details", icon: FileText },
  { label: "Documents", icon: Upload },
  { label: "Review", icon: CheckCircle },
];

const docs = [
  { id: "gst_certificate", label: "GST Certificate", required: true, hint: "Upload GST registration certificate" },
  { id: "pan_card", label: "PAN Card", required: true, hint: "Business PAN card scan" },
  { id: "coi", label: "Certificate of Incorporation", required: false, hint: "For Pvt Ltd / LLP / Public Ltd only" },
];

export default function KycWizard() {
  const [step, setStep] = useState(0);
  const [uploads, setUploads] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const navigate = useNavigate();

  const form1 = useForm({ resolver: zodResolver(kycStep1Schema) });
  const form2 = useForm({ resolver: zodResolver(kycStep2Schema) });

  const handleFileUpload = (docId: string, file: File) => {
    setUploads((prev) => ({ ...prev, [docId]: file.name }));
  };

  const handleSubmit = async () => {
    setSubmitted(true);
    await new Promise((r) => setTimeout(r, 2000));
    navigate("/buyer/dashboard");
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-slate-50 flex items-center justify-center">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center max-w-sm mx-auto px-4"
        >
          <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-10 h-10 text-emerald-600" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 mb-2">KYC Submitted Successfully!</h2>
          <p className="text-slate-500 text-sm">
            You are now verified and can access all platform features.
          </p>
          <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
            <p className="text-xs text-amber-700">Redirecting to dashboard...</p>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-slate-50 py-10 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 mb-3">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <span className="text-xl font-bold text-slate-900">O3 KYC Verification</span>
          </div>
          <p className="text-slate-500 text-sm">Complete your KYC to unlock all platform features</p>
        </div>

        {/* Stepper */}
        <div className="flex items-center gap-0 mb-8">
          {steps.map((s, i) => {
            const Icon = s.icon;
            return (
              <div key={i} className="flex items-center flex-1">
                <div className="flex flex-col items-center flex-1">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                    i < step ? "bg-indigo-600 text-white" :
                    i === step ? "bg-indigo-600 text-white ring-4 ring-indigo-100" :
                    "bg-slate-100 text-slate-400"
                  }`}>
                    {i < step ? <CheckCircle className="w-5 h-5" /> : <Icon className="w-5 h-5" />}
                  </div>
                  <span className={`text-xs mt-1.5 font-medium text-center ${i === step ? "text-indigo-600" : i < step ? "text-slate-600" : "text-slate-400"}`}>
                    {s.label}
                  </span>
                </div>
                {i < steps.length - 1 && (
                  <div className={`h-0.5 flex-1 mb-5 transition-all ${i < step ? "bg-indigo-600" : "bg-slate-200"}`} />
                )}
              </div>
            );
          })}
        </div>

        {/* Step content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            transition={{ duration: 0.25 }}
            className="bg-white rounded-2xl shadow-lg border border-slate-100 p-8"
          >
            {/* Step 1: Business Info */}
            {step === 0 && (
              <form onSubmit={form1.handleSubmit(() => setStep(1))}>
                <h2 className="text-lg font-semibold text-slate-900 mb-1">Business Information</h2>
                <p className="text-sm text-slate-500 mb-6">Basic details about your company</p>
                <div className="grid grid-cols-1 gap-4">
                  {[
                    { name: "businessName", label: "Legal Business Name", placeholder: "As per GST registration" },
                    { name: "businessType", label: "Business Type", type: "select", options: [
                      { value: "pvt_ltd", label: "Private Limited" },
                      { value: "llp", label: "LLP" },
                      { value: "partnership", label: "Partnership" },
                      { value: "proprietorship", label: "Proprietorship" },
                      { value: "public_ltd", label: "Public Limited" },
                    ]},
                    { name: "incorporationDate", label: "Incorporation Date", type: "date" },
                    { name: "registeredAddress", label: "Registered Address", placeholder: "Complete registered address" },
                    { name: "annualTurnover", label: "Annual Turnover (₹)", type: "select", options: [
                      { value: "upto_1cr", label: "Up to ₹1 Crore" },
                      { value: "1cr_5cr", label: "₹1 - 5 Crore" },
                      { value: "5cr_25cr", label: "₹5 - 25 Crore" },
                      { value: "above_25cr", label: "Above ₹25 Crore" },
                    ]},
                    { name: "website", label: "Website (Optional)", placeholder: "https://yourcompany.com" },
                  ].map((field) => (
                    <div key={field.name}>
                      <label className="block text-sm font-medium text-slate-700 mb-1.5">{field.label}</label>
                      {field.type === "select" ? (
                        <select
                          {...form1.register(field.name as any)}
                          className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                        >
                          <option value="">Select...</option>
                          {field.options?.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                        </select>
                      ) : (
                        <input
                          {...form1.register(field.name as any)}
                          type={field.type || "text"}
                          placeholder={field.placeholder}
                          className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                      )}
                    </div>
                  ))}
                </div>
                <div className="flex justify-end mt-6">
                  <button type="submit" className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2.5 px-6 rounded-xl transition-colors">
                    Continue <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </form>
            )}

            {/* Step 2: GST Details */}
            {step === 1 && (
              <form onSubmit={form2.handleSubmit(() => setStep(2))}>
                <h2 className="text-lg font-semibold text-slate-900 mb-1">GST & Financial Details</h2>
                <p className="text-sm text-slate-500 mb-6">Tax and banking information for compliance</p>
                <div className="grid grid-cols-1 gap-4">
                  {[
                    { name: "gstin", label: "GSTIN", placeholder: "27AABHP1234A1Z2" },
                    { name: "panNumber", label: "PAN Number", placeholder: "AABHP1234A" },
                    { name: "gstRegistrationDate", label: "GST Registration Date", type: "date" },
                    { name: "gstType", label: "GST Registration Type", type: "select", options: [
                      { value: "regular", label: "Regular" },
                      { value: "composition", label: "Composition Scheme" },
                      { value: "sez", label: "SEZ Unit" },
                    ]},
                    { name: "bankName", label: "Bank Name", placeholder: "State Bank of India" },
                    { name: "bankAccountNumber", label: "Bank Account Number", placeholder: "Account number" },
                    { name: "ifscCode", label: "IFSC Code", placeholder: "SBIN0001234" },
                  ].map((field) => (
                    <div key={field.name}>
                      <label className="block text-sm font-medium text-slate-700 mb-1.5">{field.label}</label>
                      {field.type === "select" ? (
                        <select
                          {...form2.register(field.name as any)}
                          className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                        >
                          <option value="">Select...</option>
                          {field.options?.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                        </select>
                      ) : (
                        <input
                          {...form2.register(field.name as any)}
                          type={field.type || "text"}
                          placeholder={field.placeholder}
                          className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                      )}
                    </div>
                  ))}
                </div>
                <div className="flex justify-between mt-6">
                  <button type="button" onClick={() => setStep(0)} className="text-slate-600 border border-slate-200 px-6 py-2.5 rounded-xl text-sm font-medium hover:bg-slate-50">Back</button>
                  <button type="submit" className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2.5 px-6 rounded-xl">
                    Continue <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </form>
            )}

            {/* Step 3: Document Upload */}
            {step === 2 && (
              <div>
                <h2 className="text-lg font-semibold text-slate-900 mb-1">Document Upload</h2>
                <p className="text-sm text-slate-500 mb-6">Upload required business documents for verification</p>
                <div className="space-y-4">
                  {docs.map((doc) => (
                    <div key={doc.id} className="border border-slate-200 rounded-xl p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-slate-800">{doc.label}</span>
                            {doc.required && (
                              <span className="text-[10px] bg-rose-100 text-rose-600 px-1.5 py-0.5 rounded-full font-medium">Required</span>
                            )}
                          </div>
                          <p className="text-xs text-slate-500 mt-0.5">{doc.hint}</p>
                        </div>
                        {uploads[doc.id] && (
                          <button onClick={() => setUploads((p) => { const n = {...p}; delete n[doc.id]; return n; })} className="text-slate-400 hover:text-rose-500">
                            <X className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                      {uploads[doc.id] ? (
                        <div className="flex items-center gap-2 p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
                          <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                          <span className="text-sm text-emerald-700 truncate">{uploads[doc.id]}</span>
                        </div>
                      ) : (
                        <label className="flex flex-col items-center justify-center gap-2 p-6 border-2 border-dashed border-slate-200 rounded-lg hover:border-indigo-400 hover:bg-indigo-50/30 cursor-pointer transition-all">
                          <Upload className="w-6 h-6 text-slate-400" />
                          <span className="text-sm text-slate-500">Click to upload or drag & drop</span>
                          <span className="text-xs text-slate-400">PDF, JPG, PNG up to 5MB</span>
                          <input
                            type="file"
                            className="hidden"
                            accept=".pdf,.jpg,.png"
                            onChange={(e) => e.target.files?.[0] && handleFileUpload(doc.id, e.target.files[0])}
                          />
                        </label>
                      )}
                    </div>
                  ))}
                </div>
                <div className="flex justify-between mt-6">
                  <button onClick={() => setStep(1)} className="text-slate-600 border border-slate-200 px-6 py-2.5 rounded-xl text-sm font-medium hover:bg-slate-50">Back</button>
                  <button
                    onClick={() => setStep(3)}
                    disabled={!uploads["gst_certificate"] || !uploads["pan_card"]}
                    className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 text-white font-medium py-2.5 px-6 rounded-xl"
                  >
                    Continue <ChevronRight className="w-4 h-4" />
                  </button>
                </div>

                {/* Demo hint */}
                <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg flex gap-2">
                  <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-amber-700">Demo: Upload any file to proceed. Real validation is not applied.</p>
                </div>
              </div>
            )}

            {/* Step 4: Review */}
            {step === 3 && (
              <div>
                <h2 className="text-lg font-semibold text-slate-900 mb-1">Review & Submit</h2>
                <p className="text-sm text-slate-500 mb-6">Please review your KYC information before submitting</p>

                <div className="space-y-4">
                  {[
                    { title: "Business Information", items: [
                      { label: "Business Name", value: "Hindustan Paints Ltd" },
                      { label: "Business Type", value: "Private Limited" },
                      { label: "Annual Turnover", value: "₹25 Crore+" },
                    ]},
                    { title: "GST & Financial", items: [
                      { label: "GSTIN", value: "27AABHP1234A1Z2" },
                      { label: "PAN", value: "AABHP1234A" },
                      { label: "Bank", value: "HDFC Bank - ••••4567" },
                    ]},
                    { title: "Uploaded Documents", items: [
                      { label: "GST Certificate", value: uploads["gst_certificate"] || "—" },
                      { label: "PAN Card", value: uploads["pan_card"] || "—" },
                      { label: "COI", value: uploads["coi"] || "Not uploaded (optional)" },
                    ]},
                  ].map((section) => (
                    <div key={section.title} className="bg-slate-50 rounded-xl p-4">
                      <h3 className="text-sm font-semibold text-slate-700 mb-3">{section.title}</h3>
                      <div className="space-y-2">
                        {section.items.map((item) => (
                          <div key={item.label} className="flex justify-between text-sm">
                            <span className="text-slate-500">{item.label}</span>
                            <span className="font-medium text-slate-800 text-right">{item.value}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-xs text-blue-700">
                    By submitting, you confirm that all information provided is accurate and you authorize O3 to verify these details with relevant authorities.
                  </p>
                </div>

                <div className="flex justify-between mt-6">
                  <button onClick={() => setStep(2)} className="text-slate-600 border border-slate-200 px-6 py-2.5 rounded-xl text-sm font-medium hover:bg-slate-50">Back</button>
                  <button
                    onClick={handleSubmit}
                    className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2.5 px-8 rounded-xl transition-colors"
                  >
                    <CheckCircle className="w-4 h-4" />
                    Submit KYC
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
