import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { FlaskConical, Send, Loader2, AlertTriangle, Shield, Package, MessageSquare, Mic, MicOff } from "lucide-react";
import { PageHeader, SectionCard } from "@/components/shared/UIHelpers";
import { sdsRagChat } from "@/lib/mock-api";

const CHEMICALS = [
  "Hydrochloric Acid (HCl 33%)",
  "Sulphuric Acid (98%)",
  "Sodium Hydroxide (Caustic Soda)",
  "Isopropyl Alcohol",
  "Methanol",
  "Acetone",
  "Hydrogen Peroxide 35%",
  "Ammonia Solution",
];

interface SDSResult {
  chemical: string;
  hazardClass: string;
  hazardLevel: "low" | "medium" | "high" | "extreme";
  ppe: string[];
  firstAid: { situation: string; action: string }[];
  storage: string[];
  disposal: string;
  summary: string;
}

function generateSDS(chemical: string): SDSResult {
  const isAcid = chemical.toLowerCase().includes("acid") || chemical.toLowerCase().includes("hcl");
  const isAlkali = chemical.toLowerCase().includes("sodium hydroxide") || chemical.toLowerCase().includes("caustic") || chemical.toLowerCase().includes("ammonia");
  const isFlammable = ["methanol", "acetone", "isopropyl"].some((k) => chemical.toLowerCase().includes(k));

  return {
    chemical,
    hazardClass: isAcid ? "Corrosive Acid — Class 8" : isAlkali ? "Corrosive Base — Class 8" : isFlammable ? "Flammable Liquid — Class 3" : "Oxidizing Agent — Class 5",
    hazardLevel: isAcid || isAlkali ? "high" : isFlammable ? "medium" : "medium",
    ppe: [
      "Chemical-resistant gloves (nitrile/neoprene)",
      "Safety goggles or face shield",
      "Acid-resistant apron or lab coat",
      "Closed-toe shoes",
      ...(isAcid || isAlkali ? ["Respirator if handling in confined spaces"] : []),
      ...(isFlammable ? ["Anti-static footwear", "Fire-resistant clothing"] : []),
    ],
    firstAid: [
      { situation: "Skin Contact", action: isAcid ? "Immediately flush with large amounts of water for 15-20 minutes. Remove contaminated clothing. Seek medical attention." : "Rinse with water for 15 minutes. Seek medical advice." },
      { situation: "Eye Contact", action: "Flush eyes immediately with large amounts of water for at least 15 minutes, lifting upper and lower eyelids. Seek immediate medical attention." },
      { situation: "Ingestion", action: isFlammable ? "Do NOT induce vomiting. Call poison control immediately. Rinse mouth with water." : "Do NOT induce vomiting. Give water to dilute. Seek medical attention immediately." },
      { situation: "Inhalation", action: "Move to fresh air immediately. If breathing is difficult, administer oxygen. Seek medical attention." },
    ],
    storage: [
      `Store in a cool, dry, well-ventilated area away from direct sunlight`,
      isAcid || isAlkali ? "Store in corrosion-resistant containers (HDPE or glass)" : "Store in sealed, grounded containers",
      isFlammable ? "Keep away from heat, sparks, and open flames" : "Keep away from incompatible materials",
      "Keep containers tightly closed when not in use",
      "Store away from incompatible chemicals",
      isAcid ? "Never store acids near bases or oxidizers" : isAlkali ? "Never store near acids" : "Ensure proper earthing/bonding",
    ],
    disposal: "Dispose in accordance with local, state, and federal regulations. Do not pour down drains. Contact a licensed waste disposal company. Neutralize acids/bases before disposal where required.",
    summary: `${chemical} is classified as a ${isAcid ? "corrosive acid" : isAlkali ? "corrosive alkali" : isFlammable ? "flammable liquid" : "chemical"} requiring careful handling. Always follow standard laboratory safety protocols and consult your local regulatory guidelines for handling, storage, and disposal.`,
  };
}

