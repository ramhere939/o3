import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageSquare, X, ChevronLeft, Send, Loader2 } from "lucide-react";
import { io, Socket } from "socket.io-client";
import { useQuery } from "@tanstack/react-query";
import { useApp } from "@/context/AppContext";
import { getQuotes } from "@/lib/mock-api";

interface Message {
  id: string;
  sender: "buyer" | "supplier";
  text: string;
  timestamp: string;
  quoteId: string;
}

export function GlobalChatWidget() {
  const { user } = useApp();
  const [isOpen, setIsOpen] = useState(false);
  const [activeQuoteId, setActiveQuoteId] = useState<string | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [messages, setMessages] = useState<Message[]>([]);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  // Determine what quotes to fetch based on role
  const { data: quotes, isLoading: quotesLoading } = useQuery({
    queryKey: ["quotes", user.role, user.id],
    queryFn: () => getQuotes(user.role === "supplier" ? { supplierId: "s1" } : { /* mock buyer */ }),
    enabled: !!user.role,
  });

  useEffect(() => {
    if (!quotes || quotes.length === 0) return;

    // Pre-fetch message history for all active quotes so the UI is instantly ready
    quotes.forEach(quote => {
      fetch(`/api/quotes/${quote.id}/messages`)
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data) && data.length > 0) {
            setMessages(prev => {
              const newMessages = [...prev];
              let changed = false;
              data.forEach((d: Message) => {
                if (!newMessages.find(m => m.id === d.id)) {
                  newMessages.push(d);
                  changed = true;
                }
              });
              if (changed) {
                return newMessages.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
              }
              return prev;
            });
          }
        })
        .catch(console.error);
    });

    const newSocket = io("http://localhost:3001");
    setSocket(newSocket);

    newSocket.on("connect", () => {
      // Join all active quote rooms so we receive messages for all of them
      quotes.forEach(quote => {
        newSocket.emit("join_quote_room", quote.id);
      });
    });

    newSocket.on("receive_message", (msg: Message) => {
      setMessages(prev => {
        if (prev.find(m => m.id === msg.id)) return prev;
        return [...prev, msg];
      });

      // Increment unread count if message is from the other party and chat is not actively open
      if (msg.sender !== user.role) {
        setIsOpen((currentIsOpen) => {
          if (!currentIsOpen || activeQuoteId !== msg.quoteId) {
            setUnreadCount(prevCount => prevCount + 1);
          }
          return currentIsOpen;
        });
      }
    });

    return () => {
      newSocket.disconnect();
    };
  }, [quotes, activeQuoteId, user.role]);

  // Listen for custom 'openChat' event to open from anywhere
  useEffect(() => {
    const handleOpenChat = (e: Event) => {
      const customEvent = e as CustomEvent<string | undefined>;
      setIsOpen(true);
      if (customEvent.detail) {
        setActiveQuoteId(customEvent.detail);
      }
    };

    window.addEventListener("openChat", handleOpenChat);
    return () => window.removeEventListener("openChat", handleOpenChat);
  }, []);

  // Fetch history for active chat
  useEffect(() => {
    if (!activeQuoteId) return;
    
    // Clear unread when opening a chat
    setUnreadCount(0);

    // Join the room for this specific chat, to ensure we receive socket events
    // even if it was newly created and we missed the initial bulk join
    if (socket) {
      socket.emit("join_quote_room", activeQuoteId);
    }

    fetch(`/api/quotes/${activeQuoteId}/messages`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setMessages(prev => {
            const newMessages = [...prev];
            data.forEach((d: Message) => {
              if (!newMessages.find(m => m.id === d.id)) {
                newMessages.push(d);
              }
            });
            return newMessages.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
          });
        }
      })
      .catch(console.error);
  }, [activeQuoteId, socket]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isOpen, activeQuoteId]);

  const handleSend = () => {
    if (!input.trim() || !socket || !activeQuoteId) return;

    const data = {
      quoteId: activeQuoteId,
      sender: user.role,
      text: input.trim(),
    };
    
    socket.emit("send_message", data);
    setInput("");
  };

  const activeMessages = messages.filter(m => m.quoteId === activeQuoteId);
  const activeQuote = quotes?.find(q => q.id === activeQuoteId);

  return (
    <>
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ x: 50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 50, opacity: 0 }}
            onClick={() => {
              setIsOpen(true);
              setUnreadCount(0);
            }}
            className="fixed top-1/2 right-0 -translate-y-1/2 z-50 flex flex-col items-center justify-center p-3 gap-2 bg-white border border-slate-200 border-r-0 rounded-l-xl shadow-[-4px_0_12px_rgba(0,0,0,0.05)] hover:bg-slate-50 transition-colors group"
          >
            <div className="relative">
              <MessageSquare className="w-6 h-6 text-indigo-600 group-hover:scale-110 transition-transform" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-rose-500 border-2 border-white"></span>
                </span>
              )}
            </div>
            <span className="text-[10px] font-bold text-slate-600" style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}>
              Messages
            </span>
          </motion.button>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ x: 50, opacity: 0, y: '-50%' }}
            animate={{ x: 0, opacity: 1, y: '-50%' }}
            exit={{ x: 50, opacity: 0, y: '-50%' }}
            className="fixed top-1/2 right-6 z-50 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col"
            style={{ height: "500px", maxHeight: "80vh" }}
          >
            {/* Header */}
            <div className="bg-indigo-600 text-white px-4 py-3 flex items-center justify-between shadow-sm z-10 flex-shrink-0">
              <div className="flex items-center gap-2">
                {activeQuoteId && (
                  <button onClick={() => setActiveQuoteId(null)} className="p-1 hover:bg-white/20 rounded-full transition-colors">
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                )}
                <div>
                  <h3 className="font-semibold text-sm">
                    {activeQuoteId ? `Chat: ${activeQuote?.quoteNumber}` : "Messages"}
                  </h3>
                  {activeQuoteId && activeQuote && (
                    <p className="text-[10px] text-indigo-100 opacity-90 truncate max-w-[200px]">
                      {user.role === "supplier" ? activeQuote.supplierName : "Supplier"}
                    </p>
                  )}
                </div>
              </div>
              <button onClick={() => setIsOpen(false)} className="p-1 hover:bg-white/20 rounded-full transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content area */}
            <div className="flex-1 bg-slate-50 flex flex-col overflow-hidden relative">
              {!activeQuoteId ? (
                // Chat List
                <div className="flex-1 overflow-y-auto">
                  {quotesLoading ? (
                    <div className="flex justify-center p-8"><Loader2 className="w-6 h-6 animate-spin text-slate-400" /></div>
                  ) : quotes?.length === 0 ? (
                    <div className="p-8 text-center text-slate-500 text-sm">No active chats</div>
                  ) : (
                    <div className="divide-y divide-slate-100">
                      {quotes?.map((quote) => {
                        // Find latest message for this quote
                        const quoteMsgs = messages.filter(m => m.quoteId === quote.id);
                        const lastMsg = quoteMsgs[quoteMsgs.length - 1];

                        return (
                          <div
                            key={quote.id}
                            onClick={() => setActiveQuoteId(quote.id)}
                            className="p-4 bg-white hover:bg-slate-50 cursor-pointer transition-colors flex gap-3"
                          >
                            <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0">
                              <span className="text-indigo-600 font-bold text-sm">
                                {quote.quoteNumber.slice(-2)}
                              </span>
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex justify-between items-center mb-0.5">
                                <h4 className="font-semibold text-sm text-slate-800 truncate">
                                  {user.role === "supplier" ? quote.quoteNumber : quote.supplierName}
                                </h4>
                                {lastMsg && (
                                  <span className="text-[10px] text-slate-400">
                                    {new Date(lastMsg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                  </span>
                                )}
                              </div>
                              <p className="text-xs text-slate-500 truncate">
                                {lastMsg ? lastMsg.text : "Click to view messages..."}
                              </p>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              ) : (
                // Chat Window
                <div className="flex-1 flex flex-col h-full bg-white">
                  <div className="flex-1 overflow-y-auto p-4 space-y-4" ref={scrollRef}>
                    {activeMessages.map((msg, i) => {
                      const isMe = msg.sender === user.role;
                      return (
                        <div key={i} className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}>
                          <div 
                            className={`max-w-[85%] px-3 py-2 rounded-2xl text-sm shadow-sm ${
                              isMe ? "bg-indigo-600 text-white rounded-br-none" : "bg-slate-100 text-slate-800 rounded-bl-none"
                            }`}
                          >
                            {msg.text}
                          </div>
                          <span className="text-[10px] text-slate-400 mt-1 mx-1">
                            {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      )
                    })}
                  </div>
                  
                  {/* Input Area */}
                  <div className="p-3 bg-white border-t border-slate-100 flex items-center gap-2">
                    <input
                      type="text"
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleSend()}
                      placeholder="Type a message..."
                      className="flex-1 bg-slate-50 border border-slate-200 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                    <button
                      onClick={handleSend}
                      disabled={!input.trim()}
                      className="p-2 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
