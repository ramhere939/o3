import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { FolderOpen, FileText, Download, Upload, Shield, Search, Eye } from "lucide-react";
import { PageHeader } from "@/components/shared/UIHelpers";
import { getDocuments, uploadDocument } from "@/lib/mock-api";

const DOC_TYPES = ["All", "COA", "TDS", "PO", "Invoice", "Eway Bill", "SDS/MSDS", "Legal"];

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
  const queryClient = useQueryClient();

  const { data: docs = [], isLoading } = useQuery({
    queryKey: ["documents"],
    queryFn: getDocuments,
  });

  const uploadMutation = useMutation({
    mutationFn: (newDoc: any) => uploadDocument(newDoc),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["documents"] });
    },
  });

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      uploadMutation.mutate({
        name: file.name,
        type: "KYC",
        size: `${Math.max(1, Math.round(file.size / 1024))} KB`,
        format: file.name.split(".").pop()?.toUpperCase() || "DOC",
        status: "active",
      });
    }
  };

  const filtered = docs.filter(
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
      />

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
