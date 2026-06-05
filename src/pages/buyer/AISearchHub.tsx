import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { useSearchParams } from "react-router-dom";
import { Sparkles, Search, Star, Clock, MapPin, Shield, ArrowRight, Loader2 } from "lucide-react";
import { aiSearch } from "@/lib/mock-api";
import { formatCurrency } from "@/lib/utils";
import { PageHeader, SectionCard } from "@/components/shared/UIHelpers";

const SUGGESTIONS = [
  "Show Titanium Dioxide suppliers in Gujarat under ₹200/kg",
  "Find Pharmaceutical grade Glycerine under ₹100/kg",
  "Best Caustic Soda suppliers in Maharashtra with 5-day delivery",
  "Isopropyl Alcohol 99.9% electronic grade suppliers in South India",
  "Large quantity Urea suppliers for Rabi season",
];

const AI_SUGGESTIONS = [
  { query: "TiO2 Rutile Grade Gujarat", tag: "Popular" },
  { query: "Paracetamol API USP Grade", tag: "Trending" },
  { query: "IPA Electronic Grade", tag: "New" },
  { query: "Caustic Soda Flakes Maharashtra", tag: "Popular" },
];

export default function AISearchHub() {
  const [searchParams] = useSearchParams();
  const [query, setQuery] = useState(searchParams.get("q") || "");
  const [activeQuery, setActiveQuery] = useState(searchParams.get("q") || "");

  const { data: results, isFetching } = useQuery({
    queryKey: ["ai-search", activeQuery],
    queryFn: () => aiSearch(activeQuery),
    enabled: !!activeQuery,
  });

  const handleSearch = () => {
    if (query.trim()) setActiveQuery(query.trim());
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <PageHeader
        title="AI Search Hub"
        subtitle="Describe what you need in plain language — our AI finds the best suppliers"
        breadcrumb={["Buyer Portal", "AI Search"]}
      />

      {/* Search bar */}
      <div className="bg-gradient-to-br from-indigo-600 to-violet-700 rounded-2xl p-6">
        <div className="flex items-center gap-3">
          <Sparkles className="w-6 h-6 text-indigo-200 flex-shrink-0" />
          <div className="flex-1 relative">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              placeholder="e.g. Show Titanium Dioxide suppliers in Gujarat under ₹200/kg"
              className="w-full bg-white/10 text-white placeholder:text-indigo-300 border border-white/20 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-white/30 pr-32"
            />
            <button
              onClick={handleSearch}
              disabled={isFetching}
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-white text-indigo-700 font-semibold text-sm px-4 py-1.5 rounded-lg hover:bg-indigo-50 transition-colors flex items-center gap-1.5"
            >
              {isFetching ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Search className="w-4 h-4" /> Search</>}
            </button>
          </div>
        </div>

        {/* Suggestion pills */}
        <div className="mt-4 flex flex-wrap gap-2">
          {SUGGESTIONS.map((s) => (
            <button
              key={s}
              onClick={() => { setQuery(s); setActiveQuery(s); }}
              className="text-xs bg-white/10 hover:bg-white/20 text-indigo-100 border border-white/20 px-3 py-1.5 rounded-full transition-colors text-left"
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Results */}
      <AnimatePresence mode="wait">
        {isFetching && (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center py-12"
          >
            <div className="w-12 h-12 rounded-2xl bg-indigo-100 flex items-center justify-center mb-3">
              <Sparkles className="w-6 h-6 text-indigo-600 animate-pulse" />
            </div>
            <p className="text-slate-600 font-medium">AI is analyzing your query...</p>
            <p className="text-slate-400 text-sm mt-1">Finding best-matched suppliers</p>
          </motion.div>
        )}

        {results && !isFetching && (
          <motion.div key="results" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-slate-600">
                Found <strong>{results.length} suppliers</strong> matching your query
              </p>
              <span className="text-xs text-slate-400 bg-indigo-50 border border-indigo-100 px-2.5 py-1 rounded-full">
                AI-powered results
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {results.map((result, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.08 }}
                  className="bg-white rounded-xl border border-slate-200 p-5 hover:shadow-md hover:-translate-y-0.5 transition-all"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-semibold text-slate-900">{result.product}</h3>
                        {result.o3Assured && (
                          <span className="flex items-center gap-1 text-[10px] bg-indigo-100 text-indigo-700 px-1.5 py-0.5 rounded-full font-medium">
                            <Shield className="w-3 h-3" /> O3 Assured
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">{result.supplier}</p>
                    </div>
                    <div className="flex items-center gap-1">
                      <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                      <span className="text-xs font-medium text-slate-700">{result.supplierRating}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="bg-slate-50 rounded-lg p-3">
                      <p className="text-[10px] text-slate-400 uppercase tracking-wide">Price</p>
                      <p className="text-base font-bold text-indigo-600 mt-0.5">
                        ₹{result.price.toLocaleString("en-IN")}
                        <span className="text-xs text-slate-400 font-normal ml-1">{result.priceUnit}</span>
                      </p>
                    </div>
                    <div className="bg-slate-50 rounded-lg p-3">
                      <p className="text-[10px] text-slate-400 uppercase tracking-wide">Lead Time</p>
                      <div className="flex items-center gap-1 mt-0.5">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <p className="text-base font-bold text-slate-800">{result.leadTimeDays} days</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 mb-4">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    <span className="text-xs text-slate-500">{result.location}</span>
                  </div>

                  <button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium py-2 rounded-lg transition-colors flex items-center justify-center gap-2">
                    Request Quote <ArrowRight className="w-4 h-4" />
                  </button>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* AI Suggestions (when no search) */}
      {!activeQuery && !isFetching && (
        <SectionCard title="Trending Searches">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {AI_SUGGESTIONS.map((s, i) => (
              <button
                key={i}
                onClick={() => { setQuery(s.query); setActiveQuery(s.query); }}
                className="flex items-center justify-between p-4 rounded-xl border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/30 transition-all text-left"
              >
                <div className="flex items-center gap-3">
                  <Sparkles className="w-4 h-4 text-indigo-500" />
                  <span className="text-sm text-slate-700">{s.query}</span>
                </div>
                <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${
                  s.tag === "Popular" ? "bg-indigo-100 text-indigo-600" :
                  s.tag === "Trending" ? "bg-rose-100 text-rose-600" :
                  "bg-emerald-100 text-emerald-600"
                }`}>{s.tag}</span>
              </button>
            ))}
          </div>
        </SectionCard>
      )}
    </div>
  );
}
