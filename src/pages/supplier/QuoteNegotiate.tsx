import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Send, Paperclip, Star, Shield, ArrowLeft, Loader2, MessageSquare } from "lucide-react";
import { PageHeader, SectionCard } from "@/components/shared/UIHelpers";
import { formatRelativeTime } from "@/lib/utils";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getRFQById, getQuotes } from "@/lib/mock-api";
import { io, Socket } from "socket.io-client";

interface Message {
  id: string;
  sender: "buyer" | "supplier";
  text: string;
  timestamp: string;
  counterPrice?: number;
  counterLeadTime?: number;
}

export default function SupplierQuoteNegotiate() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const rfqId = searchParams.get("rfqId") || "";
  const quoteId = searchParams.get("quoteId") || "";

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [socket, setSocket] = useState<Socket | null>(null);
  const [showCounterForm, setShowCounterForm] = useState(false);
  const [counterPrice, setCounterPrice] = useState("");
  const [counterLeadTime, setCounterLeadTime] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  const { data: rfq, isLoading: rfqLoading } = useQuery({
    queryKey: ["rfq", rfqId],
    queryFn: () => getRFQById(rfqId),
    enabled: !!rfqId,
  });

  const { data: quotes, isLoading: quotesLoading } = useQuery({
    queryKey: ["quotes", rfqId],
    queryFn: () => getQuotes({ rfqId }),
    enabled: !!rfqId,
  });

  const activeQuoteId = quoteId || quotes?.[0]?.id;
  const quote = quotes?.find(q => q.id === activeQuoteId);

  useEffect(() => {
    if (!activeQuoteId) return;

    fetch(`/api/quotes/${activeQuoteId}/messages`)
      .then(res => res.json())
      .then(data => {
        if(Array.isArray(data)) {
          setMessages(data);
        }
      })
      .catch(console.error);

    const newSocket = io("http://localhost:3001");
    setSocket(newSocket);

    newSocket.on("connect", () => {
      newSocket.emit("join_quote_room", activeQuoteId);
    });

    newSocket.on("receive_message", (msg: Message) => {
      setMessages((prev) => {
        if (prev.find((m) => m.id === msg.id)) return prev;
        return [...prev, msg];
      });
    });

    return () => {
      newSocket.disconnect();
    };
  }, [activeQuoteId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = () => {
    if (!input.trim() && !counterPrice) return;
    if (!socket || !activeQuoteId) return;

    const data = {
      quoteId: activeQuoteId,
      sender: "supplier",
      text: input.trim() || "Sent a counter offer.",
      counterPrice: showCounterForm && counterPrice ? Number(counterPrice) : null,
      counterLeadTime: showCounterForm && counterLeadTime ? Number(counterLeadTime) : null,
    };

    socket.emit("send_message", data);
    
    setInput("");
    setCounterPrice("");
    setCounterLeadTime("");
    setShowCounterForm(false);
  };

  if (rfqLoading || quotesLoading) {
    return (
      <div className="flex items-center justify-center h-64 text-indigo-500">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  if (!quote) {
    return <div className="p-8 text-center text-slate-500">Quote not found.</div>;
  }

  return (
    <div className="space-y-4">
      <PageHeader
        title="Quote Negotiation"
        subtitle="Real-time chat negotiation with buyer"
        breadcrumb={["Supplier Portal", "Negotiate"]}
        action={
          <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900 border border-slate-200 px-3 py-1.5 rounded-lg hover:bg-slate-50">
            <ArrowLeft className="w-4 h-4" /> Back to Dashboard
          </button>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-180px)] min-h-[600px]">
        {/* Left Column: Chat panel */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 flex flex-col h-full overflow-hidden">
          <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-100 bg-slate-50 flex-shrink-0">
            <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center shadow-sm">
              <span className="text-sm font-bold text-emerald-700">{rfq?.buyerName?.charAt(0) || "B"}</span>
            </div>
            <div>
              <p className="text-sm font-bold text-slate-900">{rfq?.buyerName}</p>
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                <p className="text-xs text-slate-500">Connected via Trade Manager</p>
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-5 space-y-6 bg-slate-50/50">
            {messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-400">
                <MessageSquare className="w-12 h-12 mb-3 text-slate-200" />
                <p>No messages yet. Send a message to start negotiating!</p>
              </div>
            ) : null}

            {messages.map((msg) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex ${msg.sender === "supplier" ? "justify-end" : "justify-start"}`}
              >
                <div className={`max-w-[75%] ${msg.sender === "supplier" ? "items-end" : "items-start"} flex flex-col`}>
                  <div className={`px-4 py-3 rounded-2xl text-sm leading-relaxed shadow-sm ${
                    msg.sender === "supplier"
                      ? "bg-[#165DFF] text-white rounded-tr-sm"
                      : "bg-white text-slate-800 border border-slate-200 rounded-tl-sm"
                  }`}>
                    {msg.text}
                  </div>
                  {(msg.counterPrice || msg.counterLeadTime) && (
                    <div className="bg-indigo-50 border border-indigo-100 rounded-lg p-3 mt-2 text-xs w-full max-w-sm shadow-sm">
                      <p className="font-semibold text-indigo-900 mb-2 flex items-center gap-1.5">
                        <Shield className="w-3.5 h-3.5" /> Official Counter Offer:
                      </p>
                      <div className="grid grid-cols-2 gap-2 text-indigo-800 bg-white p-2 rounded border border-indigo-50">
                        {msg.counterPrice && (
                          <div className="flex flex-col">
                            <span className="text-[10px] text-indigo-400 uppercase font-semibold tracking-wider">Unit Price</span>
                            <span className="font-bold">₹{msg.counterPrice}</span>
                          </div>
                        )}
                        {msg.counterLeadTime && (
                          <div className="flex flex-col border-l border-indigo-50 pl-2">
                            <span className="text-[10px] text-indigo-400 uppercase font-semibold tracking-wider">Lead Time</span>
                            <span className="font-bold">{msg.counterLeadTime} days</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                  <span className="text-[10px] text-slate-400 mt-1.5 px-1">
                    {formatRelativeTime(msg.timestamp)}
                  </span>
                </div>
              </motion.div>
            ))}
            <div ref={bottomRef} />
          </div>

          <div className="p-4 border-t border-slate-100 bg-white flex-shrink-0">
            <div className="flex gap-3 items-end">
              <button className="text-slate-400 hover:text-[#165DFF] p-2.5 rounded-full hover:bg-blue-50 transition-colors" title="Attach file">
                <Paperclip className="w-5 h-5" />
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
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#165DFF] focus:bg-white resize-none transition-all"
                />
              </div>
              <button
                onClick={sendMessage}
                disabled={!input.trim()}
                className="w-11 h-11 flex items-center justify-center bg-[#165DFF] hover:bg-blue-700 disabled:bg-slate-200 disabled:text-slate-400 text-white rounded-xl transition-colors shadow-sm flex-shrink-0"
              >
                <Send className="w-4 h-4 ml-0.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Context & Offer Form */}
        <div className="lg:col-span-1 flex flex-col gap-6 h-full overflow-hidden">
          
          <SectionCard title="RFQ Context" className="flex-shrink-0" noPadding>
            <div className="p-5 space-y-3">
              {[
                { label: "Product", value: rfq?.productName },
                { label: "Requested Qty", value: `${quote.quantity} ${quote.quantityUnit}` },
                { label: "Target Location", value: rfq?.deliveryLocation },
                { label: "Current Price", value: `₹${quote.price}/${quote.priceUnit}` },
                { label: "Lead Time", value: `${quote.leadTimeDays} days` },
              ].map((row) => (
                <div key={row.label} className="flex justify-between text-sm">
                  <span className="text-slate-500">{row.label}</span>
                  <span className="font-medium text-slate-800 text-right">{row.value}</span>
                </div>
              ))}
            </div>
            {quote.status === 'accepted' && (
              <div className="mx-5 mb-5 bg-emerald-50 text-emerald-700 text-sm font-medium py-2.5 rounded-lg text-center border border-emerald-200">
                This Quote is Accepted
              </div>
            )}
          </SectionCard>

          <SectionCard title="Submit Counter Offer" className="flex-1 flex flex-col min-h-0">
            <div className="flex-1 overflow-y-auto pr-2 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Proposed Price (₹/{quote.priceUnit})</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">₹</span>
                  <input type="number" value={counterPrice} onChange={(e) => setCounterPrice(e.target.value)} className="w-full text-sm border border-slate-200 rounded-lg pl-7 pr-3 py-2.5 focus:ring-2 focus:ring-[#165DFF] outline-none" placeholder={quote.price.toString()} />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Lead Time (Days)</label>
                <div className="relative">
                  <input type="number" value={counterLeadTime} onChange={(e) => setCounterLeadTime(e.target.value)} className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-[#165DFF] outline-none" placeholder={quote.leadTimeDays.toString()} />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">Days</span>
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Payment Terms</label>
                <select className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-[#165DFF] outline-none bg-white">
                  <option>30% Advance, 70% before shipment</option>
                  <option>100% Advance (T/T)</option>
                  <option>Letter of Credit (L/C) at sight</option>
                  <option>Net 30 Days</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Shipping Terms</label>
                <select className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-[#165DFF] outline-none bg-white">
                  <option>FOB (Free On Board)</option>
                  <option>EXW (Ex Works)</option>
                  <option>CIF (Cost, Insurance & Freight)</option>
                  <option>DDP (Delivered Duty Paid)</option>
                </select>
              </div>
            </div>
            
            <div className="pt-4 border-t border-slate-100 mt-4">
              <button 
                onClick={() => {
                  setShowCounterForm(true); 
                  if (!input) setInput(`I have prepared a counter offer based on our discussion.`);
                  // Small delay to ensure state update before sending
                  setTimeout(sendMessage, 50);
                }}
                disabled={!counterPrice && !counterLeadTime}
                className="w-full bg-[#FF6A00] hover:bg-[#E65C00] disabled:bg-slate-200 disabled:text-slate-400 text-white font-semibold py-2.5 rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                Submit Offer to Buyer
              </button>
            </div>
          </SectionCard>
        </div>
      </div>
    </div>
  );
}
