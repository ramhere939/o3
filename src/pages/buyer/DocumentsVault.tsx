import { motion } from "framer-motion";
import { FolderOpen, FileText, Download, Upload, Shield, AlertCircle, Eye, Search } from "lucide-react";
import { PageHeader, SectionCard } from "@/components/shared/UIHelpers";
import { useState } from "react";

const MOCK_DOCS = [
  { id: "d1", name: "GST Certificate", type: "KYC", size: "245 KB", uploadedAt: "2024-08-15", status: "verified", format: "PDF" },
  { id: "d2", name: "PAN Card", type: "KYC", size: "180 KB", uploadedAt: "2024-08-15", status: "verified", format: "PDF" },
  { id: "d3", name: "COA — TiO2 Rutile Batch Aug24", type: "COA", size: "320 KB", uploadedAt: "2024-09-04", status: "active", format: "PDF" },
  { id: "d4", name: "TDS — Titanium Dioxide Supplier", type: "TDS", size: "180 KB", uploadedAt: "2024-09-04", status: "active", format: "PDF" },
  { id: "d5", name: "PO-2024-0001", type: "PO", size: "95 KB", uploadedAt: "2024-08-28", status: "active", format: "PDF" },
  { id: "d6", name: "PO-2024-0002", type: "PO", size: "88 KB", uploadedAt: "2024-08-28", status: "active", format: "PDF" },
  { id: "d7", name: "Invoice INV-0001", type: "Invoice", size: "145 KB", uploadedAt: "2024-08-29", status: "active", format: "PDF" },
  { id: "d8", name: "Invoice INV-0002", type: "Invoice", size: "138 KB", uploadedAt: "2024-08-29", status: "active", format: "PDF" },
  { id: "d9", name: "E-way Bill — PO-2024-0001", type: "Eway Bill", size: "75 KB", uploadedAt: "2024-09-01", status: "active", format: "PDF" },
  { id: "d10", name: "SDS — Hydrochloric Acid", type: "SDS/MSDS", size: "520 KB", uploadedAt: "2024-09-02", status: "active", format: "PDF" },
  { id: "d11", name: "SDS — Caustic Soda Flakes", type: "SDS/MSDS", size: "490 KB", uploadedAt: "2024-09-02", status: "active", format: "PDF" },
  { id: "d12", name: "NDA — Aditya Chemicals", type: "Legal", size: "215 KB", uploadedAt: "2024-08-01", status: "active", format: "PDF" },
];

const DOC_TYPES = ["All", "KYC", "COA", "TDS", "PO", "Invoice", "Eway Bill", "SDS/MSDS", "Legal"];

const TYPE_COLORS: Record<string, string> = {
  KYC: "bg-emerald-100 text-emerald-700",
  COA: "bg-blue-100 text-blue-700",
  TDS: "bg-violet-100 text-violet-700",
  PO: "bg-indigo-100 text-indigo-700",
  Invoice: "bg-amber-100 text-amber-700",
  "Eway Bill": "bg-orange-100 text-orange-700",
  "SDS/MSDS": "bg-rose-100 text-rose-700",
  Legal: "bg-slate-100 text-slate-700",
};

export default function DocumentsVault() {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("All");

  const filtered = MOCK_DOCS.filter(
    (d) =>
      (typeFilter === "All" || d.type === typeFilter) &&
      d.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Documents Vault"
        subtitle="Secure storage for all compliance and transaction documents"
        breadcrumb={["Buyer Portal", "Documents Vault"]}
        action={
          <label className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-4 py-2 rounded-lg cursor-pointer transition-colors">
            <Upload className="w-4 h-4" /> Upload Document
            <input type="file" className="hidden" />
          </label>
        }
      />

      {/* KYC Banner */}
      <div className="flex items-center gap-3 bg-emerald-50 border border-emerald-200 rounded-xl p-4">
        <Shield className="w-5 h-5 text-emerald-600 flex-shrink-0" />
        <div className="flex-1">
          <p className="text-sm font-medium text-emerald-800">KYC Verified</p>
          <p className="text-xs text-emerald-600">All primary documents are verified. Next renewal: Aug 2025</p>
        </div>
        <span className="text-xs font-medium bg-emerald-200 text-emerald-800 px-2.5 py-1 rounded-full">✓ Active</span>
      </div>

      {/* Search & Type Filter */}
      <div className="flex gap-3 flex-wrap items-center">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search documents..."
            className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {DOC_TYPES.map((t) => (
            <button
              key={t}
              onClick={() => setTypeFilter(t)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                typeFilter === t ? "bg-indigo-600 text-white" : "bg-white border border-slate-200 text-slate-600 hover:border-slate-300"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Documents grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((doc, i) => (
          <motion.div
            key={doc.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.04 }}
            className="bg-white rounded-xl border border-slate-200 p-4 hover:shadow-sm transition-all group"
          >
            <div className="flex items-start gap-3">
              <div className="w-10 h-12 bg-rose-50 border border-rose-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <FileText className="w-5 h-5 text-rose-500" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-900 leading-tight truncate">{doc.name}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full ${TYPE_COLORS[doc.type] || "bg-slate-100 text-slate-600"}`}>
                    {doc.type}
                  </span>
                  {doc.status === "verified" && (
                    <Shield className="w-3.5 h-3.5 text-emerald-500" />
                  )}
                </div>
                <p className="text-[10px] text-slate-400 mt-1">{doc.size} · {doc.uploadedAt}</p>
              </div>
            </div>
            <div className="flex gap-2 mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
              <button className="flex-1 flex items-center justify-center gap-1.5 text-xs border border-slate-200 rounded-lg py-1.5 text-slate-600 hover:bg-slate-50">
                <Eye className="w-3.5 h-3.5" /> View
              </button>
              <button className="flex-1 flex items-center justify-center gap-1.5 text-xs border border-slate-200 rounded-lg py-1.5 text-slate-600 hover:bg-slate-50">
                <Download className="w-3.5 h-3.5" /> Download
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-12">
          <FolderOpen className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-500">No documents found</p>
        </div>
      )}
    </div>
  );
}
