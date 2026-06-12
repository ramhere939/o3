import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  FileText, ChevronRight, MessageSquare
} from "lucide-react";
import { getBuyerDashboardStats, getOrders } from "@/lib/mock-api";

const CONVERSION_DATA = [
  { name: "Sent", value: 50, color: "#6366f1" },
  { name: "Quoted", value: 35, color: "#8b5cf6" },
  { name: "Accepted", value: 20, color: "#10b981" },
  { name: "Ordered", value: 14, color: "#f59e0b" },
];

export default function BuyerDashboard() {
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["buyer-stats"],
    queryFn: () => getBuyerDashboardStats("b1"),
  });

  const { data: orders, isLoading: ordersLoading } = useQuery({
    queryKey: ["orders"],
    queryFn: () => getOrders(),
  });

  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const activeTab = queryParams.get("tab") || "dashboard";
  const navigate = useNavigate();

  const ORDER_TABS = ["All", "Confirming", "Unpaid", "Preparing to ship", "Delivering", "Refunds & after-sales"];
  const [activeOrderTab, setActiveOrderTab] = useState("All");

  return (
    <div className="max-w-[1400px] mx-auto pb-10">
      <div className="flex items-center gap-2 mb-6 text-sm">
        <span className="font-bold text-slate-800">My Profile</span>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Main Content */}
        <div className="flex-1 space-y-6">
          {activeTab === "orders" ? (
            <div className="bg-white rounded-xl border border-slate-200 p-6">
              <h2 className="text-xl font-bold text-slate-900 mb-6">All Orders</h2>
              {/* Order Tabs */}
              <div className="flex gap-2 mb-8 overflow-x-auto pb-2 scrollbar-hide">
                {ORDER_TABS.map(tab => (
                  <button
                    key={tab}
                    onClick={() => setActiveOrderTab(tab)}
                    className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                      activeOrderTab === tab
                        ? "bg-slate-900 text-white border-2 border-slate-900"
                        : "bg-white text-slate-600 border border-slate-200 hover:border-slate-400"
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
              
              {ordersLoading ? (
                <div className="py-20 flex justify-center"><div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" /></div>
              ) : orders && orders.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-slate-200 bg-slate-50">
                        <th className="py-3 px-4 text-xs font-semibold text-slate-500">PO Number</th>
                        <th className="py-3 px-4 text-xs font-semibold text-slate-500">Product</th>
                        <th className="py-3 px-4 text-xs font-semibold text-slate-500">Total Amount</th>
                        <th className="py-3 px-4 text-xs font-semibold text-slate-500">Status</th>
                        <th className="py-3 px-4 text-xs font-semibold text-slate-500">Payment</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {orders.filter(o => activeOrderTab === 'All' || o.status.toLowerCase() === activeOrderTab.toLowerCase()).map(order => (
                        <tr key={order.id} className="hover:bg-slate-50 transition-colors">
                          <td className="py-3 px-4 text-sm font-semibold text-slate-900">{order.poNumber}</td>
                          <td className="py-3 px-4 text-sm text-slate-600">{order.productName}</td>
                          <td className="py-3 px-4 text-sm font-bold text-indigo-600">₹{order.totalAmount.toLocaleString('en-IN')}</td>
                          <td className="py-3 px-4">
                            <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${order.status === 'delivered' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                              {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${order.paymentStatus === 'paid' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                              {order.paymentStatus.charAt(0).toUpperCase() + order.paymentStatus.slice(1)}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                  <FileText className="w-16 h-16 text-slate-200 mb-4" />
                  <p className="text-slate-500 text-sm">No orders found in this category.</p>
                </div>
              )}
            </div>
          ) : (
            <>
              {/* Profile Top Banner */}
              <div className="bg-white rounded-xl border border-slate-200 p-6">
                <div className="flex items-center justify-between mb-8 pb-6 border-b border-slate-100">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-amber-100 rounded-full flex items-center justify-center overflow-hidden border-2 border-white shadow-md">
                      <span className="text-2xl">🦁</span>
                    </div>
                    <div>
                      <h2 className="text-lg font-bold text-slate-900">Buyer User</h2>
                      <Link to="/buyer/account" className="text-xs text-indigo-600 hover:underline">Profile</Link>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-3 divide-x divide-slate-100 text-center mb-6">
                  <div>
                    <p className="text-2xl font-bold text-slate-900">{stats?.unreadMessages ?? 0}</p>
                    <p className="text-xs text-slate-500 mt-1">Unread messages</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-slate-900">{stats?.activeRFQs ?? 0}</p>
                    <p className="text-xs text-slate-500 mt-1">New quotes</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-slate-900">0</p>
                    <p className="text-xs text-slate-500 mt-1">Coupons</p>
                  </div>
                </div>

              </div>

              {/* Dashboard Orders Preview */}
              <div className="bg-white rounded-xl border border-slate-200 p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-bold text-slate-900">Orders</h3>
                  <button onClick={() => handleTabChange('orders')} className="text-sm text-slate-500 hover:text-indigo-600 flex items-center gap-1">
                    View all <ChevronRight className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex gap-2 mb-8 overflow-x-auto pb-2 scrollbar-hide">
                  {ORDER_TABS.map(tab => (
                    <button
                      key={tab}
                      onClick={() => setActiveOrderTab(tab)}
                      className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                        activeOrderTab === tab
                          ? "bg-slate-900 text-white border-2 border-slate-900"
                          : "bg-white text-slate-600 border border-slate-200 hover:border-slate-400"
                      }`}
                    >
                      {tab}
                    </button>
                  ))}
                </div>

                {ordersLoading ? (
                  <div className="py-10 flex justify-center"><div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" /></div>
                ) : orders?.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-10 text-center">
                    <FileText className="w-16 h-16 text-slate-200 mb-4" />
                    <p className="text-slate-500 text-sm">No orders yet.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {orders?.slice(0, 3).map((order) => (
                      <div key={order.id} onClick={() => navigate('/buyer/orders')} className="flex items-center justify-between p-4 rounded-xl border border-slate-100 hover:border-slate-200 bg-slate-50/50 hover:bg-slate-50 cursor-pointer transition-colors">
                        <div>
                          <p className="text-sm font-semibold text-slate-900">{order.poNumber}</p>
                          <p className="text-xs text-slate-500">{order.productName}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-bold text-indigo-600">₹{order.totalAmount.toLocaleString('en-IN')}</p>
                          <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${order.status === 'delivered' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
