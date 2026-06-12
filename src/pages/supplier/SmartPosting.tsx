import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { 
  ArrowLeft, CheckCircle2, ChevronRight, HelpCircle, X, Check
} from "lucide-react";
import { createProduct } from "@/lib/mock-api";
import { PageHeader } from "@/components/shared/UIHelpers";

const TABS = [
  "Select category", "Product Attribute", "Product information", 
  "Pricing", "Logistics and shipping", "Services and add-ons", "Photos and videos"
];

export default function SmartPosting() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(0);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showCountryModal, setShowCountryModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category: "Industrial Chemicals",
    subCategory: "Titanium Dioxide",
    grade: "Industrial Grade",
    price: 0,
    moq: 1,
    casNumber: "",
    features: ["High Purity"],
    supplyType: "Contract Manufacturing",
    location: "Pakistan",
    unit: "Kilograms"
  });

  const updateForm = (key: keyof typeof formData, value: any) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const handlePublish = async () => {
    setIsSubmitting(true);
    try {
      await createProduct({
        name: formData.name || "Untitled Chemical Product",
        category: formData.category,
        grade: formData.grade,
        price: formData.price || 10,
        priceUnit: formData.unit,
        currency: "INR",
        moq: formData.moq || 1,
        moqUnit: formData.unit,
        casNumber: formData.casNumber || "N/A",
        hsnCode: "382490", // Mock HSN code
        tags: formData.features.join(', '), // Prisma expects string
        description: formData.description || "No description provided",
        supplierId: "s1",
        supplierName: "O3 Mock Supplier",
        location: formData.location,
        leadTimeDays: 7,
        rating: 4.8,
        reviewCount: 0,
        inStock: true
      });
      navigate("/supplier/inventory");
    } catch (e) {
      console.error(e);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-[1400px] mx-auto px-4 md:px-6 space-y-4 pb-12">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2 text-sm">
          <Link to="/supplier/inventory" className="text-slate-500 hover:text-indigo-600 flex items-center gap-1">
            <ArrowLeft className="w-4 h-4" /> Back to Inventory
          </Link>
        </div>
        <h1 className="text-xl font-bold text-slate-800">Smart Posting <HelpCircle className="inline w-4 h-4 text-slate-400 ml-1 cursor-pointer"/></h1>
        <div></div>
      </div>

      <div className="flex flex-col xl:flex-row gap-6 items-start relative">
        {/* Main Content Area */}
        <div className="flex-1 bg-white rounded-lg shadow-sm border border-slate-200 min-h-[600px] w-full overflow-hidden">
          {/* Tabs */}
          <div className="flex border-b border-slate-100 overflow-x-auto">
            {TABS.map((tab, idx) => (
              <button
                key={tab}
                onClick={() => setActiveTab(idx)}
                className={`whitespace-nowrap px-6 py-4 text-sm font-medium border-b-2 transition-colors flex-shrink-0 ${
                  activeTab === idx 
                    ? "border-[#165DFF] text-[#165DFF]" 
                    : "border-transparent text-slate-600 hover:text-[#165DFF]"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="p-4 md:p-8">
            {activeTab === 0 && <CategoryTab formData={formData} onOpenModal={() => setShowCategoryModal(true)} />}
            {activeTab === 1 && <AttributesTab formData={formData} updateForm={updateForm} onOpenCountry={() => setShowCountryModal(true)} />}
            {activeTab === 2 && <ProductInfoTab formData={formData} updateForm={updateForm} />}
            {activeTab === 3 && <PricingTab formData={formData} updateForm={updateForm} />}
            {activeTab === 4 && <div className="text-slate-500 text-center py-20">Logistics Settings (Demo Placeholder)</div>}
            {activeTab === 5 && <div className="text-slate-500 text-center py-20">Services Settings (Demo Placeholder)</div>}
            {activeTab === 6 && <div className="text-slate-500 text-center py-20">Upload Photos (Demo Placeholder)</div>}
          </div>
        </div>

        {/* Sticky Sidebar */}
        <div className="w-full xl:w-[280px] flex-shrink-0 space-y-4 xl:sticky top-20">
          <div className="bg-[#f8f9fa] rounded-lg border border-slate-200 p-6 text-center">
            <h3 className="text-sm font-semibold text-slate-700 mb-4 text-left">Product information score</h3>
            <div className="w-32 h-32 mx-auto rounded-full border-4 border-[#165DFF] flex items-center justify-center text-2xl font-bold text-[#165DFF] mb-4 bg-white shadow-sm">
              {Math.min(100, 20 + (formData.name ? 20 : 0) + (formData.price ? 20 : 0) + (formData.casNumber ? 20 : 0) + (formData.features.length * 10))}
            </div>
            <p className="text-xs text-slate-500 text-left">
              A higher score will help your listing perform better in search rankings.
            </p>
          </div>

          <div className="bg-[#f8f9fa] rounded-lg border border-slate-200 p-4 hidden xl:block">
            <div className="flex items-center justify-between text-sm font-semibold text-slate-700 mb-4 cursor-pointer">
              <span>Industry Trending (935002)</span>
              <ChevronRight className="w-4 h-4 -rotate-90" />
            </div>
            <button className="w-full bg-[#165DFF] text-white rounded-full py-2 text-sm font-medium hover:bg-blue-700 transition-colors mb-4">
              Click to Check
            </button>
            
            <div className="space-y-4 text-sm text-slate-600">
              <div className="flex justify-between">
                <span className="text-slate-400">Category</span>
                <span className="text-right">Chemicals {">>"} {formData.category} {">>"} {formData.subCategory}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Grade</span>
                <span>{formData.grade}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showCategoryModal && (
        <CategoryModal 
          onClose={() => setShowCategoryModal(false)} 
          onSelect={(cat, sub) => { updateForm("category", cat); updateForm("subCategory", sub); setShowCategoryModal(false); }} 
        />
      )}
      {showCountryModal && (
        <CountryModal 
          onClose={() => setShowCountryModal(false)} 
          onSelect={(c) => { updateForm("location", c); setShowCountryModal(false); }}
        />
      )}

      {/* Bottom Sticky Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 py-3 px-6 flex justify-center gap-4 z-40 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
        <button className="px-6 py-2 border border-slate-300 text-slate-700 rounded text-sm font-medium hover:bg-slate-50">Save draft</button>
        {activeTab < TABS.length - 1 ? (
          <button className="px-6 py-2 bg-[#165DFF] text-white rounded text-sm font-medium hover:bg-blue-700" onClick={() => setActiveTab(prev => prev + 1)}>
            Next Step
          </button>
        ) : (
          <button 
            className="px-6 py-2 bg-emerald-600 text-white rounded text-sm font-medium hover:bg-emerald-700 flex items-center gap-2" 
            onClick={handlePublish}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Publishing..." : <><Check className="w-4 h-4" /> Publish Product</>}
          </button>
        )}
      </div>
    </div>
  );
}

function CategoryTab({ formData, onOpenModal }: { formData: any, onOpenModal: () => void }) {
  return (
    <div className="space-y-6">
      <div className="bg-[#E8F3FF] border border-[#BCE0FD] text-[#165DFF] p-3 text-sm rounded flex items-start gap-2">
        <HelpCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
        <p>[Notice] In order to enhance buyer trust and search relevance, please select the most accurate category.</p>
      </div>

      <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
        <button 
          onClick={onOpenModal}
          className="border border-[#165DFF] text-[#165DFF] px-4 py-1.5 rounded-full text-sm font-medium hover:bg-blue-50 whitespace-nowrap"
        >
          Select category
        </button>
        <span className="text-sm text-slate-600 break-words">Selected category: Chemicals {'>'} {formData.category} {'>'} {formData.subCategory} <CheckCircle2 className="inline w-4 h-4 text-emerald-500"/></span>
      </div>
    </div>
  );
}

function AttributesTab({ formData, updateForm, onOpenCountry }: { formData: any, updateForm: any, onOpenCountry: () => void }) {
  const toggleFeature = (f: string) => {
    if (formData.features.includes(f)) {
      updateForm("features", formData.features.filter((x: string) => x !== f));
    } else {
      updateForm("features", [...formData.features, f]);
    }
  };

  return (
    <div className="space-y-8 max-w-3xl">
      <div>
        <h3 className="font-semibold text-slate-800 mb-4">Essential attributes:</h3>
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
            <label className="sm:w-40 sm:text-right text-sm text-slate-600"><span className="text-rose-500">*</span> Place of Origin:</label>
            <div 
              className="flex-1 border border-slate-300 rounded px-3 py-2 text-sm cursor-pointer hover:border-[#165DFF] flex justify-between items-center bg-white"
              onClick={onOpenCountry}
            >
              <span>{formData.location}</span>
              <ChevronRight className="w-4 h-4 text-slate-400 rotate-90" />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
            <label className="sm:w-40 sm:text-right text-sm text-slate-600"><span className="text-rose-500">*</span> CAS Number:</label>
            <input 
              type="text" 
              value={formData.casNumber}
              onChange={(e) => updateForm("casNumber", e.target.value)}
              placeholder="e.g. 13463-67-7"
              className="flex-1 border border-slate-300 rounded px-3 py-2 text-sm focus:border-[#165DFF] focus:outline-none" 
            />
          </div>

          <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
            <label className="sm:w-40 sm:text-right text-sm text-slate-600 mt-2">Features:</label>
            <div className="flex-1 space-y-4">
              <div className="flex flex-wrap gap-x-6 gap-y-3">
                {['High Purity', 'Industrial Grade', 'Food Grade', 'Liquid', 'Powder', 'Hazardous', 'Eco-friendly', 'Stable', 'Volatile'].map(f => (
                  <label key={f} className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
                    <input 
                      type="checkbox" 
                      className="w-4 h-4 accent-[#165DFF]" 
                      checked={formData.features.includes(f)}
                      onChange={() => toggleFeature(f)}
                    /> {f}
                  </label>
                ))}
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
            <label className="sm:w-40 sm:text-right text-sm text-slate-600"><span className="text-rose-500">*</span> Supply Type:</label>
            <select 
              value={formData.supplyType}
              onChange={(e) => updateForm("supplyType", e.target.value)}
              className="flex-1 border border-slate-300 rounded px-3 py-2 text-sm focus:border-[#165DFF] focus:outline-none bg-white"
            >
              <option>Contract Manufacturing</option>
              <option>In-Stock Items</option>
              <option>OEM Service</option>
            </select>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
            <label className="sm:w-40 sm:text-right text-sm text-slate-600"><span className="text-rose-500">*</span> Grade:</label>
            <select 
              value={formData.grade}
              onChange={(e) => updateForm("grade", e.target.value)}
              className="flex-1 border border-slate-300 rounded px-3 py-2 text-sm focus:border-[#165DFF] focus:outline-none bg-white"
            >
              <option>Industrial Grade</option>
              <option>Reagent Grade</option>
              <option>Pharma Grade</option>
              <option>Food Grade</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}

function ProductInfoTab({ formData, updateForm }: { formData: any, updateForm: any }) {
  return (
    <div className="space-y-8 max-w-3xl">
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">Product Name <span className="text-rose-500">*</span></label>
          <input 
            type="text" 
            value={formData.name}
            onChange={(e) => updateForm("name", e.target.value)}
            placeholder="e.g. High Purity Titanium Dioxide R-996"
            className="w-full border border-slate-300 rounded-lg px-4 py-2.5 text-sm focus:border-[#165DFF] focus:ring-1 focus:ring-[#165DFF] outline-none"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">Detailed Description</label>
          <textarea 
            value={formData.description}
            onChange={(e) => updateForm("description", e.target.value)}
            rows={8}
            placeholder="Describe the product specifications, applications, packing details, etc."
            className="w-full border border-slate-300 rounded-lg px-4 py-2.5 text-sm focus:border-[#165DFF] focus:ring-1 focus:ring-[#165DFF] outline-none resize-y"
          />
        </div>
      </div>
    </div>
  )
}

function PricingTab({ formData, updateForm }: { formData: any, updateForm: any }) {
  return (
    <div className="space-y-8 max-w-4xl">
      <div className="text-sm text-slate-500 mb-6">Set your pricing strategy. This will be visible to buyers globally.</div>
      
      <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6 text-sm">
        <label className="sm:w-32 sm:text-right text-slate-600">Price setting:</label>
        <div className="flex flex-col gap-2">
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="radio" name="priceSetting" className="w-4 h-4 accent-[#165DFF]" defaultChecked /> Set uniform price
          </label>
          <label className="flex items-center gap-2 cursor-pointer text-slate-500">
            <input type="radio" name="priceSetting" className="w-4 h-4" /> Set tiered pricing by MOQ
          </label>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-sm mt-6">
        <label className="sm:w-32 sm:text-right text-slate-600"><span className="text-rose-500">*</span> Unit:</label>
        <select 
          value={formData.unit}
          onChange={(e) => updateForm("unit", e.target.value)}
          className="w-full sm:w-48 border border-slate-300 rounded px-3 py-2 text-sm focus:border-[#165DFF] focus:outline-none bg-white"
        >
          <option>Kilograms</option>
          <option>Metric Tons</option>
          <option>Liters</option>
          <option>Drums</option>
        </select>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-sm mt-6">
        <label className="sm:w-32 sm:text-right text-slate-600"><span className="text-rose-500">*</span> Base Price:</label>
        <div className="flex items-center gap-2 w-full sm:w-48">
          <span className="text-slate-500 font-medium">₹</span>
          <input 
            type="number" 
            value={formData.price || ''}
            onChange={(e) => updateForm("price", Number(e.target.value))}
            placeholder="0.00"
            className="flex-1 border border-slate-300 rounded px-3 py-2 text-sm focus:border-[#165DFF] focus:outline-none"
          />
        </div>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-sm mt-6">
        <label className="sm:w-32 sm:text-right text-slate-600"><span className="text-rose-500">*</span> MOQ:</label>
        <div className="flex items-center gap-2 w-full sm:w-48">
          <input 
            type="number" 
            value={formData.moq || ''}
            onChange={(e) => updateForm("moq", Number(e.target.value))}
            placeholder="1"
            className="flex-1 border border-slate-300 rounded px-3 py-2 text-sm focus:border-[#165DFF] focus:outline-none"
          />
          <span className="text-slate-500 font-medium">{formData.unit}</span>
        </div>
      </div>

    </div>
  );
}

const CATEGORY_DATA: Record<string, Record<string, string[]>> = {
  'Industrial Chemicals': {
    'Inorganic Chemicals': ['Titanium Dioxide', 'Sulfuric Acid', 'Sodium Hydroxide', 'Ammonia'],
    'Organic Chemicals': ['Methanol', 'Acetic Acid', 'Ethylene', 'Propylene'],
    'Solvents': ['Acetone', 'Toluene', 'Xylene', 'Ethanol'],
    'Pigments & Dyes': ['Iron Oxide', 'Zinc Oxide', 'Carbon Black', 'Phthalocyanine Blue']
  },
  'Agrochemicals': {
    'Fertilizers': ['Urea', 'DAP', 'MOP', 'SSP'],
    'Pesticides': ['Insecticides', 'Fungicides', 'Herbicides', 'Rodenticides'],
    'Soil Conditioners': ['Gypsum', 'Lime', 'Peat', 'Perlite']
  },
  'Polymers & Resins': {
    'Thermoplastics': ['Polyethylene (PE)', 'Polypropylene (PP)', 'PVC', 'Polystyrene'],
    'Thermosets': ['Epoxy Resin', 'Phenolic Resin', 'Polyurethane', 'Silicone'],
    'Elastomers': ['Natural Rubber', 'Synthetic Rubber', 'Neoprene', 'Nitrile']
  },
  'Fine Chemicals': {
    'Pharmaceutical Intermediates': ['APIs', 'Excipients', 'Chiral Compounds'],
    'Specialty Chemicals': ['Catalysts', 'Adhesives', 'Sealants', 'Coatings'],
    'Aroma Chemicals': ['Essential Oils', 'Fragrance Compounds', 'Flavoring Agents']
  },
  'Petrochemicals': {
    'Olefins': ['Ethylene', 'Propylene', 'Butadiene'],
    'Aromatics': ['Benzene', 'Toluene', 'Xylene'],
    'Synthesis Gas': ['Carbon Monoxide', 'Hydrogen', 'Methanol']
  }
};

function CategoryModal({ onClose, onSelect }: { onClose: () => void, onSelect: (cat: string, sub: string) => void }) {
  const [selectedCat, setSelectedCat] = useState("Industrial Chemicals");
  const [selectedSubGroup, setSelectedSubGroup] = useState("Inorganic Chemicals");
  const [selectedSub, setSelectedSub] = useState("Titanium Dioxide");

  const catKeys = Object.keys(CATEGORY_DATA);
  const subGroups = CATEGORY_DATA[selectedCat] ? Object.keys(CATEGORY_DATA[selectedCat]) : [];
  const items = (CATEGORY_DATA[selectedCat] && CATEGORY_DATA[selectedCat][selectedSubGroup]) ? CATEGORY_DATA[selectedCat][selectedSubGroup] : [];

  const handleCatChange = (c: string) => {
    setSelectedCat(c);
    const firstSubGroup = Object.keys(CATEGORY_DATA[c])[0];
    setSelectedSubGroup(firstSubGroup);
    setSelectedSub(CATEGORY_DATA[c][firstSubGroup][0]);
  };

  const handleSubGroupChange = (sg: string) => {
    setSelectedSubGroup(sg);
    setSelectedSub(CATEGORY_DATA[selectedCat][sg][0]);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[80vh] flex flex-col">
        <div className="flex justify-between items-center p-4 border-b border-slate-100">
          <h2 className="text-lg font-bold text-slate-800">Select Category</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700 p-1"><X className="w-5 h-5"/></button>
        </div>
        
        <div className="flex-1 overflow-auto p-4 bg-slate-50">
          <div className="flex flex-col md:flex-row h-full gap-2">
            <div className="md:w-1/3 bg-white border border-slate-200 rounded overflow-y-auto min-h-[200px]">
              {catKeys.map((c) => (
                <div 
                  key={c} 
                  onClick={() => handleCatChange(c)}
                  className={`px-4 py-2 text-sm cursor-pointer hover:bg-slate-50 ${selectedCat === c ? 'bg-slate-200 font-medium border-l-4 border-[#165DFF]' : ''}`}
                >
                  {c}
                </div>
              ))}
            </div>
            <div className="md:w-1/3 bg-white border border-slate-200 rounded overflow-y-auto min-h-[200px]">
              {subGroups.map((sg) => (
                <div 
                  key={sg} 
                  onClick={() => handleSubGroupChange(sg)}
                  className={`px-4 py-2 text-sm cursor-pointer hover:bg-slate-50 ${selectedSubGroup === sg ? 'bg-slate-100 font-medium' : ''}`}
                >
                  {sg}
                </div>
              ))}
            </div>
            <div className="md:w-1/3 bg-white border border-slate-200 rounded overflow-y-auto min-h-[200px]">
              {items.map((item) => (
                <div 
                  key={item} 
                  onClick={() => setSelectedSub(item)}
                  className={`px-4 py-2 text-sm cursor-pointer hover:bg-slate-50 ${selectedSub === item ? 'bg-slate-200 font-medium' : ''}`}
                >
                  {item}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="p-4 border-t border-slate-100 bg-white">
          <div className="bg-[#f6ffed] border border-[#b7eb8f] px-3 py-2 text-sm mb-4 flex items-center gap-2">
            Selected category: Chemicals {'>'} {selectedCat} {'>'} {selectedSub} <CheckCircle2 className="w-4 h-4 text-[#52c41a]" />
          </div>
          <div className="flex justify-end gap-3">
            <button onClick={onClose} className="px-5 py-2 border border-slate-300 rounded-full text-sm font-medium hover:bg-slate-50">Cancel</button>
            <button onClick={() => onSelect(selectedCat, selectedSub)} className="px-5 py-2 bg-[#165DFF] text-white rounded-full text-sm font-medium hover:bg-blue-700">OK</button>
          </div>
        </div>
      </div>
    </div>
  );
}

function CountryModal({ onClose, onSelect }: { onClose: () => void, onSelect: (c: string) => void }) {
  const [selected, setSelected] = useState("Pakistan");
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[80vh] flex flex-col">
        <div className="flex justify-between items-center p-4 border-b border-slate-100">
          <h2 className="text-lg font-bold text-slate-800">Country/Region</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700 p-1"><X className="w-5 h-5"/></button>
        </div>
        
        <div className="flex-1 overflow-auto p-6 space-y-6">
          <div>
            <h3 className="text-sm font-medium text-slate-800 mb-4">Select countries according to geographical areas</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-y-4 gap-x-2 text-sm">
              {[
                'United States of America', 'United Kingdom', 'Canada',
                'Germany', 'France', 'Mexico',
                'Spain', 'Italy', 'Philippines',
                'Pakistan', 'Malaysia', 'Saudi Arabia', 'India', 'China'
              ].map(cty => (
                <label key={cty} className="flex items-center gap-2 cursor-pointer">
                  <input 
                    type="radio" 
                    name="country"
                    className="w-4 h-4 accent-[#165DFF]" 
                    checked={selected === cty}
                    onChange={() => setSelected(cty)}
                  /> 
                  <span className="truncate">{cty}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        <div className="p-4 border-t border-slate-100 flex gap-3">
          <button onClick={() => onSelect(selected)} className="px-6 py-2 bg-[#165DFF] text-white rounded-full text-sm font-medium hover:bg-blue-700">
            Confirm
          </button>
          <button onClick={onClose} className="px-6 py-2 border border-slate-300 rounded-full text-sm font-medium hover:bg-slate-50">Cancel</button>
        </div>
      </div>
    </div>
  );
}
