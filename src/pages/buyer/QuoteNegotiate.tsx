import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Send, Paperclip, Star, Shield } from "lucide-react";
import { PageHeader, SectionCard } from "@/components/shared/UIHelpers";
import { formatRelativeTime } from "@/lib/utils";

interface Message {
  id: string;
  sender: "buyer" | "supplier";
  text: string;
  timestamp: string;
  attachment?: string;
  counterOffer?: {
    price: number;
    leadTimeDays: number;
  };
}

const INITIAL_MESSAGES: Message[] = [
  { id: "m1", sender: "supplier", text: "Hello! We've reviewed your RFQ for Titanium Dioxide (2000 kg). We can offer ₹182/kg with Net 30 payment terms and 7-day lead time from our Vadodara facility.", timestamp: "2024-09-04T09:00:00Z" },
  { id: "m2", sender: "buyer", text: "Thank you for your quote. Can you reduce the price to ₹178/kg? We're also considering 2 other suppliers. We'd prefer Net 30 terms, so payment terms are fine.", timestamp: "2024-09-04T09:45:00Z" },
  { id: "m3", sender: "supplier", text: "We can offer ₹179/kg as our best price — this is a 1.6% reduction from our original quote. At this quantity (2000 kg), our margins are already tight. We can also commit to 5-day lead time instead of 7 days.", timestamp: "2024-09-04T10:15:00Z" },
  { id: "m4", sender: "buyer", text: "Can you include the COA and TDS free of cost with the shipment? If yes, we can accept ₹179/kg.", timestamp: "2024-09-04T10:30:00Z" },
  { id: "m5", sender: "supplier", text: "Absolutely — COA and TDS will be provided free of charge with every batch. We can confirm: ₹179/kg, Net 30, 5-day lead time, free COA & TDS. Please confirm acceptance.", timestamp: "2024-09-04T10:45:00Z" },
];

