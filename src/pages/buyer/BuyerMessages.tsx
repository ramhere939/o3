import { useState } from "react";
import { Search, Filter, MessageSquare, Plus, CheckSquare, Settings, HeadphonesIcon, X } from "lucide-react";

export default function BuyerMessages() {
  const [selectedChat, setSelectedChat] = useState<number | null>(null);

  const [chats, setChats] = useState([
    {
      id: 1,
      name: "Laura C",
      company: "Guangzhou Lianxian Elect...",
      country: "China",
      time: "15:07",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Laura",
      productImg: "https://via.placeholder.com/40",
      unread: true
    },
    {
      id: 2,
      name: "Aditya Chemicals",
      company: "Aditya Chemicals Ltd.",
      country: "India",
      time: "11:20",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Aditya",
      productImg: "https://via.placeholder.com/40",
      unread: false
    }
  ]);

  // Read mock messages from localStorage
  const existingStr = localStorage.getItem("o3_mock_messages");
  const mockMessages = existingStr ? JSON.parse(existingStr) : [];
  
  const mockChat = mockMessages.length > 0 ? {
    id: 999,
    name: "Supplier",
    company: mockMessages[0].supplier,
    country: "China",
    time: mockMessages[mockMessages.length - 1].time,
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Supplier",
    productImg: "https://via.placeholder.com/40",
    unread: false
  } : null;

  const displayChats = mockChat ? [mockChat, ...chats] : chats;

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

          <div>
            <div className="flex items-center justify-between px-3 mb-2">
              <h3 className="text-xs font-bold text-slate-800">Projects</h3>
              <button className="text-slate-400 hover:text-slate-600"><Plus className="w-4 h-4" /></button>
            </div>
            <div className="px-3 py-4 text-center">
              <p className="text-xs text-slate-500 mb-3 italic font-serif">Manage your contacts, quotes, and orders all in one place</p>
              <button className="w-full py-1.5 border border-slate-900 rounded-full text-sm font-bold text-slate-900 hover:bg-slate-100 transition-colors">
                Create a project
              </button>
            </div>
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
          {displayChats.map(chat => (
            <button
              key={chat.id}
              onClick={() => setSelectedChat(chat.id)}
              className={`w-full flex items-start gap-3 p-4 border-b border-slate-50 hover:bg-slate-50 transition-colors text-left ${selectedChat === chat.id ? 'bg-indigo-50/50' : ''}`}
            >
              <div className="relative">
                <img src={chat.avatar} alt={chat.name} className="w-10 h-10 rounded-full bg-slate-100" />
                {chat.unread && <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-rose-500 rounded-full border-2 border-white"></span>}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-baseline mb-0.5">
                  <span className="font-bold text-slate-900 text-sm truncate pr-2">{chat.name}</span>
                  <span className="text-[10px] text-slate-400">{chat.time}</span>
                </div>
                <p className="text-xs text-slate-500 truncate">{chat.company}</p>
                <p className="text-xs text-slate-400">{chat.country}</p>
              </div>
              <div className="w-10 h-10 rounded bg-slate-100 flex-shrink-0 border border-slate-200 overflow-hidden">
                <div className="w-full h-full bg-slate-200 flex items-center justify-center text-[8px] text-slate-400">IMG</div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Pane 3: Main Chat Area */}
      <div className="flex-1 bg-white relative flex flex-col">
        {!selectedChat ? (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center relative">
            <div className="max-w-md">
              <h2 className="text-xl font-serif font-bold text-slate-900 mb-6 leading-relaxed">
                From product design to CRM, run your entire business in one conversation with O3.com.
              </h2>
              <button className="px-6 py-2 bg-white border border-slate-900 rounded-full text-slate-900 font-bold hover:bg-slate-50 transition-colors">
                Free trial
              </button>
            </div>
            
            {/* Customer Service Floating Button */}
            <button className="absolute right-0 top-1/2 -translate-y-1/2 bg-orange-500 text-white rounded-l-full py-2 px-4 shadow-lg flex items-center gap-2 hover:bg-orange-600 transition-colors">
              <span className="text-sm font-medium">Customer service</span>
              <span className="w-2 h-2 bg-emerald-400 rounded-full"></span>
            </button>

            {/* Bottom Banner */}
            <div className="absolute bottom-0 left-0 right-0 bg-[#427ed1] text-white p-3 flex items-center justify-between">
              <span className="text-sm font-medium">Tell us about your communication experience.</span>
              <button className="text-white/80 hover:text-white"><X className="w-4 h-4" /></button>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col bg-slate-50">
            {/* Header */}
            <div className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between flex-shrink-0">
              <div className="flex items-center gap-3">
                <span className="font-bold text-slate-900">
                  {displayChats.find(c => c.id === selectedChat)?.name}
                </span>
                <span className="px-2 py-0.5 bg-amber-100 text-amber-700 text-[10px] font-bold rounded">Gold Supplier</span>
              </div>
              <button className="text-slate-400 hover:text-indigo-600">
                <Settings className="w-5 h-5" />
              </button>
            </div>
            
            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-4">
              {selectedChat === 999 ? (
                <>
                  <div className="bg-white rounded-lg p-4 border border-slate-200 max-w-sm self-start">
                    <p className="text-sm text-slate-700">Hello, I'm the supplier. How can I help you today?</p>
                    <span className="text-[10px] text-slate-400 mt-2 block">Earlier</span>
                  </div>
                  {mockMessages.map((msg: any) => (
                    <div key={msg.id} className="bg-indigo-100 rounded-lg p-4 border border-indigo-200 max-w-md self-end">
                      <p className="text-sm text-slate-800 whitespace-pre-wrap">{msg.text}</p>
                      <span className="text-[10px] text-indigo-500 mt-2 block text-right">{msg.time}</span>
                    </div>
                  ))}
                </>
              ) : (
                <div className="bg-white rounded-lg p-4 border border-slate-200 max-w-sm self-start">
                  <p className="text-sm text-slate-700">Hello, I saw your RFQ for Titanium Dioxide. Are you still looking for a supplier?</p>
                  <span className="text-[10px] text-slate-400 mt-2 block">11:20 AM</span>
                </div>
              )}
            </div>
            
            {/* Input Area */}
            <div className="p-4 bg-white border-t border-slate-200">
              <div className="flex items-center gap-2 mb-2 text-slate-400">
                <button className="p-1 hover:text-indigo-600"><Plus className="w-5 h-5" /></button>
              </div>
              <textarea 
                className="w-full resize-none border-0 focus:ring-0 p-0 text-sm bg-transparent"
                rows={3}
                placeholder="Type a message..."
              ></textarea>
              <div className="flex justify-end mt-2">
                <button className="px-6 py-1.5 bg-indigo-600 text-white rounded-full text-sm font-bold hover:bg-indigo-700 transition-colors">
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
