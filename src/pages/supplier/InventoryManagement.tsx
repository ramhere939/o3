import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Plus, Edit2, Trash2, Search, Package, AlertCircle } from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getProducts, createProduct } from "@/lib/mock-api";
import { PageHeader, SectionCard } from "@/components/shared/UIHelpers";
import { AddProductListingModal } from "@/components/AddProductListingModal";
import type { Product } from "@/types";

export default function InventoryManagement() {
  const [search, setSearch] = useState("");
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: products, isLoading } = useQuery({
    queryKey: ["products"],
    queryFn: () => getProducts(),
  });

  const myProducts = products?.filter((p) => p.supplierId === "s1") || [];
  const filtered = myProducts
    .filter((p) => p.name.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const statusCounts = {
    in_stock: myProducts.filter((_, i) => ["in_stock"].includes(["in_stock", "low_stock", "in_stock", "out_of_stock"][i % 4])).length,
    low_stock: myProducts.filter((_, i) => i % 4 === 1).length,
    out_of_stock: myProducts.filter((_, i) => i % 4 === 3).length,
  };

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm("Are you sure you want to delete this listing?")) {
      queryClient.setQueryData(["products"], (old: Product[] | undefined) => 
        old ? old.filter((p) => p.id !== id) : old
      );
    }
  };

  const handleEdit = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigate("/supplier/inventory/post");
  };

  const handleRowClick = (product: Product) => {
    navigate(`/buyer/product/${product.id}`, { state: { product } });
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Products"
        subtitle="Manage your product listings and stock levels"
        breadcrumb={["Supplier Portal", "Products"]}
        action={
          <Link 
            to="/supplier/inventory/post"
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-4 py-2 rounded-lg"
          >
            <Plus className="w-4 h-4" /> Make New Post
          </Link>
        }
      />

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "In Stock", count: myProducts.length - 3, color: "text-emerald-600 bg-emerald-50 border-emerald-200" },
          { label: "Low Stock", count: 3, color: "text-amber-600 bg-amber-50 border-amber-200" },
          { label: "Out of Stock", count: 1, color: "text-rose-600 bg-rose-50 border-rose-200" },
        ].map((s, i) => (
          <div key={i} className={`rounded-xl border p-4 text-center ${s.color}`}>
            <p className="text-2xl font-bold">{s.count}</p>
            <p className="text-xs font-medium mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Search */}
      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Search your inventory..."
            className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
        </div>
      </div>

      <SectionCard noPadding>
        {isLoading ? (
          <div className="p-6 space-y-4">
            {Array.from({ length: 5 }).map((_, i) => <div key={i} className="skeleton h-12 rounded-lg" />)}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px]">
              <thead>
                <tr className="border-b border-slate-100">
                  {["Product", "Category / Grade", "Price", "MOQ", "Stock Status", "Actions"].map((h) => (
                    <th key={h} className="text-left text-xs font-medium text-slate-400 px-5 py-3">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filtered.map((product, i) => {
                  const stockStatus = i % 4 === 1 ? "low_stock" : i % 4 === 3 ? "out_of_stock" : "in_stock";
                  return (
                    <motion.tr key={product.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                      transition={{ delay: i * 0.04 }} 
                      className="table-row-hover cursor-pointer"
                      onClick={() => handleRowClick(product)}>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-indigo-50 rounded-lg flex items-center justify-center flex-shrink-0">
                            <Package className="w-4 h-4 text-indigo-500" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-slate-800 max-w-[180px] truncate">{product.name}</p>
                            <p className="text-xs text-slate-400">CAS: {product.casNumber}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">{product.category}</span>
                        <p className="text-xs text-slate-400 mt-0.5">{product.grade}</p>
                      </td>
                      <td className="px-5 py-4">
                        <p className="text-sm font-semibold text-indigo-600">₹{product.price.toLocaleString("en-IN")}</p>
                        <p className="text-xs text-slate-400">{product.priceUnit}</p>
                      </td>
                      <td className="px-5 py-4">
                        <p className="text-sm text-slate-700">{product.moq.toLocaleString()} {product.moqUnit}</p>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-1.5">
                          {stockStatus === "low_stock" && <AlertCircle className="w-3.5 h-3.5 text-amber-500" />}
                          <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                            stockStatus === "in_stock" ? "bg-emerald-100 text-emerald-700" :
                            stockStatus === "low_stock" ? "bg-amber-100 text-amber-700" :
                            "bg-rose-100 text-rose-700"
                          }`}>
                            {stockStatus === "in_stock" ? "In Stock" : stockStatus === "low_stock" ? "Low Stock" : "Out of Stock"}
                          </span>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          <button 
                            className="text-slate-400 hover:text-indigo-600 p-1.5 rounded-lg hover:bg-indigo-50 transition-colors"
                            onClick={(e) => handleEdit(product.id, e)}
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button 
                            className="text-slate-400 hover:text-rose-600 p-1.5 rounded-lg hover:bg-rose-50 transition-colors"
                            onClick={(e) => handleDelete(product.id, e)}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </SectionCard>
    </div>
  );
}