const HAZARD_COLORS = {
  low: "bg-emerald-100 text-emerald-800 border-emerald-200",
  medium: "bg-amber-100 text-amber-800 border-amber-200",
  high: "bg-rose-100 text-rose-800 border-rose-200",
  extreme: "bg-rose-900 text-rose-100 border-rose-800",
};

export default function SDSAssistant() {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SDSResult | null>(null);

  // RAG Chat State
  const [chatInput, setChatInput] = useState("");
  const [chatMessages, setChatMessages] = useState<{ role: 'ai' | 'user', text: string }[]>([]);
  const [isChatting, setIsChatting] = useState(false);
  const [isListeningChat, setIsListeningChat] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const startListeningChat = () => {
    if (!("webkitSpeechRecognition" in window)) {
      alert("Voice input is not supported in this browser.");
      return;
    }
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = "en-US";

    recognition.onstart = () => setIsListeningChat(true);
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setChatInput(prev => prev ? prev + " " + transcript : transcript);
    };
    recognition.onerror = (event: any) => {
      console.error("Speech recognition error", event.error);
      setIsListeningChat(false);
    };
    recognition.onend = () => setIsListeningChat(false);

    recognition.start();
  };

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [chatMessages, isChatting]);

  const handleSearch = async () => {
    if (!query.trim()) return;
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1500));
    const matched = CHEMICALS.find((c) => c.toLowerCase().includes(query.toLowerCase()));
    setResult(generateSDS(matched || query));
    setChatMessages([{ role: 'ai', text: `I have analyzed the SDS for ${matched || query}. Ask me any questions about handling, storage, or safety!` }]);
    setLoading(false);
  };

  const handleChat = async () => {
    if (!chatInput.trim() || !result) return;
    const userMsg = chatInput.trim();
    setChatInput("");
    setChatMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setIsChatting(true);
    try {
      const response = await sdsRagChat(result.chemical, userMsg);
      setChatMessages(prev => [...prev, { role: 'ai', text: response.reply }]);
    } catch (e) {
      setChatMessages(prev => [...prev, { role: 'ai', text: "Error fetching response." }]);
    } finally {
      setIsChatting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <PageHeader
        title="SDS Assistant"
        subtitle="AI-powered Safety Data Sheet generator and hazard information"
        breadcrumb={["Platform", "SDS Assistant"]}
      />

      {/* Search */}
      <SectionCard>
        <div className="flex items-center gap-3 mb-4">
          <FlaskConical className="w-5 h-5 text-indigo-600" />
          <p className="text-sm font-medium text-slate-700">Enter a chemical name to get its SDS/MSDS information</p>
        </div>
        <div className="flex gap-3">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            placeholder="e.g. Hydrochloric Acid, Caustic Soda, Isopropyl Alcohol..."
            className="flex-1 px-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <button
            onClick={handleSearch}
            disabled={loading || !query.trim()}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-200 text-white font-medium px-5 py-2.5 rounded-lg transition-colors"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            {loading ? "Generating..." : "Get SDS"}
          </button>
        </div>

        {/* Quick select */}
        <div className="flex flex-wrap gap-2 mt-3">
          {CHEMICALS.slice(0, 5).map((c) => (
            <button
              key={c}
              onClick={() => { setQuery(c); }}
              className="text-xs bg-slate-100 hover:bg-indigo-100 hover:text-indigo-700 text-slate-600 px-3 py-1.5 rounded-full transition-colors"
            >
              {c}
            </button>
          ))}
        </div>
      </SectionCard>

      {/* Results */}
      {loading && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center py-12">
          <div className="w-12 h-12 rounded-2xl bg-indigo-100 flex items-center justify-center mb-3">
            <FlaskConical className="w-6 h-6 text-indigo-600 animate-pulse" />
          </div>
          <p className="text-slate-600 font-medium">Generating SDS information...</p>
        </motion.div>
      )}

      {result && !loading && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
          {/* Header */}
          <SectionCard>
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-lg font-bold text-slate-900">{result.chemical}</h2>
                <p className="text-sm text-slate-500 mt-0.5">{result.hazardClass}</p>
              </div>
              <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-sm font-semibold ${HAZARD_COLORS[result.hazardLevel]}`}>
                <AlertTriangle className="w-4 h-4" />
                {result.hazardLevel.charAt(0).toUpperCase() + result.hazardLevel.slice(1)} Hazard
              </div>
            </div>
            <p className="text-sm text-slate-600 mt-3 bg-slate-50 rounded-lg p-3">{result.summary}</p>
          </SectionCard>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* PPE */}
            <SectionCard title="Required PPE">
              <ul className="space-y-2">
                {result.ppe.map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-slate-700">
                    <Shield className="w-4 h-4 text-indigo-500 flex-shrink-0 mt-0.5" />
                    {item}
                  </li>
                ))}
              </ul>
            </SectionCard>

            {/* Storage */}
            <SectionCard title="Storage Requirements">
              <ul className="space-y-2">
                {result.storage.map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-slate-700">
                    <Package className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                    {item}
                  </li>
                ))}
              </ul>
            </SectionCard>
          </div>

          {/* First Aid */}
          <SectionCard title="First Aid Measures">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {result.firstAid.map((item) => (
                <div key={item.situation} className="p-4 bg-rose-50 border border-rose-100 rounded-xl">
                  <p className="text-sm font-semibold text-rose-800 mb-1">{item.situation}</p>
                  <p className="text-sm text-rose-700 leading-relaxed">{item.action}</p>
                </div>
              ))}
            </div>
          </SectionCard>

          {/* Disposal */}
          <SectionCard title="Disposal Information">
            <p className="text-sm text-slate-700 leading-relaxed">{result.disposal}</p>
            <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
              <p className="text-xs text-amber-700">
                ⚠️ This is AI-generated guidance. Always refer to the official SDS from the chemical manufacturer for regulatory compliance.
              </p>
            </div>
          </SectionCard>

          {/* RAG Chat Section */}
          <SectionCard title="Ask the Document (AI RAG)">
            <div className="flex flex-col h-80 bg-slate-50 border border-slate-200 rounded-xl overflow-hidden">
              <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4">
                {chatMessages.map((msg, i) => (
                  <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm whitespace-pre-wrap ${
                      msg.role === 'user' ? 'bg-indigo-600 text-white rounded-tr-sm' : 'bg-white border border-slate-200 text-slate-700 rounded-tl-sm'
                    }`}>
                      {msg.text}
                    </div>
                  </div>
                ))}
                {isChatting && (
                  <div className="flex justify-start">
                    <div className="bg-white border border-slate-200 rounded-2xl rounded-tl-sm px-4 py-2 text-sm text-slate-500 flex items-center gap-1.5">
                      <Loader2 className="w-4 h-4 animate-spin text-indigo-500" /> Thinking...
                    </div>
                  </div>
                )}
              </div>
              <div className="p-3 bg-white border-t border-slate-200 flex items-center gap-2">
                <div className="flex-1 relative">
                  <input
                    value={chatInput}
                    onChange={e => setChatInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleChat()}
                    placeholder="e.g. What should I do if this touches my skin?"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <button 
                    onClick={startListeningChat}
                    className={`absolute right-2 top-1/2 -translate-y-1/2 p-1.5 transition-colors ${isListeningChat ? 'text-rose-500 animate-pulse' : 'text-slate-400 hover:text-indigo-600'}`}
                    title="Voice Note"
                  >
                    {isListeningChat ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
                  </button>
                </div>
                <button
                  onClick={handleChat}
                  disabled={!chatInput.trim() || isChatting}
                  className="bg-indigo-600 text-white p-2.5 rounded-xl hover:bg-indigo-700 disabled:opacity-50 transition-colors shrink-0"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          </SectionCard>
        </motion.div>
      )}
    </div>
  );
}
