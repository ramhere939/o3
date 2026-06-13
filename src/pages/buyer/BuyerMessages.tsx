import { useState, useEffect, useRef } from "react";
import { Search, Filter, MessageSquare, Plus, CheckSquare, Settings, X, Send, Loader2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { io, Socket } from "socket.io-client";
import { getQuotes } from "@/lib/mock-api";
import { useApp } from "@/context/AppContext";

interface Message {
  id: string;
  sender: "buyer" | "supplier";
  text: string;
  timestamp: string;
  quoteId: string;
}

export default function BuyerMessages() {
  const { user } = useApp();
  const [selectedChat, setSelectedChat] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  const { data: quotes, isLoading: quotesLoading } = useQuery({
    queryKey: ["quotes", user.role, user.id],
    queryFn: () => getQuotes({}), // mock buyer id inside if needed
    enabled: !!user.role,
  });

  useEffect(() => {
    if (!quotes || quotes.length === 0) return;

    const newSocket = io(import.meta.env.VITE_API_URL || "http://localhost:3001");
    setSocket(newSocket);

    newSocket.on("connect", () => {
      quotes.forEach(quote => {
        newSocket.emit("join_quote_room", quote.id);
      });
    });

    newSocket.on("receive_message", (msg: Message) => {
      setMessages(prev => {
        if (prev.find(m => m.id === msg.id)) return prev;
        return [...prev, msg];
      });
    });

    return () => {
      newSocket.disconnect();
    };
  }, [quotes]);

  useEffect(() => {
    if (!selectedChat) return;
    
    fetch(`${import.meta.env.VITE_API_URL || "http://localhost:3001"}/api/quotes/${selectedChat}/messages`)
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
  }, [selectedChat]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, selectedChat]);

  const handleSend = () => {
    if (!input.trim() || !socket || !selectedChat) return;

    const data = {
      quoteId: selectedChat,
      sender: "buyer",
      text: input.trim(),
    };
    
    socket.emit("send_message", data);
    setInput("");
  };

  const activeMessages = messages.filter(m => m.quoteId === selectedChat);
  const activeQuote = quotes?.find(q => q.id === selectedChat);

  return (
    <div className="flex h-[calc(100vh-4rem)] bg-slate-50 -m-6 overflow-hidden">
      {/* Pane 1: Left Navigation */}
      <div className="w-64 bg-[#f8f9fa] border-r border-slate-200 flex flex-col flex-shrink-0">
        <div className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search"
              className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-3">
          <div className="mb-6">
            <h3 className="text-xs font-bold text-slate-800 px-3 mb-2">Inbox</h3>
            <button className="w-full flex items-center gap-3 px-3 py-2 bg-white rounded-lg shadow-sm text-sm font-bold text-slate-900 border border-slate-200">
              <MessageSquare className="w-4 h-4" /> All
            </button>
            <button className="w-full flex items-center gap-3 px-3 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg mt-1">
              <div className="w-4 h-4 rounded-full border border-slate-400 flex items-center justify-center">
                <span className="w-1.5 h-1.5 bg-indigo-600 rounded-full"></span>
              </div>
              Unread
            </button>
          </div>


        </div>

        <div className="p-4 border-t border-slate-200 flex items-center gap-4 text-slate-400">
          <CheckSquare className="w-5 h-5 hover:text-slate-600 cursor-pointer" />
          <div className="w-px h-4 bg-slate-300"></div>
          <Settings className="w-5 h-5 hover:text-slate-600 cursor-pointer" />
        </div>
      </div>

      {/* Pane 2: Chat List */}
      <div className="w-[320px] bg-white border-r border-slate-200 flex flex-col flex-shrink-0">
        <div className="flex items-center justify-between px-4 py-4 border-b border-slate-100">
          <span className="font-bold text-slate-900">All</span>
          <button className="text-slate-400 hover:text-slate-600">
            <Filter className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {quotesLoading ? (
            <div className="flex justify-center p-8"><Loader2 className="w-6 h-6 animate-spin text-slate-400" /></div>
          ) : quotes?.length === 0 ? (
            <div className="p-8 text-center text-slate-500 text-sm">No active chats</div>
          ) : (
            quotes?.map(quote => {
              const quoteMsgs = messages.filter(m => m.quoteId === quote.id);
              const lastMsg = quoteMsgs[quoteMsgs.length - 1];

              return (
                <button
                  key={quote.id}
                  onClick={() => setSelectedChat(quote.id)}
                  className={`w-full flex items-start gap-3 p-4 border-b border-slate-50 hover:bg-slate-50 transition-colors text-left ${selectedChat === quote.id ? 'bg-indigo-50/50' : ''}`}
                >
                  <div className="relative">
                    <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold">
                      {quote.supplierName?.charAt(0) || "S"}
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-baseline mb-0.5">
                      <span className="font-bold text-slate-900 text-sm truncate pr-2">{quote.supplierName}</span>
                      <span className="text-[10px] text-slate-400">
                        {lastMsg ? new Date(lastMsg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ""}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 truncate">{lastMsg ? lastMsg.text : `Quote ${quote.quoteNumber}`}</p>
                    <p className="text-[10px] text-slate-400 mt-1">RFQ: {quote.rfqId}</p>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* Pane 3: Main Chat Area */}
      <div className="flex-1 bg-white relative flex flex-col">
        {!selectedChat || !activeQuote ? (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center relative">
            <div className="max-w-md text-slate-400">
              <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium">Select a conversation to start messaging</p>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col bg-slate-50">
            {/* Header */}
            <div className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between flex-shrink-0">
              <div className="flex items-center gap-3">
                <span className="font-bold text-slate-900">
                  {activeQuote.supplierName}
                </span>
                <span className="px-2 py-0.5 bg-amber-100 text-amber-700 text-[10px] font-bold rounded">Gold Supplier</span>
              </div>
              <button className="text-slate-400 hover:text-indigo-600">
                <Settings className="w-5 h-5" />
              </button>
            </div>
            
            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-4" ref={scrollRef}>
              {activeMessages.length === 0 ? (
                <div className="text-center text-slate-500 text-sm mt-10">
                  No messages yet. Send a message to start the conversation!
                </div>
              ) : (
                activeMessages.map((msg, i) => {
                  const isMe = msg.sender === "buyer";
                  return (
                    <div key={i} className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}>
                      <div 
                        className={`max-w-md px-4 py-3 rounded-2xl text-sm shadow-sm ${
                          isMe ? "bg-indigo-600 text-white rounded-br-none" : "bg-white border border-slate-200 text-slate-800 rounded-bl-none"
                        }`}
                      >
                        <p className="whitespace-pre-wrap">{msg.text}</p>
                      </div>
                      <span className="text-[10px] text-slate-400 mt-1 mx-1">
                        {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  );
                })
              )}
            </div>
            
            {/* Input Area */}
            <div className="p-4 bg-white border-t border-slate-200">
              <div className="flex items-center gap-2 mb-2 text-slate-400">
                <button className="p-1 hover:text-indigo-600"><Plus className="w-5 h-5" /></button>
              </div>
              <textarea 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                className="w-full resize-none border-0 focus:ring-0 p-0 text-sm bg-transparent"
                rows={3}
                placeholder="Type a message..."
              />
              <div className="flex justify-end mt-2">
                <button 
                  onClick={handleSend}
                  disabled={!input.trim()}
                  className="px-6 py-1.5 bg-indigo-600 text-white rounded-full text-sm font-bold hover:bg-indigo-700 transition-colors disabled:opacity-50"
                >
                  Send
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
