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

export interface CartItem {
  id: number;
  supplier: string;
  product: string;
  cas: string;
  price: number;
  quantity: number;
  unit: string;
  total: number;
  image?: string;
}

export default function BuyerCart() {
  const location = useLocation();
  const [cartItems, setCartItems] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem("o3_buyer_cart");
    return saved ? JSON.parse(saved) : MOCK_CART;
  });

  useEffect(() => {
    localStorage.setItem("o3_buyer_cart", JSON.stringify(cartItems));
    window.dispatchEvent(new Event("cartUpdated"));
  }, [cartItems]);

  useEffect(() => {
    if (location.state?.newCartItem) {
      setCartItems((prev: CartItem[]) => {
        const newItem = location.state.newCartItem as CartItem;
        const existingIdx = prev.findIndex((item: CartItem) => item.product === newItem.product);
        if (existingIdx >= 0) {
          const next = [...prev];
          next[existingIdx] = {
            ...next[existingIdx],
            quantity: next[existingIdx].quantity + newItem.quantity,
            total: next[existingIdx].total + newItem.total
          };
          return next;
        }
        return [newItem, ...prev];
      });
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  const subtotal = cartItems.reduce((acc: number, item: CartItem) => acc + item.total, 0);

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

          {cartItems.map((item: CartItem) => (
            <div key={item.id} className="bg-white rounded-xl border border-slate-200 p-6 flex flex-col sm:flex-row gap-6 items-start sm:items-center">
              <div className="w-16 h-16 bg-slate-100 rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden border border-slate-200">
                {item.image ? (
                  <img src={item.image} alt={item.product} className="w-full h-full object-cover" />
                ) : (
                  <Package className="w-8 h-8 text-slate-300" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-slate-900 line-clamp-1">{item.product}</h3>
                <p className="text-xs text-slate-500 mt-1">Supplier: {item.supplier}</p>
                <p className="text-xs text-slate-500">CAS: {item.cas}</p>
                <p className="text-sm font-semibold text-indigo-600 mt-2">₹{item.price}/{item.unit}</p>
              </div>
              
              <div className="flex items-center gap-4">
                <div className="flex items-center border border-slate-200 rounded-lg overflow-hidden">
                  <button onClick={() => {
                    const next = [...cartItems];
                    const i = next.findIndex((x: CartItem) => x.id === item.id);
                    if (next[i].quantity > 1) {
                      next[i] = { ...next[i], quantity: next[i].quantity - 1, total: (next[i].quantity - 1) * next[i].price };
                      setCartItems(next);
                    }
                  }} className="px-3 py-1 text-slate-500 hover:bg-slate-100 transition-colors bg-white font-bold">-</button>
                  <input type="number" value={item.quantity} readOnly className="w-16 text-center text-sm font-medium border-x border-slate-200 py-1 bg-slate-50" />
                  <button onClick={() => {
                    const next = [...cartItems];
                    const i = next.findIndex((x: CartItem) => x.id === item.id);
                    next[i] = { ...next[i], quantity: next[i].quantity + 1, total: (next[i].quantity + 1) * next[i].price };
                    setCartItems(next);
                  }} className="px-3 py-1 text-slate-500 hover:bg-slate-100 transition-colors bg-white font-bold">+</button>
                </div>
              </div>

              <div className="w-24 text-right">
                <p className="font-bold text-slate-900">₹{item.total.toLocaleString()}</p>
              </div>

              <button onClick={() => {
                setCartItems(cartItems.filter((x: CartItem) => x.id !== item.id));
              }} className="text-slate-400 hover:text-rose-500 transition-colors p-2">
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

            <button 
              onClick={() => {
                if (cartItems.length === 0) {
                  alert("Your cart is empty!");
                  return;
                }
                alert("Order placed successfully! Redirecting to your orders.");
                setCartItems([]);
                localStorage.setItem("o3_buyer_cart", JSON.stringify([]));
                window.dispatchEvent(new Event("cartUpdated"));
                setTimeout(() => {
                  window.location.href = "/buyer/orders";
                }, 1000);
              }}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
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
