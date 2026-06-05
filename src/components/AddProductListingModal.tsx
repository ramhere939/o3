import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion, AnimatePresence } from "framer-motion";
import { X, UploadCloud, Loader2, CheckCircle } from "lucide-react";
import type { Product } from "@/types";

const listingSchema = z.object({
  name: z.string().min(2, "Product name is required"),
  casNumber: z.string().min(2, "CAS Number is required"),
  hsnCode: z.string().min(4, "HSN Code is required"),
  category: z.string().min(1, "Category is required"),
  grade: z.string().min(1, "Grade is required"),
  price: z.number().min(0, "Price must be positive"),
  priceUnit: z.enum(["kg", "mt", "litre", "drum", "bag"]),
  moq: z.number().min(1, "MOQ must be at least 1"),
  moqUnit: z.enum(["kg", "mt", "litre", "drum", "bag"]),
  leadTimeDays: z.number().min(1, "Lead time is required"),
  description: z.string().min(10, "Description should be at least 10 characters"),
});

type ListingInput = z.infer<typeof listingSchema>;

interface AddProductListingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (data: ListingInput) => Promise<void>;
}

export function AddProductListingModal({ isOpen, onClose, onConfirm }: AddProductListingModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<ListingInput>({
    resolver: zodResolver(listingSchema),
    defaultValues: {
      priceUnit: "kg",
      moqUnit: "kg",
      category: "Petrochemicals",
      grade: "Industrial Grade",
    }
  });

  const onSubmit = async (data: ListingInput) => {
    setIsSubmitting(true);
    await onConfirm(data);
    setIsSubmitting(false);
    setIsSuccess(true);
  };

  const handleClose = () => {
    reset();
    setIsSuccess(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-end bg-slate-900/50 backdrop-blur-sm">
        <motion.div
          initial={{ x: "100%" }}
          animate={{ x: 0 }}
          exit={{ x: "100%" }}
          transition={{ type: "spring", damping: 25, stiffness: 200 }}
          className="bg-white w-full max-w-xl h-full shadow-2xl flex flex-col"
        >
          {isSuccess ? (
             <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
              <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mb-6">
                <CheckCircle className="w-10 h-10 text-emerald-600" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900 mb-2">Listing Added!</h2>
              <p className="text-slate-500 mb-8">
                Your product has been added to the catalog and is pending admin approval.
              </p>
              <button
                onClick={handleClose}
                className="w-full max-w-xs bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-3 rounded-xl transition-colors"
              >
                Close
              </button>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between p-6 border-b border-slate-100">
                <h3 className="text-xl font-bold text-slate-900">Add New Listing</h3>
                <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-lg text-slate-400">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6">
                <form id="listing-form" onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                  
                  {/* Basic Details */}
                  <div className="space-y-4">
                    <h4 className="text-sm font-semibold text-slate-900 uppercase tracking-wider">Basic Details</h4>
                    
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1.5">Chemical Name *</label>
                      <input
                        {...register("name")}
                        placeholder="e.g. Sodium Hypochlorite"
                        className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
                      />
                      {errors.name && <p className="text-xs text-rose-500 mt-1">{errors.name.message}</p>}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">CAS Number *</label>
                        <input
                          {...register("casNumber")}
                          placeholder="e.g. 7681-52-9"
                          className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
                        />
                        {errors.casNumber && <p className="text-xs text-rose-500 mt-1">{errors.casNumber.message}</p>}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">HSN Code *</label>
                        <input
                          {...register("hsnCode")}
                          placeholder="e.g. 282890"
                          className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
                        />
                        {errors.hsnCode && <p className="text-xs text-rose-500 mt-1">{errors.hsnCode.message}</p>}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">Category *</label>
                        <select {...register("category")} className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm bg-white focus:ring-2 focus:ring-indigo-500">
                          <option value="Petrochemicals">Petrochemicals</option>
                          <option value="Polymers">Polymers</option>
                          <option value="Inorganic Chemicals">Inorganic Chemicals</option>
                          <option value="Specialty Chemicals">Specialty Chemicals</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">Grade *</label>
                        <select {...register("grade")} className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm bg-white focus:ring-2 focus:ring-indigo-500">
                          <option value="Industrial Grade">Industrial Grade</option>
                          <option value="Technical Grade">Technical Grade</option>
                          <option value="Food Grade">Food Grade</option>
                          <option value="Pharma Grade">Pharma Grade</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <hr className="border-slate-100" />

                  {/* Pricing & Inventory */}
                  <div className="space-y-4">
                    <h4 className="text-sm font-semibold text-slate-900 uppercase tracking-wider">Pricing & Inventory</h4>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">Unit Price (₹) *</label>
                        <input
                          type="number"
                          step="0.01"
                          {...register("price", { valueAsNumber: true })}
                          className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
                        />
                        {errors.price && <p className="text-xs text-rose-500 mt-1">{errors.price.message}</p>}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">Per *</label>
                        <select {...register("priceUnit")} className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm bg-white focus:ring-2 focus:ring-indigo-500">
                          <option value="kg">KG</option>
                          <option value="mt">MT</option>
                          <option value="litre">Litre</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">MOQ *</label>
                        <input
                          type="number"
                          {...register("moq", { valueAsNumber: true })}
                          className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
                        />
                        {errors.moq && <p className="text-xs text-rose-500 mt-1">{errors.moq.message}</p>}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">MOQ Unit *</label>
                        <select {...register("moqUnit")} className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm bg-white focus:ring-2 focus:ring-indigo-500">
                           <option value="kg">KG</option>
                          <option value="mt">MT</option>
                          <option value="drum">Drum</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1.5">Lead Time (Days) *</label>
                      <input
                        type="number"
                        {...register("leadTimeDays", { valueAsNumber: true })}
                        className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                  </div>

                  <hr className="border-slate-100" />

                  {/* Documentation */}
                  <div className="space-y-4">
                    <h4 className="text-sm font-semibold text-slate-900 uppercase tracking-wider">Documentation</h4>
                    
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1.5">Product Description</label>
                      <textarea
                        {...register("description")}
                        rows={3}
                        className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 resize-none"
                      />
                    </div>

                    <div>
                       <label className="block text-sm font-medium text-slate-700 mb-1.5">Safety Data Sheet (SDS)</label>
                       <div className="border-2 border-dashed border-slate-200 rounded-xl p-6 flex flex-col items-center justify-center text-center bg-slate-50">
                         <UploadCloud className="w-8 h-8 text-slate-400 mb-2" />
                         <p className="text-sm font-medium text-indigo-600 cursor-pointer">Click to upload</p>
                         <p className="text-xs text-slate-500 mt-1">PDF up to 5MB</p>
                       </div>
                    </div>
                  </div>

                </form>
              </div>

              <div className="p-6 border-t border-slate-100 bg-slate-50 flex gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-6 py-2.5 border border-slate-200 bg-white text-slate-600 rounded-xl text-sm font-medium hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  form="listing-form"
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-semibold py-2.5 rounded-xl transition-colors flex items-center justify-center gap-2"
                >
                  {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Submit Listing"}
                </button>
              </div>
            </>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
