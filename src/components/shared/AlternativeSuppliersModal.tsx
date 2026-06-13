import { motion } from "framer-motion";
import { X, Search, Star, Shield, Package } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { getProducts } from "@/lib/mock-api";
import { Link } from "react-router-dom";

export function AlternativeSuppliersModal({ 
  productName, 
  category, 
  currentSupplier,
  onClose 
}: { 
  productName: string, 
  category: string, 
  currentSupplier: string,
  onClose: () => void 
}) {
  const { data: products, isLoading } = useQuery({
    queryKey: ["alternative-products", category],
    queryFn: () => getProducts({ category }),
  });

  // Filter out the current supplier and get unique suppliers
  const alternatives = products?.filter(p => p.supplierName !== currentSupplier) || [];
  
  // Deduplicate by supplierName
  const uniqueAlternatives = [];
  const seen = new Set();
  for (const alt of alternatives) {
    if (!seen.has(alt.supplierName)) {
      seen.add(alt.supplierName);
      uniqueAlternatives.push(alt);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl"
      >
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Alternative Suppliers</h2>
            <p className="text-sm text-slate-500 mt-1">Showing verified suppliers for similar products</p>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full flex items-center justify-center bg-white border border-slate-200 text-slate-500 hover:text-rose-500 hover:border-rose-200 transition-colors shadow-sm"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto bg-slate-50/50">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
              <p className="mt-4 text-slate-500">Finding suppliers...</p>
            </div>
          ) : uniqueAlternatives.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-xl border border-slate-200">
              <Search className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-slate-900 mb-2">No alternatives found</h3>
              <p className="text-slate-500">We couldn't find other suppliers for this product category.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {uniqueAlternatives.map((alt) => (
                <div key={alt.id} className="bg-white p-5 rounded-xl border border-slate-200 hover:border-indigo-300 hover:shadow-md transition-all flex flex-col sm:flex-row gap-4 sm:items-center justify-between group">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-indigo-50 rounded-lg flex items-center justify-center border border-indigo-100 text-indigo-600 flex-shrink-0">
                      <Package className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                        {alt.supplierName}
                      </h4>
                      <div className="flex items-center gap-3 mt-1 text-xs text-slate-500">
                        <span className="flex items-center gap-1">
                          <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                          <span className="font-medium text-slate-700">{alt.rating}</span>
                        </span>
                        <span className="flex items-center gap-1 text-emerald-600 font-medium">
                          <Shield className="w-3.5 h-3.5" /> Verified
                        </span>
                        <span>{alt.location}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex flex-col items-end gap-2 shrink-0">
                    <div className="text-sm font-bold text-indigo-700">
                      ₹{alt.price.toLocaleString("en-IN")}/{alt.priceUnit}
                    </div>
                    <Link
                      to={`/buyer/product/${alt.id}`}
                      state={{ product: alt }}
                      className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-semibold px-4 py-2 rounded-lg text-xs transition-colors border border-indigo-100"
                      onClick={onClose}
                    >
                      View Product
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