export default function QuoteNegotiate() {
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [showCounterForm, setShowCounterForm] = useState(false);
  const [counterPrice, setCounterPrice] = useState("");
  const [counterLeadTime, setCounterLeadTime] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim()) return;
    const userMsg: Message = {
      id: `m${Date.now()}`,
      sender: "buyer",
      text: input.trim() || "Sent a counter offer.",
      timestamp: new Date().toISOString(),
      counterOffer: showCounterForm && counterPrice ? {
        price: Number(counterPrice),
        leadTimeDays: Number(counterLeadTime) || 7,
      } : undefined,
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setCounterPrice("");
    setCounterLeadTime("");
    setShowCounterForm(false);
    setIsTyping(true);

    await new Promise((r) => setTimeout(r, 1800));
    const supplierMsg: Message = {
      id: `m${Date.now() + 1}`,
      sender: "supplier",
      text: "Thank you for your message. Let me review this and get back to you shortly. We value your partnership and are keen to finalize this deal.",
      timestamp: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, supplierMsg]);
    setIsTyping(false);
  };

  return (
    <div className="space-y-4">
      <PageHeader
        title="Quote Negotiation"
        subtitle="Real-time chat negotiation with supplier"
        breadcrumb={["Buyer Portal", "Compare Quotes", "Negotiate"]}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Supplier Info panel */}
        <SectionCard title="Supplier Details" className="h-fit">
          <div className="space-y-4">
            <div className="text-center pb-4 border-b border-slate-100">
              <div className="w-14 h-14 bg-indigo-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
                <span className="text-xl font-bold text-indigo-700">A</span>
              </div>
              <h3 className="font-semibold text-slate-900">Aditya Chemicals Pvt Ltd</h3>
              <div className="flex items-center justify-center gap-1 mt-1">
                <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                <span className="text-sm font-medium text-slate-700">4.8</span>
                <span className="text-xs text-slate-400">(124 reviews)</span>
              </div>
              <div className="flex items-center justify-center gap-1 mt-1">
                <Shield className="w-3.5 h-3.5 text-emerald-500" />
                <span className="text-xs text-emerald-600 font-medium">O3 Assured Supplier</span>
              </div>
            </div>

            <div className="space-y-3">
              {[
                { label: "Product", value: "Titanium Dioxide (Rutile)" },
                { label: "RFQ Number", value: "RFQ-2024-0001" },
                { label: "Offered Price", value: "₹179/kg" },
                { label: "Quantity", value: "2,000 kg" },
                { label: "Total Value", value: "₹3,58,000" },
                { label: "Lead Time", value: "5 days" },
                { label: "Payment Terms", value: "Net 30 Days" },
                { label: "Valid Until", value: "Sep 10, 2024" },
              ].map((row) => (
                <div key={row.label} className="flex justify-between text-sm">
                  <span className="text-slate-500">{row.label}</span>
                  <span className="font-medium text-slate-800 text-right">{row.value}</span>
                </div>
              ))}
            </div>

            <div className="pt-4 border-t border-slate-100 space-y-2">
              <button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold py-2.5 rounded-xl transition-colors">
                Accept This Quote
              </button>
              <button className="w-full border border-slate-200 text-slate-600 text-sm font-medium py-2.5 rounded-xl hover:bg-slate-50">
                Reject Quote
              </button>
            </div>
          </div>
        </SectionCard>

        {/* Chat panel */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 flex flex-col" style={{ height: "calc(100vh - 200px)", minHeight: 500 }}>
          {/* Chat header */}
          <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-100">
            <div className="w-9 h-9 bg-indigo-100 rounded-lg flex items-center justify-center">
              <span className="text-sm font-bold text-indigo-700">A</span>
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-900">Aditya Chemicals Pvt Ltd</p>
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                <p className="text-xs text-slate-500">Online</p>
              </div>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {messages.map((msg) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex ${msg.sender === "buyer" ? "justify-end" : "justify-start"}`}
              >
                <div className={`max-w-[75%] ${msg.sender === "buyer" ? "items-end" : "items-start"} flex flex-col`}>
                  <div className={`px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                    msg.sender === "buyer"
                      ? "bg-indigo-600 text-white rounded-tr-sm"
                      : "bg-slate-100 text-slate-800 rounded-tl-sm"
                  }`}>
                    {msg.text}
                  </div>
                  {msg.counterOffer && (
                    <div className="bg-indigo-50 border border-indigo-100 rounded-lg p-3 mt-2 text-xs">
                      <p className="font-semibold text-indigo-900 mb-1">Counter Offer Proposed:</p>
                      <ul className="text-indigo-800 space-y-0.5">
                        <li>• Revised Price: ₹{msg.counterOffer.price}/kg</li>
                        <li>• Revised Lead Time: {msg.counterOffer.leadTimeDays} days</li>
                      </ul>
                    </div>
                  )}
                  <span className="text-[10px] text-slate-400 mt-1 px-1">
                    {formatRelativeTime(msg.timestamp)}
                  </span>
                </div>
              </motion.div>
            ))}

            {/* Typing indicator */}
            {isTyping && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex justify-start"
              >
                <div className="bg-slate-100 rounded-2xl rounded-tl-sm px-4 py-3">
                  <div className="flex gap-1">
                    {[0, 1, 2].map((i) => (
                      <motion.div
                        key={i}
                        className="w-1.5 h-1.5 bg-slate-400 rounded-full"
                        animate={{ y: [-2, 2, -2] }}
                        transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }}
                      />
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            <div ref={bottomRef} />
          </div>

          {/* Input area */}
          <div className="p-4 border-t border-slate-100 bg-slate-50">
            {showCounterForm && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mb-3 bg-white border border-slate-200 rounded-xl p-3 grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Proposed Price (₹/kg)</label>
                  <input type="number" value={counterPrice} onChange={(e) => setCounterPrice(e.target.value)} className="w-full text-sm border border-slate-200 rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-indigo-500" placeholder="e.g. 175" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Lead Time (Days)</label>
                  <input type="number" value={counterLeadTime} onChange={(e) => setCounterLeadTime(e.target.value)} className="w-full text-sm border border-slate-200 rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-indigo-500" placeholder="e.g. 5" />
                </div>
              </motion.div>
            )}
            <div className="flex gap-3 items-end">
              <button onClick={() => setShowCounterForm(!showCounterForm)} className={`text-slate-400 hover:text-indigo-600 p-2 rounded-lg transition-colors ${showCounterForm ? 'bg-indigo-50 text-indigo-600' : ''}`} title="Propose Counter Offer">
                <Paperclip className="w-4 h-4" />
              </button>
              <div className="flex-1 relative">
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      sendMessage();
                    }
                  }}
                  placeholder="Type your message... (Enter to send)"
                  rows={1}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                />
              </div>
              <button
                onClick={sendMessage}
                disabled={!input.trim() && !counterPrice}
                className="w-10 h-10 flex items-center justify-center bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-200 text-white rounded-xl transition-colors flex-shrink-0"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
