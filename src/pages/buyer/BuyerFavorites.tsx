import { Package, Heart, Star, MapPin, Clock, Shield } from "lucide-react";
import { Link } from "react-router-dom";
import { PageHeader } from "@/components/shared/UIHelpers";

const MOCK_FAVORITES = [
  {
    id: 1,
    name: "Industrial Grade Titanium Dioxide (TiO2)",
    casNumber: "13463-67-7",
    category: "Pigments",
    price: 182,
    priceUnit: "kg",
    moq: 500,
    moqUnit: "kg",
    supplierName: "Guangzhou Lianxian Elect...",
    location: "China",
    leadTimeDays: 7,
    rating: 4.8,
  },
  {
    id: 2,
    name: "Sodium Hydroxide Pearls 99%",
    casNumber: "1310-73-2",
    category: "Alkalis",
    price: 45,
    priceUnit: "kg",
    moq: 1000,
    moqUnit: "kg",
    supplierName: "Aditya Chemicals Ltd.",
    location: "India",
    leadTimeDays: 5,
    rating: 4.9,
  }
];

export default function BuyerFavorites() {
  return (
    <div className="max-w-[1400px] mx-auto space-y-6 pb-10">
      <PageHeader
        title="My Favorites"
        breadcrumb={["Buyer Portal", "Favorites"]}
      />

      {MOCK_FAVORITES.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-xl border border-slate-200">
          <Heart className="w-16 h-16 text-slate-200 mb-4" />
          <p className="text-slate-500 font-medium mb-4">You haven't saved any products yet.</p>
          <Link to="/buyer/catalog" className="text-indigo-600 font-bold hover:underline">
            Browse Catalog
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {MOCK_FAVORITES.map((product) => (
            <div key={product.id} className="bg-white rounded-xl border border-slate-200 overflow-hidden hover:shadow-xl hover:border-indigo-200 transition-all group flex flex-col h-full relative">
              <button className="absolute top-3 right-3 z-10 w-8 h-8 bg-white/90 backdrop-blur rounded-full flex items-center justify-center text-rose-500 hover:bg-rose-50 transition-colors shadow-sm">
                <Heart className="w-4 h-4 fill-rose-500" />
              </button>
              
              <div className="h-40 bg-slate-100 flex items-center justify-center relative overflow-hidden group-hover:bg-slate-200 transition-colors">
                <div className="absolute top-2 left-2 bg-white/90 backdrop-blur px-2 py-1 rounded z-10 text-[10px] font-bold text-slate-600 flex items-center gap-1">
                  <Star className="w-3 h-3 text-amber-500 fill-amber-500" /> {product.rating}
                </div>
                <img 
                  src={[
                    "/chemicals/c1.jpg",
                    "/chemicals/c2.jpg",
                    "/chemicals/c3.jpg",
                    "/chemicals/c4.avif",
                    "/chemicals/c5.jpg"
                  ][(String(product.id).split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)) % 5]} 
                  alt={product.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>

              <div className="p-4 flex flex-col flex-1">
                <h3 className="font-bold text-slate-900 leading-snug line-clamp-2 group-hover:text-indigo-600 transition-colors mb-1">
                  {product.name}
                </h3>
                <p className="text-xs text-slate-500 mb-3 line-clamp-1">CAS: {product.casNumber}</p>

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
                    <span className="text-[10px] text-slate-500 ml-1 truncate max-w-[100px]">{product.supplierName}</span>
                  </div>

                  <div className="flex gap-2">
                    <button className="flex-1 text-center bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold py-2 rounded-lg text-sm transition-colors border border-indigo-200">
                      Add to Cart
                    </button>
                    <Link
                      to={`/buyer/rfq/create?product=${encodeURIComponent(product.name)}`}
                      className="flex-1 text-center bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 rounded-lg text-sm transition-colors"
                    >
                      Contact
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
