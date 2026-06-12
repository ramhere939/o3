import { Edit2, Copy, Info, Contact } from "lucide-react";
import { useApp } from "@/context/AppContext";

export default function BuyerAccount() {
  const { user } = useApp();

  return (
    <div className="max-w-[800px] mx-auto space-y-6 pb-10 mt-6">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-black text-slate-900">Profile</h1>
        <div className="flex items-center gap-2">
          <div className="w-10 h-6 bg-slate-200 rounded-full flex items-center p-1 cursor-pointer">
            <div className="w-4 h-4 bg-white rounded-full shadow-sm"></div>
          </div>
          <span className="text-sm font-medium text-slate-700 flex items-center gap-1">
            Preview profile <Info className="w-4 h-4 text-slate-500" />
          </span>
        </div>
      </div>

      <div className="bg-[#f9fafb] rounded-xl border border-slate-200 overflow-hidden">
        <div className="p-5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Contact className="w-5 h-5 text-slate-700" />
            <h2 className="text-lg font-bold text-slate-900">Basic information</h2>
          </div>
          <button className="text-slate-600 hover:text-slate-900">
            <Edit2 className="w-5 h-5" />
          </button>
        </div>

        <div className="mx-5 mb-5 bg-white rounded-xl border border-slate-100 p-6 shadow-sm">
          <div className="flex items-start gap-6">
            <div className="w-16 h-16 bg-[#fff2e5] rounded-full flex items-center justify-center text-2xl font-bold text-[#c2410c] flex-shrink-0">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div className="space-y-2.5">
              <h3 className="text-xl font-medium text-slate-900 leading-none">{user.name}</h3>
              <div className="space-y-1.5 text-sm text-slate-600">
                <div className="flex items-center gap-1.5">
                  <span>Member ID in19092538427rakw</span>
                  <Copy className="w-3.5 h-3.5 text-slate-400 cursor-pointer hover:text-slate-600" />
                </div>
                <div className="flex items-center gap-1.5">
                  <span>Country of registration 🇮🇳 IN</span>
                  <Info className="w-3.5 h-3.5 text-slate-400 cursor-pointer hover:text-slate-600" />
                </div>
                <div>
                  <span>Year joined 2026</span>
                </div>
              </div>
            </div>
          </div>

          <div className="h-px bg-slate-100 my-6"></div>

          <div className="space-y-1">
            <h4 className="font-bold text-slate-900 text-sm">Email</h4>
            <div className="flex items-center gap-2">
              <span className="text-slate-600 text-sm">{user.email.replace(/(.{3})(.*)(@.*)/, "$1***$3")}</span>
              <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">Verified</span>
            </div>
          </div>

          <div className="h-px bg-slate-100 my-6"></div>

          <div className="space-y-1 pb-2">
            <h4 className="font-bold text-slate-900 text-sm">Phone number</h4>
            <span className="text-slate-600 text-sm block">No phone number</span>
          </div>
        </div>
      </div>
    </div>
  );
}
