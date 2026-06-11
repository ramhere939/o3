import { useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Star, MessageSquare, Heart, Share2, Shield, ChevronRight, Package, ThumbsUp, X, Paperclip, Zap } from "lucide-react";
import { PageHeader } from "@/components/shared/UIHelpers";

const MOCK_REVIEWS = [
  {
    id: 1,
    name: "C***r",
    country: "Solomon Islands",
    flag: "🇸🇧",
    rating: 5,
    date: "Jun 4, 2026",
    text: "Hello everyone, The quality of the products is completely satisfactory and fully meets my expectations. I thank you for your professionalism and the quality of your service.",
    hasImage: true,
  },
  {
    id: 2,
    name: "N***y",
    country: "United States",
    flag: "🇺🇸",
    rating: 5,
    date: "Apr 15, 2026",
    text: "Great supplier! They helped us choose right models for our market. TVs arrived with all accessories, packaging was professional. Recommended!",
    hasImage: false,
  }
];

export default function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [quantity, setQuantity] = useState(0);
  const [showInquiryModal, setShowInquiryModal] = useState(false);
  const [inquiryMessage, setInquiryMessage] = useState("");

  // Mock product data (we could fetch this based on the ID)
  const product = {
    id: id || "1",
    title: "Industrial Grade Titanium Dioxide (TiO2) High Purity Rutile Grade 93% Min",
    rating: 5.0,
    reviews: 5,
    sold: 533,
    supplierName: "Guangzhou Lianxian Electronics Co., Ltd.",
    supplierYears: 12,
    location: "Guangzhou, CN",
    priceTiers: [
      { min: 1, max: 499, price: 182.56 },
      { min: 500, max: 1199, price: 175.10 },
      { min: 1200, max: null, price: 168.48 },
    ],
    images: [
      "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800&auto=format&fit=crop&q=60",
      "https://images.unsplash.com/photo-1616423640778-28d1b53229bd?w=800&auto=format&fit=crop&q=60",
      "https://images.unsplash.com/photo-1565514020179-026b92b84bb6?w=800&auto=format&fit=crop&q=60",
    ]
  };

  const currentPrice = quantity >= 1200 ? product.priceTiers[2].price 
                     : quantity >= 500 ? product.priceTiers[1].price 
                     : product.priceTiers[0].price;

  const subtotal = quantity * currentPrice;

  const handleQuantityChange = (delta: number) => {
    setQuantity(Math.max(0, quantity + delta));
  };

  return (
    <div className="max-w-[1400px] mx-auto pb-10 -mt-2">
      <div className="text-sm text-slate-500 mb-4 flex items-center gap-2">
        <Link to="/buyer/catalog" className="hover:text-indigo-600">Chemicals</Link>
        <ChevronRight className="w-3 h-3" />
        <span className="hover:text-indigo-600 cursor-pointer">Pigments</span>
        <ChevronRight className="w-3 h-3" />
        <span className="text-slate-800 font-medium">Titanium Dioxide</span>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 items-start">
        {/* Left/Middle Column (Main Content) */}
        <div className="flex-1 bg-white rounded-xl border border-slate-200 overflow-hidden min-w-0">
          <div className="flex flex-col md:flex-row border-b border-slate-200">
            {/* Image Gallery */}
            <div className="w-full lg:w-[400px] xl:w-[450px] p-4 flex flex-col gap-4 border-r border-slate-100 flex-shrink-0">
              <div className="aspect-square bg-slate-50 rounded-xl relative overflow-hidden group border border-slate-100 flex items-center justify-center">
                <Package className="w-32 h-32 text-slate-300" />
                {/* <img src={product.images[0]} alt="Product" className="object-cover w-full h-full" /> */}
                <div className="absolute top-4 right-4 flex flex-col gap-2">
                  <button className="w-10 h-10 bg-white/90 backdrop-blur rounded-full flex items-center justify-center text-slate-600 hover:text-rose-500 shadow-sm transition-colors">
                    <Heart className="w-5 h-5" />
                  </button>
                  <button className="w-10 h-10 bg-white/90 backdrop-blur rounded-full flex items-center justify-center text-slate-600 hover:text-indigo-600 shadow-sm transition-colors">
                    <Share2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
              <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                {product.images.map((img, i) => (
                  <div key={i} className={`w-20 h-20 rounded-lg border-2 flex items-center justify-center bg-slate-50 flex-shrink-0 cursor-pointer ${i === 0 ? 'border-indigo-600' : 'border-transparent hover:border-slate-300'}`}>
                    <Package className="w-8 h-8 text-slate-300" />
                  </div>
                ))}
              </div>

              {/* Supplier Badge */}
              <div className="mt-4 bg-[#f8fbff] border border-blue-100 p-4 rounded-xl">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">{product.supplierName}</h4>
                    <p className="text-xs text-slate-600 flex items-center gap-1 mt-1">
                      🇨🇳 {product.location} • {product.supplierYears} yrs • Custom Manufacturer
                    </p>
                  </div>
                  <span className="text-blue-600 text-xs font-bold px-2 py-1 bg-blue-100 rounded">Verified</span>
                </div>
              </div>
            </div>

            {/* Product Info */}
            <div className="flex-1 p-6 lg:p-8 relative min-w-0">
              {/* Promotional Banner */}
              <div className="absolute top-0 left-0 right-0 bg-[#ffe9e6] text-[#e53935] px-6 py-2 text-sm font-bold flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="bg-[#e53935] text-white px-1.5 rounded text-xs">Sale</span>
                  Save ₹978.47 on orders over ₹9,784.65 with PayPal
                </div>
                <ChevronRight className="w-4 h-4" />
              </div>

              <div className="mt-10">
                <h1 className="text-2xl font-bold text-slate-900 leading-tight mb-3">
                  {product.title}
                </h1>

                <div className="flex flex-wrap items-center gap-4 text-sm mb-6">
                  <div className="flex items-center gap-1 text-amber-500">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-amber-500" />
                    ))}
                    <span className="font-bold ml-1 text-slate-900">{product.rating}</span>
                  </div>
                  <Link to="#reviews" className="text-indigo-600 hover:underline">({product.reviews} reviews)</Link>
                  <span className="text-slate-300">|</span>
                  <span className="text-slate-600">{product.sold} sold</span>
                  <span className="text-slate-300">|</span>
                  <span className="text-amber-600 font-medium flex items-center gap-1">
                    🏆 #6 most popular in Pigments
                  </span>
                </div>

                {/* Price Tiers */}
                <div className="flex gap-8 mb-6 border-b border-slate-100 pb-6">
                  {product.priceTiers.map((tier, idx) => (
                    <div key={idx}>
                      <div className="flex items-baseline gap-1">
                        <span className="text-2xl font-black text-slate-900">₹{tier.price.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
                      </div>
                      <p className="text-sm text-slate-500">{tier.min}{tier.max ? `-${tier.max}` : '+'} pieces</p>
                    </div>
                  ))}
                </div>

                {/* Quantity */}
                <div className="mb-8">
                  <h3 className="font-bold text-slate-900 mb-3">Quantity</h3>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center border border-slate-300 rounded-lg h-10 w-32 bg-white overflow-hidden">
                      <button onClick={() => handleQuantityChange(-1)} className="flex-1 hover:bg-slate-100 text-slate-600 text-lg flex items-center justify-center transition-colors h-full">-</button>
                      <input 
                        type="number" 
                        value={quantity}
                        onChange={(e) => setQuantity(parseInt(e.target.value) || 0)}
                        className="w-12 text-center text-sm font-bold border-x border-slate-300 h-full p-0 focus:ring-0" 
                      />
                      <button onClick={() => handleQuantityChange(1)} className="flex-1 hover:bg-slate-100 text-slate-600 text-lg flex items-center justify-center transition-colors h-full">+</button>
                    </div>
                    {quantity > 0 && (
                      <span className="text-sm text-indigo-600 font-bold bg-indigo-50 px-3 py-1.5 rounded-lg">
                        ₹{currentPrice.toLocaleString("en-IN", { minimumFractionDigits: 2 })} / piece
                      </span>
                    )}
                  </div>
                </div>

                {/* Customization */}
                <div className="border-t border-slate-100 pt-6 cursor-pointer group">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-slate-900">Customization options</h3>
                    <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-indigo-600 transition-colors" />
                  </div>
                  <ul className="mt-3 text-sm text-slate-600 space-y-1 list-disc list-inside">
                    <li>Custom logo (Min. order: 50 pieces)</li>
                    <li>Custom packaging (Min. order: 100 pieces)</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Key Attributes Section */}
          <div className="p-6 lg:p-8 border-b border-slate-200 bg-[#f9fafb]">
            <h2 className="text-xl font-bold text-slate-900 mb-6">Key attributes</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
              <div className="grid grid-cols-3 border-b border-slate-200 pb-3">
                <span className="text-slate-500 text-sm">CAS No.</span>
                <span className="col-span-2 text-slate-900 text-sm font-medium">13463-67-7</span>
              </div>
              <div className="grid grid-cols-3 border-b border-slate-200 pb-3">
                <span className="text-slate-500 text-sm">Other Names</span>
                <span className="col-span-2 text-slate-900 text-sm font-medium">TiO2</span>
              </div>
              <div className="grid grid-cols-3 border-b border-slate-200 pb-3">
                <span className="text-slate-500 text-sm">MF</span>
                <span className="col-span-2 text-slate-900 text-sm font-medium">TiO2</span>
              </div>
              <div className="grid grid-cols-3 border-b border-slate-200 pb-3">
                <span className="text-slate-500 text-sm">EINECS No.</span>
                <span className="col-span-2 text-slate-900 text-sm font-medium">236-675-5</span>
              </div>
              <div className="grid grid-cols-3 border-b border-slate-200 pb-3">
                <span className="text-slate-500 text-sm">Place of Origin</span>
                <span className="col-span-2 text-slate-900 text-sm font-medium">Guangdong, China</span>
              </div>
              <div className="grid grid-cols-3 border-b border-slate-200 pb-3">
                <span className="text-slate-500 text-sm">Grade Standard</span>
                <span className="col-span-2 text-slate-900 text-sm font-medium">Industrial Grade</span>
              </div>
              <div className="grid grid-cols-3 border-b border-slate-200 pb-3">
                <span className="text-slate-500 text-sm">Purity</span>
                <span className="col-span-2 text-slate-900 text-sm font-medium">93% min</span>
              </div>
              <div className="grid grid-cols-3 border-b border-slate-200 pb-3">
                <span className="text-slate-500 text-sm">Appearance</span>
                <span className="col-span-2 text-slate-900 text-sm font-medium">White Powder</span>
              </div>
            </div>
          </div>

          {/* Reviews Section */}
          <div className="p-6 lg:p-8" id="reviews">
            <div className="flex items-center gap-4 mb-8">
              <h2 className="text-xl font-bold text-slate-900">Reviews ({product.reviews})</h2>
              <span className="text-sm text-indigo-600 hover:underline cursor-pointer">Showing all reviews in your chosen language</span>
            </div>

            <div className="space-y-8">
              {MOCK_REVIEWS.map(review => (
                <div key={review.id} className="flex flex-col sm:flex-row gap-6 border-b border-slate-100 pb-8 last:border-0 last:pb-0">
                  {/* User Profile */}
                  <div className="w-full sm:w-40 flex-shrink-0">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-8 h-8 rounded-full bg-[#d84a1b] text-white flex items-center justify-center font-bold text-xs">
                        {review.name.charAt(0)}
                      </div>
                      <span className="font-bold text-slate-900 text-sm">{review.name}</span>
                    </div>
                    <p className="text-xs text-slate-600 mb-1">{review.flag} {review.country}</p>
                    <p className="text-[10px] text-emerald-600 font-bold flex items-center gap-1 mb-1"><Shield className="w-3 h-3" /> Verified purchase</p>
                    <p className="text-[10px] text-slate-500 bg-slate-100 inline-block px-1.5 py-0.5 rounded">Repeat buyer</p>
                  </div>

                  {/* Review Content */}
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex gap-0.5 text-amber-500">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star key={i} className={`w-4 h-4 ${i < review.rating ? 'fill-amber-500' : 'fill-slate-200 text-slate-200'}`} />
                        ))}
                      </div>
                      <span className="text-xs text-slate-400">{review.date}</span>
                    </div>
                    <p className="text-sm text-slate-700 leading-relaxed mb-4">{review.text}</p>
                    {review.hasImage && (
                      <div className="w-20 h-20 bg-slate-100 rounded-lg border border-slate-200 mb-4 flex items-center justify-center overflow-hidden">
                        <Package className="w-8 h-8 text-slate-300" />
                      </div>
                    )}
                    <button className="flex items-center gap-1 text-xs text-slate-500 hover:text-indigo-600 transition-colors">
                      <ThumbsUp className="w-3.5 h-3.5" /> Helpful (0)
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Sidebar (Sticky Action Panel) */}
        <div className="w-full lg:w-80 flex-shrink-0">
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden sticky top-24 shadow-sm max-h-[calc(100vh-120px)] overflow-y-auto scrollbar-thin">
            <div className="p-5 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-lg mb-4">Shipping</h3>
              <p className="text-sm text-slate-600 mb-6">
                Shipping fee and delivery date to be negotiated. Chat with supplier now for more details.
              </p>

              <div className="space-y-2 text-sm border-t border-slate-100 pt-4 mb-6">
                <div className="flex justify-between">
                  <span className="text-slate-500">Item subtotal</span>
                  <span className="font-bold text-slate-900">₹{subtotal.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Shipping total</span>
                  <span className="font-medium text-slate-900">To be negotiated</span>
                </div>
                <div className="flex justify-between pt-2 mt-2 border-t border-slate-100 font-bold">
                  <span className="text-slate-900 text-base">Subtotal</span>
                  <span className="text-indigo-600 text-lg">₹{subtotal.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
                </div>
              </div>

              <div className="border-t border-slate-100 pt-4 cursor-pointer group">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-bold text-slate-900 flex items-center gap-1 text-sm">
                    O3.com order protection
                  </h4>
                  <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-600" />
                </div>
                <p className="text-xs text-slate-600">
                  Every payment you make on O3.com is secured with strict SSL encryption and PCI DSS data protection protocols.
                </p>
              </div>
            </div>

            <div className="p-5 bg-slate-50 flex flex-col gap-3">
              <button
                onClick={() => setShowInquiryModal(true)}
                className="w-full bg-[#f60] hover:bg-[#e05a00] text-white font-bold py-3.5 rounded-full text-center transition-colors mb-3"
              >
                Send inquiry
              </button>
              <Link
                to="/buyer/quotes/negotiate"
                className="w-full bg-white border border-slate-900 hover:bg-slate-100 text-slate-900 font-bold py-3.5 rounded-full text-center transition-colors flex items-center justify-center"
              >
                Chat now
              </Link>
              <button 
                onClick={() => {
                  if (quantity > 0) {
                    navigate('/buyer/cart', { 
                      state: { 
                        newCartItem: {
                          id: Date.now(),
                          supplier: product.supplierName,
                          product: product.title,
                          cas: "13463-67-7", // static for mock
                          price: currentPrice,
                          quantity: quantity,
                          unit: "piece",
                          total: subtotal
                        }
                      } 
                    });
                  } else {
                    alert("Please select a quantity first");
                  }
                }}
                className="w-full text-indigo-600 hover:text-indigo-700 font-bold py-2 text-sm transition-colors mt-1"
              >
                Add to cart
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Inquiry Modal */}
      {showInquiryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl overflow-hidden flex flex-col">
            <div className="flex justify-between items-center p-4 border-b border-slate-200">
              <h2 className="text-lg font-bold text-slate-900">Send inquiry to {product.supplierName}</h2>
              <button onClick={() => setShowInquiryModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 bg-[#f8f9fa] flex-1 overflow-y-auto">
              <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-sm mb-4">
                <textarea
                  className="w-full h-32 resize-none border-0 focus:ring-0 p-0 text-sm text-slate-700 bg-transparent"
                  placeholder="Enter your inquiry details..."
                  value={inquiryMessage}
                  onChange={(e) => setInquiryMessage(e.target.value)}
                ></textarea>
                
                <div className="mt-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Zap className="w-4 h-4 text-[#f60]" />
                    <span className="text-sm font-bold text-slate-800">Try inquiry questions suggested by AI</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {["Are there warranties on your products?", "What are your delivery and shipping options?", "Can you provide product specifications?", "Enter other topics"].map((q, i) => (
                      <button 
                        key={i} 
                        onClick={() => setInquiryMessage(prev => prev + (prev ? '\n' : '') + q)}
                        className="flex items-center gap-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs px-3 py-1.5 rounded-full transition-colors"
                      >
                        <Package className="w-3 h-3 text-emerald-500" />
                        {q}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <button className="flex items-center gap-2 text-sm font-bold text-slate-700 hover:text-[#f60] mb-6">
                <Paperclip className="w-4 h-4" /> Add attachment
              </button>

              <div className="space-y-3">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input type="checkbox" className="mt-1 rounded border-slate-300 text-[#f60] focus:ring-[#f60]" />
                  <span className="text-sm text-slate-600">Recommend matching suppliers if this supplier doesn't contact me on Message Center within 24 hours.</span>
                </label>
                <label className="flex items-start gap-3 cursor-pointer">
                  <input type="checkbox" defaultChecked className="mt-1 rounded border-slate-300 text-[#f60] focus:ring-[#f60]" />
                  <span className="text-sm text-slate-600">I agree to the use of my inquiry history by O3.com and its third-party service providers for the sole purpose of generating inquiry content.</span>
                </label>
                <label className="flex items-start gap-3 cursor-pointer">
                  <input type="checkbox" defaultChecked className="mt-1 rounded border-slate-300 text-[#f60] focus:ring-[#f60]" />
                  <span className="text-sm text-slate-600">Agree to share Business Card with supplier.</span>
                </label>
              </div>
            </div>

            <div className="p-4 bg-white border-t border-slate-200 flex justify-center">
              <button 
                onClick={() => {
                  if (inquiryMessage.trim()) {
                    // Mock sending logic
                    const existingStr = localStorage.getItem("o3_mock_messages");
                    const existing = existingStr ? JSON.parse(existingStr) : [];
                    existing.push({
                      id: Date.now(),
                      supplier: product.supplierName,
                      text: inquiryMessage,
                      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                      isSender: true
                    });
                    localStorage.setItem("o3_mock_messages", JSON.stringify(existing));
                    
                    alert("Inquiry sent successfully to the supplier!");
                    setShowInquiryModal(false);
                  } else {
                    alert("Please enter an inquiry message first.");
                  }
                }}
                className="bg-[#f60] hover:bg-[#e05a00] text-white font-bold py-2.5 px-8 rounded-full transition-colors"
              >
                Send inquiry
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
