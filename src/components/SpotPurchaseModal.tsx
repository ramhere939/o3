import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, CheckCircle, Package, Loader2 } from "lucide-react";
import type { Product } from "@/types";

interface SpotPurchaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product | null;
  onConfirm: (quantity: number, paymentTerms: string) => Promise<void>;
}

export function SpotPurchaseModal({ isOpen, onClose, product, onConfirm }: SpotPurchaseModalProps) {
  const [quantity, setQuantity] = useState<number>(product?.moq || 100);
  const [paymentTerms, setPaymentTerms] = useState("advance");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    if (product?.moq) {
      setQuantity(product.moq);
    }
  }, [product]);

  if (!isOpen || !product) return null;

  const totalValue = quantity * product.price;

  const handleSubmit = async () => {
    if (quantity < product.moq) return;
    setIsSubmitting(true);
    
    // Add to cart
    const saved = localStorage.getItem("o3_buyer_cart");
    const cart = saved ? JSON.parse(saved) : [];
    const newItem = {
      id: Date.now(),
      supplier: product.supplierName,
      product: product.name,
      cas: product.casNumber || "13463-67-7",
      price: product.price,
      quantity: quantity,
      unit: product.priceUnit,
      total: totalValue,
      image: "/chemicals/c1.jpg"
    };
    
    const existingIdx = cart.findIndex((x: any) => x.product === newItem.product);
    if (existingIdx >= 0) {
      cart[existingIdx].quantity += quantity;
      cart[existingIdx].total += totalValue;
    } else {
      cart.push(newItem);
    }

    localStorage.setItem("o3_buyer_cart", JSON.stringify(cart));
    window.dispatchEvent(new Event("cartUpdated"));
    
    setIsSubmitting(false);
    setIsSuccess(true);
  };

  const handleClose = () => {
    setIsSuccess(false);
    onClose();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden"
        >
          {isSuccess ? (
            <div className="p-8 text-center">
              <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-emerald-600" />
              </div>
              <h2 className="text-xl font-bold text-slate-900 mb-2">Added to Cart!</h2>
              <p className="text-slate-500 text-sm mb-6">
                Your product has been added to your cart successfully.
              </p>
              <button
                onClick={handleClose}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2.5 rounded-xl text-sm transition-colors"
              >
                Done
              </button>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between p-4 border-b border-slate-100">
                <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                  <Package className="w-5 h-5 text-indigo-600" /> Add to Cart
                </h3>
                <button onClick={onClose} className="p-1 hover:bg-slate-100 rounded-md text-slate-400">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-4 space-y-4">
                <div className="bg-slate-50 rounded-xl p-4">
                  <p className="text-sm font-semibold text-slate-900">{product.name}</p>
                  <p className="text-xs text-slate-500 mt-1">Supplier: {product.supplierName}</p>
                  <div className="mt-2 flex justify-between items-center">
                    <span className="text-sm font-medium text-indigo-600">₹{product.price.toLocaleString("en-IN")}/{product.priceUnit}</span>
                    <span className="text-xs text-slate-500">MOQ: {product.moq} {product.moqUnit}</span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1.5">Quantity ({product.priceUnit}) *</label>
                  <input
                    type="number"
                    value={quantity}
                    onChange={(e) => setQuantity(Number(e.target.value))}
                    min={product.moq}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  {quantity < product.moq && <p className="text-xs text-rose-500 mt-1">Minimum order quantity is {product.moq}</p>}
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1.5">Payment Terms</label>
                  <select
                    value={paymentTerms}
                    onChange={(e) => setPaymentTerms(e.target.value)}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                  >
                    <option value="advance">100% Advance</option>
                    <option value="net_30">Net 30 Days</option>
                    <option value="net_60">Net 60 Days</option>
                  </select>
                </div>

                <div className="bg-indigo-50 rounded-lg p-4 flex justify-between items-center mt-2">
                  <p className="text-sm text-indigo-900 font-medium">Total Value</p>
                  <p className="text-lg font-bold text-indigo-700">₹{totalValue.toLocaleString("en-IN")}</p>
                </div>
              </div>

              <div className="p-4 border-t border-slate-100 flex gap-3">
                <button
                  onClick={onClose}
                  className="flex-1 py-2.5 border border-slate-200 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={quantity < product.moq || isSubmitting}
                  className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white rounded-xl text-sm font-medium transition-colors flex justify-center items-center gap-2"
                >
                  {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Add to Cart"}
                </button>
              </div>
            </>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
