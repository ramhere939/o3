import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { CheckCircle, Circle, Truck, MapPin, Package, Clock, Download } from "lucide-react";
import { getOrders } from "@/lib/mock-api";
import { formatCurrency, formatDate } from "@/lib/utils";
import { StatusChip } from "@/components/shared/StatusChip";
import { PageHeader, SectionCard } from "@/components/shared/UIHelpers";
import { useState } from "react";

export default function ShipmentTracking() {
  const [selectedOrderId, setSelectedOrderId] = useState("o3");

  const { data: orders, isLoading } = useQuery({
    queryKey: ["orders"],
    queryFn: () => getOrders(),
  });

  const selectedOrder = orders?.find((o) => o.id === selectedOrderId);
  const activeOrders = orders?.filter((o) => o.status !== "delivered") || [];
  const allTrackable = orders?.slice(0, 10) || [];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Shipment Tracking"
        subtitle="Real-time tracking for all your orders"
        breadcrumb={["Buyer Portal", "Shipment Tracking"]}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Order list */}
        <div className="space-y-3">
          {isLoading ? (
            Array.from({ length: 4 }).map((_, i) => <div key={i} className="skeleton h-24 rounded-xl" />)
          ) : (
            allTrackable.map((order) => (
              <button
                key={order.id}
                onClick={() => setSelectedOrderId(order.id)}
                className={`w-full text-left p-4 rounded-xl border transition-all ${
                  selectedOrderId === order.id
                    ? "border-indigo-400 bg-indigo-50 shadow-sm"
                    : "border-slate-200 bg-white hover:border-slate-300"
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-slate-900 truncate">{order.poNumber}</p>
                    <p className="text-xs text-slate-500 truncate">{order.productName}</p>
                    <p className="text-xs text-slate-400">{order.supplierName}</p>
                  </div>
                  <StatusChip status={order.status} />
                </div>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-xs text-slate-400">{formatDate(order.createdAt)}</span>
                  <span className="text-xs font-semibold text-slate-700">{formatCurrency(order.totalAmount)}</span>
                </div>
              </button>
            ))
          )}
        </div>

        {/* Tracking detail */}
        <div className="lg:col-span-2 space-y-4">
          {selectedOrder ? (
            <>
              {/* Order summary card */}
              <SectionCard>
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h2 className="text-base font-bold text-slate-900">{selectedOrder.poNumber}</h2>
                      <StatusChip status={selectedOrder.status} />
                    </div>
                    <p className="text-sm text-slate-600">{selectedOrder.productName}</p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {selectedOrder.quantity.toLocaleString()} {selectedOrder.quantityUnit} · {selectedOrder.supplierName}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-bold text-slate-900">{formatCurrency(selectedOrder.totalAmount)}</p>
                    <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium mt-1 ${
                      selectedOrder.paymentStatus === "paid" ? "bg-emerald-100 text-emerald-700" :
                      selectedOrder.paymentStatus === "overdue" ? "bg-rose-100 text-rose-700" :
                      "bg-amber-100 text-amber-700"
                    }`}>
                      Payment: {selectedOrder.paymentStatus}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4 mt-4 pt-4 border-t border-slate-100 text-xs text-slate-500">
                  <div className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    <span>Expected: {formatDate(selectedOrder.expectedDelivery)}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Package className="w-3.5 h-3.5" />
                    <span>PO Date: {formatDate(selectedOrder.createdAt)}</span>
                  </div>
                </div>

                <div className="flex gap-2 mt-4">
                  {selectedOrder.invoiceUrl && selectedOrder.invoiceUrl !== "#" && (
                    <button className="flex items-center gap-1.5 text-xs border border-slate-200 rounded-lg px-3 py-1.5 text-slate-600 hover:bg-slate-50">
                      <Download className="w-3.5 h-3.5" /> Invoice
                    </button>
                  )}
                  {selectedOrder.poUrl && (
                    <button className="flex items-center gap-1.5 text-xs border border-slate-200 rounded-lg px-3 py-1.5 text-slate-600 hover:bg-slate-50">
                      <Download className="w-3.5 h-3.5" /> PO Document
                    </button>
                  )}
                  {selectedOrder.ewayBillUrl && (
                    <button className="flex items-center gap-1.5 text-xs border border-slate-200 rounded-lg px-3 py-1.5 text-slate-600 hover:bg-slate-50">
                      <Download className="w-3.5 h-3.5" /> E-way Bill
                    </button>
                  )}
                </div>
              </SectionCard>

              {/* Timeline */}
              <SectionCard title="Shipment Timeline">
                <div className="space-y-0">
                  {selectedOrder.shipmentEvents.map((event, i) => {
                    const isCompleted = event.completed;
                    const isLast = i === selectedOrder.shipmentEvents.length - 1;

                    return (
                      <div key={event.status} className="flex gap-4">
                        {/* Icon column */}
                        <div className="flex flex-col items-center">
                          <motion.div
                            initial={{ scale: 0.5, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ delay: i * 0.1 }}
                            className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                              isCompleted
                                ? "bg-emerald-500 text-white"
                                : i === selectedOrder.shipmentEvents.filter((e) => e.completed).length
                                ? "bg-indigo-100 border-2 border-indigo-400 text-indigo-600 animate-pulse"
                                : "bg-slate-100 text-slate-300"
                            }`}
                          >
                            {isCompleted ? (
                              <CheckCircle className="w-4 h-4" />
                            ) : (
                              <Circle className="w-4 h-4" />
                            )}
                          </motion.div>
                          {!isLast && (
                            <div className={`w-0.5 flex-1 my-1 ${isCompleted ? "bg-emerald-300" : "bg-slate-200"}`}
                              style={{ minHeight: 32 }} />
                          )}
                        </div>

                        {/* Content */}
                        <div className={`flex-1 pb-6 ${isLast ? "pb-0" : ""}`}>
                          <div className="flex items-start justify-between">
                            <div>
                              <p className={`text-sm font-semibold ${isCompleted ? "text-slate-900" : "text-slate-400"}`}>
                                {event.label}
                              </p>
                              {event.location && isCompleted && (
                                <div className="flex items-center gap-1 mt-0.5">
                                  <MapPin className="w-3 h-3 text-slate-400" />
                                  <span className="text-xs text-slate-500">{event.location}</span>
                                </div>
                              )}
                            </div>
                            <span className={`text-xs ${isCompleted ? "text-slate-500" : "text-slate-300"}`}>
                              {isCompleted ? new Date(event.timestamp).toLocaleDateString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }) : "Pending"}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </SectionCard>
            </>
          ) : (
            <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
              <Truck className="w-10 h-10 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500">Select an order to view tracking details</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
