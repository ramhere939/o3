import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Search, Filter, Star, MapPin, Clock, Shield, Package, ArrowRight, SlidersHorizontal } from "lucide-react";
import { getProducts, getProductCategories } from "@/lib/mock-api";
import { formatCurrency } from "@/lib/utils";
import { PageHeader, EmptyState, TableSkeleton } from "@/components/shared/UIHelpers";
import { SpotPurchaseModal } from "@/components/SpotPurchaseModal";
import { createOrder } from "@/lib/mock-api";
import type { Product } from "@/types";

const LOCATIONS = ["Gujarat", "Maharashtra", "Tamil Nadu", "Telangana", "Karnataka", "Rajasthan", "Uttar Pradesh"];

export default function ProductCatalog() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [location, setLocation] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const handleSpotPurchase = async (quantity: number, paymentTerms: string) => {
    if (!selectedProduct) return;
    await createOrder({
      buyerId: "b1",
      buyerName: "O3 Demo Buyer",
      supplierId: selectedProduct.supplierId,
      supplierName: selectedProduct.supplierName,
      productName: selectedProduct.name,
      quantity,
      quantityUnit: selectedProduct.priceUnit,
      unitPrice: selectedProduct.price,
      totalAmount: quantity * selectedProduct.price,
      expectedDelivery: new Date(Date.now() + selectedProduct.leadTimeDays * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      rfqId: "spot", // indicates spot purchase
      quoteId: "spot",
    });
  };

  const { data: categories } = useQuery({ queryKey: ["categories"], queryFn: getProductCategories });
  const { data: products, isLoading } = useQuery({
    queryKey: ["products", search, category, location, maxPrice],
    queryFn: () => getProducts({
      search: search || undefined,
      category: category || undefined,
      location: location || undefined,
      maxPrice: maxPrice ? Number(maxPrice) : undefined,
    }),
  });

  return (
    <div className="max-w-[1400px] mx-auto space-y-8 pb-10">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-indigo-900 to-indigo-800 rounded-2xl p-8 md:p-12 text-center text-white relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden opacity-10 pointer-events-none">
          <div className="absolute -top-20 -left-20 w-64 h-64 rounded-full bg-white blur-3xl"></div>
          <div className="absolute top-1/2 -right-20 w-96 h-96 rounded-full bg-indigo-500 blur-3xl"></div>
        </div>

        <div className="relative z-10 max-w-4xl mx-auto">
          <h1 className="text-3xl md:text-5xl font-bold mb-4 tracking-tight">Source wholesale chemicals directly from verified manufacturers</h1>
          <p className="text-indigo-200 mb-10 text-sm md:text-base">Connect with 2,000+ certified suppliers and secure trade assurance on all your bulk chemical orders.</p>

          <div className="bg-white p-2 rounded-xl shadow-2xl">
            <div className="flex gap-4 mb-2 px-2 pt-2">
              <button className="text-sm font-bold text-indigo-600 border-b-2 border-indigo-600 pb-1">Products</button>
              <button className="text-sm font-medium text-slate-500 hover:text-indigo-600 pb-1">Manufacturers</button>
            </div>
            <div className="flex gap-2">
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="What are you looking for..."
                  className="w-full pl-12 pr-4 py-3.5 border-2 border-slate-100 rounded-lg text-base text-slate-900 focus:outline-none focus:ring-0 focus:border-indigo-500 transition-colors"
                />
              </div>
              <button className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-8 py-3.5 rounded-lg transition-colors shadow-lg shadow-indigo-600/30">
                Search
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Left Sidebar Categories */}
        <div className="w-full lg:w-64 flex-shrink-0">
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden sticky top-20 max-h-[calc(100vh-160px)] overflow-y-auto scrollbar-thin flex flex-col">
            <div className="bg-indigo-50 px-5 py-4 border-b border-indigo-100">
              <h3 className="font-bold text-indigo-900">Categories</h3>
            </div>
            <div className="divide-y divide-slate-50 overflow-y-auto max-h-[400px] scrollbar-thin">
              <button 
                onClick={() => setCategory("")}
                className={`w-full text-left px-5 py-3 text-sm hover:bg-slate-50 transition-colors ${!category ? "text-indigo-600 font-semibold bg-indigo-50/30" : "text-slate-600"}`}
              >
                All Categories
              </button>
              {categories?.map((c) => (
                <button
                  key={c}
                  onClick={() => setCategory(c)}
                  className={`w-full text-left px-5 py-3 text-sm hover:bg-slate-50 transition-colors ${category === c ? "text-indigo-600 font-semibold bg-indigo-50/30" : "text-slate-600"}`}
                >
                  {c}
                </button>
              ))}
            </div>
            
            <div className="bg-slate-50 px-5 py-4 border-t border-slate-100 mt-4">
              <h4 className="font-bold text-slate-800 text-sm mb-3">Filters</h4>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1.5">Supplier Location</label>
                  <select value={location} onChange={(e) => setLocation(e.target.value)}
                    className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 bg-white">
                    <option value="">All Regions</option>
                    {LOCATIONS.map((l) => <option key={l} value={l}>{l}</option>)}
                  </select>
                </div>
                
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1.5">Max Price (₹/kg)</label>
                  <input
                    type="number"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value)}
                    placeholder="e.g. 500"
                    className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Product Grid */}
        <div className="flex-1">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-slate-900">
              {category ? `${category} Products` : "Recommended Products"}
            </h2>
            <span className="text-sm text-slate-500">{products?.length ?? 0} results</span>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {Array.from({ length: 12 }).map((_, i) => (
                <div key={i} className="bg-white rounded-xl border border-slate-200 p-4 space-y-3">
                  <div className="skeleton h-32 w-full rounded-lg" />
                  <div className="skeleton h-4 w-3/4" />
                  <div className="skeleton h-6 w-1/2" />
                  <div className="skeleton h-8 w-full" />
                </div>
              ))}
            </div>
          ) : products?.length === 0 ? (
            <EmptyState
              icon={<Package className="w-12 h-12 text-slate-300" />}
              title="No products found"
              description="Try adjusting your filters or search terms"
              action={<button onClick={() => { setSearch(""); setCategory(""); setLocation(""); setMaxPrice(""); }} className="text-sm text-indigo-600 font-bold">Clear filters</button>}
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {products?.map((product, i) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: Math.min(i * 0.02, 0.2) }}
                  className="bg-white rounded-xl border border-slate-200 overflow-hidden hover:shadow-xl hover:border-indigo-200 transition-all group flex flex-col h-full"
                >
                  <Link to={`/buyer/product/${product.id}`} className="block">
                    <div className="h-40 bg-slate-100 flex items-center justify-center relative overflow-hidden group-hover:bg-slate-200 transition-colors">
                      <div className="absolute top-2 right-2 bg-white/90 backdrop-blur px-2 py-1 rounded text-[10px] font-bold text-slate-600 flex items-center gap-1">
                        <Star className="w-3 h-3 text-amber-500 fill-amber-500" /> {product.rating}
                      </div>
                      <Package className="w-12 h-12 text-slate-300" />
                    </div>
                  </Link>

                  <div className="p-4 flex flex-col flex-1">
                    <Link to={`/buyer/product/${product.id}`} className="block mb-1">
                      <h3 className="font-bold text-slate-900 leading-snug line-clamp-2 group-hover:text-indigo-600 transition-colors">
                        {product.name}
                      </h3>
                    </Link>
                    <p className="text-xs text-slate-500 mb-3 line-clamp-1">CAS: {product.casNumber} • {product.grade}</p>

                    <div className="mt-auto">
                      <div className="flex items-baseline gap-1 mb-1">
                        <span className="text-lg font-black text-indigo-700">₹{product.price.toLocaleString("en-IN")}</span>
                        <span className="text-xs text-slate-500">/{product.priceUnit}</span>
                      </div>
                      <p className="text-xs text-slate-600 font-medium mb-3">Min. order: {product.moq.toLocaleString()} {product.moqUnit}</p>

                      {/* Trust Badges */}
                      <div className="flex items-center gap-1 mb-4 flex-wrap">
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-amber-50 border border-amber-200 text-[10px] font-bold text-amber-700">
                          <Shield className="w-2.5 h-2.5" /> Verified
                        </span>
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-indigo-50 border border-indigo-200 text-[10px] font-bold text-indigo-700">
                          3 YRS
                        </span>
                        <span className="text-[10px] text-slate-500 ml-1 truncate max-w-[80px]">{product.supplierName}</span>
                      </div>

                      <div className="mt-auto pt-2">
                        <button
                          onClick={() => setSelectedProduct(product)}
                          className="w-full text-center bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 rounded-lg text-sm transition-colors"
                        >
                          Buy Now
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>

      <SpotPurchaseModal
        isOpen={!!selectedProduct}
        onClose={() => setSelectedProduct(null)}
        product={selectedProduct}
        onConfirm={handleSpotPurchase}
      />
    </div>
  );
}
