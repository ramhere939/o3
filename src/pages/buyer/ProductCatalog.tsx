import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import Fuse from "fuse.js";
import { Search, Filter, Star, MapPin, Clock, Shield, Package, ArrowRight, SlidersHorizontal, Sparkles, Users, X } from "lucide-react";
import { getProducts, getProductCategories } from "@/lib/mock-api";
import { formatCurrency } from "@/lib/utils";
import { PageHeader, EmptyState, TableSkeleton } from "@/components/shared/UIHelpers";
import { SpotPurchaseModal } from "@/components/SpotPurchaseModal";
import { AlternativeSuppliersModal } from "@/components/shared/AlternativeSuppliersModal";
import AISearchHub from "./AISearchHub";
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
  const [altModalProduct, setAltModalProduct] = useState<any>(null);
  const [isAiMode, setIsAiMode] = useState(false);
  const [alternativeProduct, setAlternativeProduct] = useState<Product | null>(null);

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

  const outOfStockProducts = (products || []).filter(p => !p.inStock);
  const outOfStockQueries = outOfStockProducts.map(p => p.name);

  const { data: similarProductsData, isLoading: isSimilarLoading } = useQuery({
    queryKey: ["similarProductsNLP", outOfStockQueries],
    queryFn: async () => {
      if (outOfStockQueries.length === 0) return [];
      
      // Fetch all products to act as our fuzzy search corpus
      const allProducts = await getProducts();
      const inStockProducts = allProducts.filter(p => p.inStock);
      
      const fuse = new Fuse(inStockProducts, {
        keys: [
          { name: 'name', weight: 0.6 },
          { name: 'category', weight: 0.2 },
          { name: 'tags', weight: 0.1 },
          { name: 'description', weight: 0.1 }
        ],
        threshold: 0.5, // increased to be more permissive
        ignoreLocation: true,
        ignoreFieldNorm: true,
        useExtendedSearch: true,
      });

      const similarProducts = new Map();
      
      outOfStockQueries.forEach(queryStr => {
        // We can search for words in the name
        // Split name into words and join with space for basic fuzzy, or just pass the name
        const results = fuse.search(queryStr);
        // Only take top 8 matches per out of stock item to avoid irrelevant tail matches
        results.slice(0, 8).forEach(res => {
          if (!similarProducts.has(res.item.id)) {
            similarProducts.set(res.item.id, res.item);
          }
        });
      });

      return Array.from(similarProducts.values());
    },
    enabled: outOfStockQueries.length > 0,
  });

  const displaySimilarProducts = similarProductsData || [];

  const renderProductCard = (product: any, i: number) => (
    <motion.div
      key={product.id}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: Math.min(i * 0.02, 0.2) }}
      className="bg-white rounded-xl border border-slate-200 overflow-hidden hover:shadow-xl hover:border-indigo-200 transition-all group flex flex-col h-full"
    >
      <Link to={`/buyer/product/${product.id}`} state={{ product }} className="block">
        <div className="h-40 bg-slate-100 flex items-center justify-center relative overflow-hidden group-hover:bg-slate-200 transition-colors">
          <div className="absolute top-2 right-2 flex flex-col gap-1.5 z-10">
            <div className="bg-white/90 backdrop-blur px-2 py-1 rounded text-[10px] font-bold text-slate-600 flex items-center gap-1 shadow-sm">
              <Star className="w-3 h-3 text-amber-500 fill-amber-500" /> {product.rating}
            </div>
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setAlternativeProduct(product);
              }}
              className="bg-white/90 backdrop-blur px-2 py-1 rounded text-[10px] font-bold text-indigo-600 flex items-center justify-center gap-1 shadow-sm hover:bg-indigo-50 hover:text-indigo-700 transition-colors"
              title="Find Alternative Sellers"
            >
              <Users className="w-3 h-3" /> Alternatives
            </button>
          </div>
          {!product.inStock && (
            <div className="absolute top-2 left-2 bg-rose-100/90 backdrop-blur text-rose-700 px-2 py-1 rounded z-10 text-[10px] font-bold flex items-center gap-1 border border-rose-200">
              Out of Stock
            </div>
          )}
          <img 
            src={[
              "/chemicals/c1.jpg",
              "/chemicals/c2.jpg",
              "/chemicals/c3.jpg",
              "/chemicals/c4.avif",
              "/chemicals/c5.jpg"
            ][(String(product.id).split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)) % 5]} 
            alt={product.name}
            className={`w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ${!product.inStock ? 'opacity-50 grayscale' : ''}`}
          />
        </div>
      </Link>

      <div className="p-4 flex flex-col flex-1">
        <Link to={`/buyer/product/${product.id}`} state={{ product }} className="block mb-1">
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

          <div className="flex items-center gap-1 mb-4 flex-wrap">
            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-amber-50 border border-amber-200 text-[10px] font-bold text-amber-700">
              <Shield className="w-2.5 h-2.5" /> Verified
            </span>
            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-indigo-50 border border-indigo-200 text-[10px] font-bold text-indigo-700">
              3 YRS
            </span>
            <span className="text-[10px] text-slate-500 ml-1 truncate max-w-[80px]">{product.supplierName}</span>
            <Search 
              className="w-3.5 h-3.5 text-indigo-500 cursor-pointer hover:text-indigo-700 ml-auto" 
              onClick={(e) => {
                e.preventDefault();
                setAltModalProduct({
                  name: product.name,
                  category: product.category,
                  supplierName: product.supplierName
                });
              }}
            />
          </div>

          <div className="mt-auto pt-2 flex items-center gap-2">
            {product.inStock ? (
              <>
                <button
                  onClick={() => setSelectedProduct(product)}
                  className="flex-1 text-center bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold py-2 rounded-lg text-sm transition-colors border border-indigo-100"
                >
                  Buy Now
                </button>
                <Link
                  to={`/buyer/rfq/create?product=${encodeURIComponent(product.name)}`}
                  className="flex-1 flex items-center justify-center bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 rounded-lg text-sm transition-colors"
                >
                  Create RFQ
                </Link>
              </>
            ) : (
              <div className="flex-1 text-center bg-slate-100 text-slate-400 font-bold py-2 rounded-lg text-sm border border-slate-200 cursor-not-allowed">
                Out of Stock
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );

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
            <div className="flex gap-2">
              {!isAiMode ? (
                <>
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
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center text-indigo-600 font-semibold bg-indigo-50/50 rounded-lg">
                  ✨ AI Mode Active — Enter your query below
                </div>
              )}
              <button 
                onClick={() => setIsAiMode(!isAiMode)} 
                className={`flex items-center gap-2 font-bold px-6 py-3.5 rounded-lg transition-all shadow-lg ${
                  isAiMode 
                    ? 'bg-slate-800 text-white hover:bg-slate-900 shadow-slate-900/20' 
                    : 'bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white shadow-indigo-600/30'
                }`}
              >
                <Sparkles className="w-5 h-5" />
                {isAiMode ? "Exit AI Mode" : "AI Mode"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {isAiMode ? (
        <div className="flex justify-center mt-8">
          <AISearchHub embedded />
        </div>
      ) : (
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
            <div className="flex items-center gap-4">
              <Link
                to="/buyer/rfq/create"
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-lg text-sm transition-colors shadow-sm"
              >
                Create RFQ
              </Link>
              <span className="text-sm text-slate-500">{products?.length ?? 0} results</span>
            </div>
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
            <div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {products?.map((product, i) => renderProductCard(product, i))}
              </div>

              {outOfStockProducts.length > 0 && (
                <div className="mt-16 bg-gradient-to-r from-amber-50 to-orange-50 p-6 md:p-8 rounded-2xl border border-amber-100">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-amber-100 rounded-lg">
                      <Package className="w-6 h-6 text-amber-600" />
                    </div>
                    <div>
                      <h2 className="text-xl md:text-2xl font-bold text-slate-900">Similar Available Products</h2>
                      <p className="text-slate-600 text-sm">These products from the same categories are currently in stock and ready to ship.</p>
                    </div>
                  </div>
                  
                  {isSimilarLoading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                      {Array.from({ length: 4 }).map((_, i) => (
                        <div key={i} className="bg-white/50 rounded-xl border border-amber-200/50 p-4 space-y-3">
                          <div className="skeleton h-32 w-full rounded-lg bg-amber-100/50" />
                          <div className="skeleton h-4 w-3/4 bg-amber-100/50" />
                          <div className="skeleton h-6 w-1/2 bg-amber-100/50" />
                        </div>
                      ))}
                    </div>
                  ) : displaySimilarProducts.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                      {displaySimilarProducts.slice(0, 4).map((product: any, i: number) => renderProductCard(product, i))}
                    </div>
                  ) : (
                    <div className="text-amber-700 font-medium">No similar products available at the moment.</div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      )}

      <SpotPurchaseModal
        isOpen={!!selectedProduct}
        onClose={() => setSelectedProduct(null)}
        product={selectedProduct}
        onConfirm={handleSpotPurchase}
      />

      {altModalProduct && (
        <AlternativeSuppliersModal
          productName={altModalProduct.name}
          category={altModalProduct.category}
          currentSupplier={altModalProduct.supplierName}
          onClose={() => setAltModalProduct(null)}
        />
      )}
    </div>
  );
}
