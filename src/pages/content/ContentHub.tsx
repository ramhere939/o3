import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { BookOpen, Clock, Star, Lock, ArrowRight, TrendingUp } from "lucide-react";
import { getContentArticles } from "@/lib/mock-api";
import { PageHeader, SectionCard } from "@/components/shared/UIHelpers";

const CATEGORY_LABELS: Record<string, string> = {
  market_news: "Market News",
  chemical_insights: "Chemical Insights",
  industry_reports: "Industry Reports",
};

const CATEGORY_COLORS: Record<string, string> = {
  market_news: "bg-blue-100 text-blue-700",
  chemical_insights: "bg-violet-100 text-violet-700",
  industry_reports: "bg-amber-100 text-amber-700",
};

export default function ContentHub() {
  const { data: articles, isLoading } = useQuery({
    queryKey: ["content-articles"],
    queryFn: getContentArticles,
  });

  const featured = articles?.[0];
  const rest = articles?.slice(1) || [];

  return (
    <div className="space-y-6">
      <PageHeader
        title="O3 Content Hub"
        subtitle="Market intelligence, industry insights, and chemical sector news"
        breadcrumb={["Platform", "Content Hub"]}
      />

      {/* Featured */}
      {featured && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-indigo-600 to-violet-700 rounded-2xl p-8 text-white"
        >
          <span className={`inline-block text-xs font-medium px-2.5 py-1 rounded-full mb-4 bg-white/20 text-indigo-100`}>
            {CATEGORY_LABELS[featured.category]}
          </span>
          <h2 className="text-2xl font-bold mb-3 leading-tight">{featured.title}</h2>
          <p className="text-indigo-200 text-sm leading-relaxed mb-6">{featured.summary}</p>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 text-xs text-indigo-300">
              <span>{featured.author}</span>
              <span>•</span>
              <Clock className="w-3.5 h-3.5" />
              <span>{featured.readTimeMinutes} min read</span>
              <span>•</span>
              <span>{featured.publishedAt}</span>
            </div>
            <button className="flex items-center gap-2 bg-white text-indigo-700 font-medium text-sm px-4 py-2 rounded-xl hover:bg-indigo-50 transition-colors">
              Read Article <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      )}

      {/* Articles grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => <div key={i} className="skeleton h-48 rounded-xl" />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {rest.map((article, i) => (
            <motion.div
              key={article.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
              className="bg-white rounded-xl border border-slate-200 p-5 hover:shadow-md transition-all group cursor-pointer"
            >
              <div className="flex items-center justify-between mb-3">
                <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${CATEGORY_COLORS[article.category] || "bg-slate-100 text-slate-600"}`}>
                  {CATEGORY_LABELS[article.category]}
                </span>
                {article.premium && (
                  <div className="flex items-center gap-1">
                    <Lock className="w-3 h-3 text-amber-500" />
                    <span className="text-[10px] font-medium text-amber-600">Premium</span>
                  </div>
                )}
              </div>
              <h3 className="text-sm font-semibold text-slate-900 leading-snug mb-2 group-hover:text-indigo-600 transition-colors">
                {article.title}
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed mb-4 line-clamp-2">{article.summary}</p>
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>{article.author}</span>
                <div className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  <span>{article.readTimeMinutes} min</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
