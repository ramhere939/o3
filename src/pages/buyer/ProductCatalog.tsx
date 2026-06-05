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
    <div className="space-y-6">
      <PageHeader
        title="Product Catalog"
        subtitle={`${products?.length ?? 0} chemicals available from verified suppliers`}
        breadcrumb={["Buyer Portal", "Catalog"]}
      />

      {/* Search & Filters */}
      <div className="bg-white rounded-xl border border-slate-200 p-4">
        <div className="flex gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by product name, CAS number, or category..."
              className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-medium transition-colors ${showFilters ? "bg-indigo-50 border-indigo-300 text-indigo-700" : "border-slate-200 text-slate-600 hover:bg-slate-50"}`}
          >
            <SlidersHorizontal className="w-4 h-4" />
            Filters
          </button>
        </div>

        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="mt-4 pt-4 border-t border-slate-100 grid grid-cols-2 md:grid-cols-4 gap-3"
          >
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Category</label>
              <select value={category} onChange={(e) => setCategory(e.target.value)}
                className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white">
                <option value="">All Categories</option>
                {categories?.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Location</label>
              <select value={location} onChange={(e) => setLocation(e.target.value)}
                className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white">
                <option value="">All States</option>
                {LOCATIONS.map((l) => <option key={l} value={l}>{l}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Max Price (₹/kg)</label>
              <input
                type="number"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                placeholder="e.g. 200"
                className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div className="flex items-end">
              <button
                onClick={() => { setSearch(""); setCategory(""); setLocation(""); setMaxPrice(""); }}
                className="text-sm text-indigo-600 font-medium hover:text-indigo-700"
              >
                Clear filters
              </button>
            </div>
          </motion.div>
        )}
      </div>

      {/* Product grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 9 }).map((_, i) => (
            <div key={i} className="bg-white rounded-xl border border-slate-200 p-5 space-y-3">
              <div className="skeleton h-4 w-2/3" />
              <div className="skeleton h-3 w-1/2" />
              <div className="skeleton h-8 w-full" />
              <div className="skeleton h-3 w-3/4" />
              <div className="skeleton h-8 w-full" />
            </div>
          ))}
        </div>
      ) : products?.length === 0 ? (
        <EmptyState
          icon={<Package className="w-8 h-8" />}
          title="No products found"
          description="Try adjusting your search or removing filters to see more results"
          action={<button onClick={() => { setSearch(""); setCategory(""); setLocation(""); setMaxPrice(""); }} className="text-sm text-indigo-600 font-medium">Clear all filters</button>}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {products?.slice(0, 30).map((product, i) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: Math.min(i * 0.04, 0.5) }}
              className="bg-white rounded-xl border border-slate-200 p-5 hover:shadow-md hover:-translate-y-0.5 transition-all"
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-semibold text-slate-900 leading-tight">{product.name}</h3>
                  <p className="text-xs text-slate-400 mt-0.5">CAS: {product.casNumber}</p>
                </div>
                <div className="flex items-center gap-1 ml-2">
                  <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400 flex-shrink-0" />
                  <span className="text-xs font-medium text-slate-600">{product.rating}</span>
                </div>
              </div>

              {/* Category & Grade tags */}
              <div className="flex flex-wrap gap-1.5 mb-3">
                <span className="text-[10px] bg-indigo-50 text-indigo-600 border border-indigo-100 px-2 py-0.5 rounded-full font-medium">{product.category}</span>
                <span className="text-[10px] bg-slate-100 text-slate-600 border border-slate-200 px-2 py-0.5 rounded-full">{product.grade}</span>
              </div>

              {/* Price & MOQ */}
              <div className="grid grid-cols-2 gap-2 mb-3">
                <div className="bg-slate-50 rounded-lg p-2.5">
                  <p className="text-[10px] text-slate-400 uppercase tracking-wide">Price</p>
                  <p className="text-base font-bold text-indigo-600">₹{product.price.toLocaleString("en-IN")}</p>
                  <p className="text-[10px] text-slate-400">{product.priceUnit}</p>
                </div>
                <div className="bg-slate-50 rounded-lg p-2.5">
                  <p className="text-[10px] text-slate-400 uppercase tracking-wide">MOQ</p>
                  <p className="text-base font-bold text-slate-800">{product.moq.toLocaleString()}</p>
                  <p className="text-[10px] text-slate-400">{product.moqUnit}</p>
                </div>
              </div>

              {/* Supplier info */}
              <div className="flex items-center gap-2 mb-3 text-xs text-slate-500">
                <Shield className="w-3.5 h-3.5 text-emerald-500" />
                <span className="truncate">{product.supplierName}</span>
              </div>

              <div className="flex items-center justify-between text-xs text-slate-400 mb-4">
                <div className="flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  <span>{product.location.split(",")[1]?.trim() || product.location}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  <span>{product.leadTimeDays} days</span>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => setSelectedProduct(product)}
                  className="flex-1 text-center bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-sm font-medium py-2 rounded-lg transition-colors border border-indigo-200"
                >
                  Buy Now
                </button>
                <Link
                  to={`/buyer/rfq/create?product=${encodeURIComponent(product.name)}`}
                  className="flex-1 text-center bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium py-2 rounded-lg transition-colors"
                >
                  Create RFQ
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <SpotPurchaseModal
        isOpen={!!selectedProduct}
        onClose={() => setSelectedProduct(null)}
        product={selectedProduct}
        onConfirm={handleSpotPurchase}
      />
    </div>
  );
}
