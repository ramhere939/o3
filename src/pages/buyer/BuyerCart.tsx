import { Package, Trash2, ArrowRight } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { PageHeader } from "@/components/shared/UIHelpers";
import { useState, useEffect } from "react";

const MOCK_CART = [
  {
    id: 1,
    supplier: "Guangzhou Lianxian Elect...",
    product: "Industrial Grade Titanium Dioxide (TiO2)",
    cas: "13463-67-7",
    price: 182,
    quantity: 500,
    unit: "kg",
    total: 91000,
  },
  {
    id: 2,
    supplier: "Aditya Chemicals Ltd.",
    product: "Sodium Hydroxide Pearls 99%",
    cas: "1310-73-2",
    price: 45,
    quantity: 1000,
    unit: "kg",
    total: 45000,
  }
];

export default function BuyerCart() {
  const location = useLocation();
  const [cartItems, setCartItems] = useState(() => {
    const saved = localStorage.getItem("o3_buyer_cart");
    return saved ? JSON.parse(saved) : MOCK_CART;
  });

  useEffect(() => {
    localStorage.setItem("o3_buyer_cart", JSON.stringify(cartItems));
  }, [cartItems]);

  useEffect(() => {
    if (location.state?.newCartItem) {
      setCartItems(prev => [location.state.newCartItem, ...prev]);
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  const subtotal = cartItems.reduce((acc, item) => acc + item.total, 0);

  return (
    <div className="max-w-[1200px] mx-auto space-y-6 pb-10">
      <PageHeader
        title="Shopping Cart"
        breadcrumb={["Buyer Portal", "Cart"]}
      />

      <div className="flex flex-col lg:flex-row gap-8">
        <div className="flex-1 space-y-4">
          <div className="bg-white rounded-xl border border-slate-200 p-4 font-bold text-slate-800 flex justify-between">
            <span>Product</span>
            <span className="w-24 text-center">Quantity</span>
            <span className="w-24 text-right">Total</span>
          </div>

          {cartItems.map((item) => (
            <div key={item.id} className="bg-white rounded-xl border border-slate-200 p-6 flex flex-col sm:flex-row gap-6 items-start sm:items-center">
              <div className="w-16 h-16 bg-slate-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <Package className="w-8 h-8 text-slate-300" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-slate-900 line-clamp-1">{item.product}</h3>
                <p className="text-xs text-slate-500 mt-1">Supplier: {item.supplier}</p>
                <p className="text-xs text-slate-500">CAS: {item.cas}</p>
                <p className="text-sm font-semibold text-indigo-600 mt-2">₹{item.price}/{item.unit}</p>
              </div>
              
              <div className="flex items-center gap-4">
                <div className="flex items-center border border-slate-200 rounded-lg">
                  <button className="px-3 py-1 text-slate-500 hover:bg-slate-50">-</button>
                  <input type="number" value={item.quantity} readOnly className="w-16 text-center text-sm font-medium border-x border-slate-200 py-1" />
                  <button className="px-3 py-1 text-slate-500 hover:bg-slate-50">+</button>
                </div>
              </div>

              <div className="w-24 text-right">
                <p className="font-bold text-slate-900">₹{item.total.toLocaleString()}</p>
              </div>

              <button className="text-slate-400 hover:text-rose-500 transition-colors p-2">
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          ))}
        </div>

        <div className="w-full lg:w-80 flex-shrink-0">
          <div className="bg-white rounded-xl border border-slate-200 p-6 sticky top-20">
            <h3 className="font-bold text-slate-900 mb-6 text-lg">Order Summary</h3>
            
            <div className="space-y-4 mb-6">
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Subtotal ({cartItems.length} items)</span>
                <span className="font-semibold text-slate-900">₹{subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Shipping</span>
                <span className="font-semibold text-amber-600">Calculated at checkout</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Taxes</span>
                <span className="font-semibold text-amber-600">Calculated at checkout</span>
              </div>
            </div>
            
            <div className="border-t border-slate-100 pt-4 mb-6">
              <div className="flex justify-between items-baseline">
                <span className="font-bold text-slate-900">Total Estimate</span>
                <span className="text-xl font-black text-indigo-600">₹{subtotal.toLocaleString()}</span>
              </div>
            </div>

            <button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-lg transition-colors flex items-center justify-center gap-2">
              Proceed to Checkout <ArrowRight className="w-4 h-4" />
            </button>
            
            <Link to="/buyer/catalog" className="block text-center mt-4 text-sm text-indigo-600 font-medium hover:underline">
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
