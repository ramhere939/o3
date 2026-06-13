import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Send, Paperclip, Star, Shield, ArrowLeft, Loader2, Check, X, MessageSquare } from "lucide-react";
import { PageHeader, SectionCard } from "@/components/shared/UIHelpers";
import { formatRelativeTime } from "@/lib/utils";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getRFQById, getQuotes, acceptQuote } from "@/lib/mock-api";
import { io, Socket } from "socket.io-client";

interface Message {
  id: string;
  sender: "buyer" | "supplier";
  text: string;
  timestamp: string;
  counterPrice?: number;
  counterLeadTime?: number;
}

export default function QuoteNegotiate() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const rfqId = searchParams.get("rfqId") || "";
  const quoteId = searchParams.get("quoteId") || "";

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [socket, setSocket] = useState<Socket | null>(null);
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

  const quote = quoteId ? quotes?.find(q => q.id === quoteId) : quotes?.[0];
  const activeQuoteId = quote?.id || "";

  // Accept Quote Mutation
  const acceptMutation = useMutation({
    mutationFn: (qid: string) => acceptQuote(qid),
    onSuccess: () => {
      alert("Quote accepted successfully! Notification sent to supplier.");
      queryClient.invalidateQueries({ queryKey: ["quotes", rfqId] });
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      queryClient.invalidateQueries({ queryKey: ["rfqs"] });
      navigate("/buyer/orders");
    },
    onError: (error) => {
      console.error(error);
      alert("Failed to accept quote. Please restart the backend server.");
    }
  });

  useEffect(() => {
    if (!activeQuoteId) return;

    // Fetch message history
    fetch(`${import.meta.env.VITE_API_URL || "http://localhost:3001"}/api/quotes/${activeQuoteId}/messages`)
      .then(res => res.json())
      .then(data => {
        if(Array.isArray(data)) {
          setMessages(data);
        }
      })
      .catch(console.error);

    const newSocket = io(import.meta.env.VITE_API_URL || "http://localhost:3001");
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
    if (!input.trim()) return;
    if (!socket || !activeQuoteId) return;

    const data = {
      quoteId: activeQuoteId,
      sender: "buyer",
      text: input.trim(),
    };

    socket.emit("send_message", data);
    
    setInput("");
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
        subtitle="Real-time chat negotiation with supplier"
        breadcrumb={["Buyer Portal", "Compare Quotes", "Negotiate"]}
        action={
          <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900 border border-slate-200 px-3 py-1.5 rounded-lg hover:bg-slate-50">
            <ArrowLeft className="w-4 h-4" /> Back to Quotes
          </button>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Supplier Info panel */}
        <SectionCard title="Quote Details" className="h-fit">
          <div className="space-y-4">
            <div className="text-center pb-4 border-b border-slate-100">
              <div className="w-14 h-14 bg-indigo-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
                <span className="text-xl font-bold text-indigo-700">{quote.supplierName.charAt(0)}</span>
              </div>
              <h3 className="font-semibold text-slate-900">{quote.supplierName}</h3>
              <div className="flex items-center justify-center gap-1 mt-1">
                <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                <span className="text-sm font-medium text-slate-700">{quote.supplierRating || "N/A"}</span>
              </div>
            </div>

            <div className="space-y-3">
              {[
                { label: "Product", value: rfq?.productName },
                { label: "RFQ Number", value: rfq?.rfqNumber },
                { label: "Offered Price", value: `₹${quote.price}/${quote.priceUnit}` },
                { label: "Quantity", value: `${quote.quantity} ${quote.quantityUnit}` },
                { label: "Total Value", value: `₹${quote.totalAmount.toLocaleString('en-IN')}` },
                { label: "Lead Time", value: `${quote.leadTimeDays} days` },
                { label: "Payment Terms", value: quote.paymentTerms },
              ].map((row) => (
                <div key={row.label} className="flex justify-between text-sm">
                  <span className="text-slate-500">{row.label}</span>
                  <span className="font-medium text-slate-800 text-right">{row.value}</span>
                </div>
              ))}
            </div>

            <div className="pt-4 border-t border-slate-100 space-y-2">
              <button 
                onClick={() => acceptMutation.mutate(quote.id)}
                disabled={acceptMutation.isPending || quote.status === 'accepted'}
                className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-sm font-semibold py-2.5 rounded-xl transition-colors flex items-center justify-center gap-2"
              >
                {acceptMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                {quote.status === 'accepted' ? 'Already Accepted' : 'Accept This Quote'}
              </button>
            </div>
          </div>
        </SectionCard>

        {/* Chat panel */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 flex flex-col" style={{ height: "calc(100vh - 200px)", minHeight: 500 }}>
          {/* Chat header */}
          <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-100">
            <div className="w-9 h-9 bg-indigo-100 rounded-lg flex items-center justify-center">
              <span className="text-sm font-bold text-indigo-700">{quote.supplierName.charAt(0)}</span>
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-900">{quote.supplierName}</p>
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                <p className="text-xs text-slate-500">Connected via WebSockets</p>
              </div>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
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
                  {(msg.counterPrice || msg.counterLeadTime) && (
                    <div className="bg-indigo-50 border border-indigo-100 rounded-lg p-3 mt-2 text-xs">
                      <p className="font-semibold text-indigo-900 mb-1">Counter Offer Proposed:</p>
                      <ul className="text-indigo-800 space-y-0.5">
                        {msg.counterPrice && <li>• Revised Price: ₹{msg.counterPrice}/{quote.priceUnit}</li>}
                        {msg.counterLeadTime && <li>• Revised Lead Time: {msg.counterLeadTime} days</li>}
                      </ul>
                    </div>
                  )}
                  <span className="text-[10px] text-slate-400 mt-1 px-1">
                    {formatRelativeTime(msg.timestamp)}
                  </span>
                </div>
              </motion.div>
            ))}
            <div ref={bottomRef} />
          </div>

          {/* Input area */}
          <div className="p-4 border-t border-slate-100 bg-slate-50">
            <div className="flex gap-3 items-end">
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
                disabled={!input.trim()}
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
