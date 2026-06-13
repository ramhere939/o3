import { useState, useEffect } from "react";
import { useParams, Link, useNavigate, useLocation } from "react-router-dom";
import { Star, MessageSquare, Heart, Share2, Shield, ShieldCheck, ChevronRight, Package, PackageOpen, ThumbsUp, X, Paperclip, Zap, ChevronDown, CheckCircle2, Award, ArrowRight, Activity, Play, Smile, Image as ImageIcon, Folder, Phone, FileText, Languages, Users, Search, AlertTriangle } from "lucide-react";
import { PageHeader } from "@/components/shared/UIHelpers";
import { useApp } from "@/context/AppContext";
import { io } from "socket.io-client";
import { useQueryClient, useQuery } from "@tanstack/react-query";
import { getProductById } from "@/lib/mock-api";
import { AlternativeSuppliersModal } from "@/components/shared/AlternativeSuppliersModal";

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
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useApp();
  const queryClient = useQueryClient();
  const [quantity, setQuantity] = useState(0);
  const [showInquiryModal, setShowInquiryModal] = useState(false);
  const [inquiryMessage, setInquiryMessage] = useState("");
  const [selectedImageIdx, setSelectedImageIdx] = useState(0);
  const [showAltSuppliers, setShowAltSuppliers] = useState(false);
  const [showSplitModal, setShowSplitModal] = useState(false);
  const [splitAllocations, setSplitAllocations] = useState<Record<string, number>>({});

  useEffect(() => {
    // The scroll container in this layout is the <main> element, not the window!
    const timer = setTimeout(() => {
      document.querySelector('main')?.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    }, 10);
    return () => clearTimeout(timer);
  }, [id]);

  const stateProduct = location.state?.product;

  const { data: fetchedProduct, isLoading } = useQuery({
    queryKey: ["product", id],
    queryFn: () => getProductById(id as string),
    enabled: !!id && !stateProduct,
  });

  const activeProduct = stateProduct || fetchedProduct;

  if (!activeProduct && isLoading) {
    return <div className="p-20 text-center text-slate-500 font-medium">Loading product details...</div>;
  }

  const mockImages = [
    "/chemicals/c1.jpg",
    "/chemicals/c2.jpg",
    "/chemicals/c3.jpg",
    "/chemicals/c4.avif",
    "/chemicals/c5.jpg"
  ];
  const prodId = activeProduct?.id || id || "1";
  const primaryImgIdx = (String(prodId).split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)) % 5;
  const productImages = [
    mockImages[primaryImgIdx],
    mockImages[(primaryImgIdx + 1) % 5],
    mockImages[(primaryImgIdx + 2) % 5]
  ];

  // Map activeProduct data to the UI format
  const product = {
    id: prodId,
    title: activeProduct?.name || "Industrial Grade Titanium Dioxide (TiO2) High Purity Rutile Grade 93% Min",
    rating: activeProduct?.rating || 5.0,
    reviews: activeProduct?.reviewCount || 5,
    sold: 533,
    supplierName: activeProduct?.supplierName || "Guangzhou Lianxian Electronics Co., Ltd.",
    supplierYears: 12,
    location: activeProduct?.location || "Guangzhou, CN",
    priceTiers: [
      { min: 1, max: 499, price: activeProduct?.price || 182.56 },
      { min: 500, max: 1199, price: activeProduct ? activeProduct.price * 0.95 : 175.10 },
      { min: 1200, max: null, price: activeProduct ? activeProduct.price * 0.9 : 168.48 },
    ],
    images: productImages,
    category: activeProduct?.category || "Pigments",
    casNumber: activeProduct?.casNumber || "13463-67-7",
    grade: activeProduct?.grade || "Industrial Grade",
    tags: activeProduct?.tags || "Titanium White, TiO2",
    description: activeProduct?.description || "High-quality industrial grade chemical suitable for various manufacturing applications.",
  };

  const MOCK_AVAILABLE_STOCK = 1200;

  const alternativeSellers = [
    { id: "s2", name: "Global ChemCorp", loc: "Mumbai, India", price: product.priceTiers[0].price * 0.95, rating: 4.8 },
    { id: "s3", name: "SinoChemicals Ltd", loc: "Shanghai, China", price: product.priceTiers[0].price * 0.88, rating: 4.6 },
  ];

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
        <Link to={`/buyer/catalog?category=${stateProduct?.category || 'Pigments'}`} className="hover:text-indigo-600 cursor-pointer">
          {stateProduct?.category || "Pigments"}
        </Link>
        <ChevronRight className="w-3 h-3" />
        <span className="text-slate-800 font-medium truncate max-w-xs" title={product.title}>
          {product.title}
        </span>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 items-start">
        {/* Left/Middle Column (Main Content) */}
        <div className="flex-1 bg-white rounded-xl border border-slate-200 overflow-hidden min-w-0">
          <div className="flex flex-col md:flex-row border-b border-slate-200">
            {/* Image Gallery */}
            <div className="w-full lg:w-[400px] xl:w-[450px] p-4 flex flex-col gap-4 border-r border-slate-100 flex-shrink-0">
              <div className="aspect-square bg-slate-50 rounded-xl relative overflow-hidden group border border-slate-100 flex items-center justify-center">
                <img src={product.images[selectedImageIdx]} alt="Product" className="object-cover w-full h-full" />
                <div className="absolute top-4 right-4 flex flex-col gap-2">
                  <button 
                    onClick={() => {
                      const existingStr = localStorage.getItem("o3_buyer_favorites");
                      const favorites = existingStr ? JSON.parse(existingStr) : [];
                      
                      if (!favorites.some((f: any) => f.id === product.id)) {
                        favorites.push({
                          id: product.id,
                          name: product.title,
                          casNumber: "13463-67-7",
                          category: "Chemicals",
                          price: currentPrice,
                          priceUnit: "piece",
                          moq: 1,
                          moqUnit: "piece",
                          supplierName: product.supplierName,
                          location: product.location,
                          leadTimeDays: 7,
                          rating: product.rating,
                          image: product.images[selectedImageIdx]
                        });
                        localStorage.setItem("o3_buyer_favorites", JSON.stringify(favorites));
                      }
                      navigate("/buyer/favorites");
                    }}
                    className="w-10 h-10 bg-white/90 backdrop-blur rounded-full flex items-center justify-center text-slate-600 hover:text-rose-500 shadow-sm transition-colors"
                  >
                    <Heart className="w-5 h-5" />
                  </button>
                </div>
              </div>
              <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                {product.images.map((img, i) => (
                  <button 
                    key={i} 
                    onClick={() => setSelectedImageIdx(i)}
                    className={`w-20 h-20 rounded-lg flex-shrink-0 border-2 overflow-hidden bg-slate-50 flex items-center justify-center ${i === selectedImageIdx ? 'border-indigo-600' : 'border-transparent'}`}
                  >
                    <img src={img} alt="Thumbnail" className="w-full h-full object-cover" />
                  </button>
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
                  <div className="flex flex-col items-end gap-2">
                    <span className="text-blue-600 text-xs font-bold px-2 py-1 bg-blue-100 rounded">Verified</span>
                    <button
                      onClick={() => setShowAltSuppliers(true)}
                      className="text-xs text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
                    >
                      <Search className="w-3 h-3" />
                      Alternative Suppliers
                    </button>
                  </div>
                </div>
              </div>

              {/* Alternative Sellers */}
              <div className="mt-4 border border-slate-200 rounded-xl overflow-hidden shadow-sm bg-white">
                <div className="bg-slate-50 p-3.5 border-b border-slate-200">
                  <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                    <Users className="w-4 h-4 text-indigo-600" />
                    Alternative Sellers
                  </h4>
                </div>
                <div className="divide-y divide-slate-100">
                  {[
                    { name: "Global ChemCorp", loc: "Mumbai, India", price: currentPrice * 0.95 },
                    { name: "SinoChemicals Ltd", loc: "Shanghai, China", price: currentPrice * 0.88 },
                  ].map((seller, idx) => (
                    <div key={idx} onClick={() => {
                        navigate(`/buyer/product/${product.id}`, {
                          state: { product: { ...activeProduct, supplierName: seller.name, location: seller.loc, price: seller.price } },
                          replace: true
                        });
                    }} className="p-4 hover:bg-slate-50 transition-colors cursor-pointer group">
                      <div className="flex justify-between items-start mb-1.5">
                        <span className="font-bold text-slate-800 text-sm group-hover:text-indigo-600 transition-colors">{seller.name}</span>
                        <span className="font-bold text-emerald-600 text-sm">₹{seller.price.toLocaleString("en-IN", {maximumFractionDigits: 0})}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <p className="text-xs text-slate-500">{seller.loc}</p>
                        <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-medium">View deal</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Product Info */}
            <div className="flex-1 p-6 lg:p-8 relative min-w-0">
              {/* Promotional Banner */}
              <div className="absolute top-0 left-0 right-0 bg-indigo-50 text-indigo-700 px-6 py-2 text-sm font-bold flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="bg-indigo-600 text-white px-1.5 rounded text-xs">Sale</span>
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
                  <span className="text-indigo-600 font-medium flex items-center gap-1">
                    🏆 #6 most popular in {product.category}
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
                  <div className="flex items-center gap-4 mb-2">
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
                  {quantity > MOCK_AVAILABLE_STOCK && (
                    <div className="flex items-start gap-1.5 text-amber-600 mt-2 bg-amber-50 p-2.5 rounded-lg border border-amber-200">
                      <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-xs font-bold">This supplier only has {MOCK_AVAILABLE_STOCK.toLocaleString()} units available.</p>
                        <p className="text-xs mt-0.5">You can split your order with other suppliers to fulfill your total requirement.</p>
                      </div>
                    </div>
                  )}
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

          {/* Description Section */}
          <div className="p-6 lg:p-8 border-b border-slate-200 bg-white">
            <h2 className="text-xl font-bold text-slate-900 mb-4">Product Description</h2>
            <p className="text-slate-700 leading-relaxed text-sm">
              {product.description}
            </p>
          </div>

          {/* Key Attributes Section */}
          <div className="p-6 lg:p-8 border-b border-slate-200 bg-[#f9fafb]">
            <h2 className="text-xl font-bold text-slate-900 mb-6">Key attributes</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
              <div className="grid grid-cols-3 border-b border-slate-200 pb-3">
                <span className="text-slate-500 text-sm">CAS No.</span>
                <span className="col-span-2 text-slate-900 text-sm font-medium">{product.casNumber}</span>
              </div>
              <div className="grid grid-cols-3 border-b border-slate-200 pb-3">
                <span className="text-slate-500 text-sm">Other Names</span>
                <span className="col-span-2 text-slate-900 text-sm font-medium">{Array.isArray(product.tags) ? (product.tags.length > 0 ? product.tags.join(', ') : 'N/A') : (product.tags || 'N/A')}</span>
              </div>
              <div className="grid grid-cols-3 border-b border-slate-200 pb-3">
                <span className="text-slate-500 text-sm">Category</span>
                <span className="col-span-2 text-slate-900 text-sm font-medium">{product.category}</span>
              </div>
              <div className="grid grid-cols-3 border-b border-slate-200 pb-3">
                <span className="text-slate-500 text-sm">Place of Origin</span>
                <span className="col-span-2 text-slate-900 text-sm font-medium">{product.location}</span>
              </div>
              <div className="grid grid-cols-3 border-b border-slate-200 pb-3">
                <span className="text-slate-500 text-sm">Grade Standard</span>
                <span className="col-span-2 text-slate-900 text-sm font-medium">{product.grade}</span>
              </div>
            </div>
          </div>

          {/* Reviews Section */}
          <div className="p-6 lg:p-8" id="reviews">
            <div className="flex items-center gap-4 mb-8">
              <h2 className="text-xl font-bold text-slate-900">Reviews ({product.reviews})</h2>
            </div>

            <div className="space-y-8">
              {MOCK_REVIEWS.map(review => (
                <div key={review.id} className="flex flex-col sm:flex-row gap-6 border-b border-slate-100 pb-8 last:border-0 last:pb-0">
                  {/* User Profile */}
                  <div className="w-full sm:w-40 flex-shrink-0">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-xs">
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
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden sticky top-24 shadow-sm">
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
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3.5 rounded-full text-center transition-colors mb-3"
              >
                Send inquiry
              </button>

              <button 
                onClick={() => {
                  if (quantity > MOCK_AVAILABLE_STOCK) {
                    setShowSplitModal(true);
                    // auto-allocate remaining logic setup
                    let remaining = quantity - MOCK_AVAILABLE_STOCK;
                    const initialAlloc: Record<string, number> = {};
                    alternativeSellers.forEach(s => {
                      if (remaining > 0) {
                        const alloc = Math.min(remaining, 1000); // assume max 1000 per alt supplier
                        initialAlloc[s.id] = alloc;
                        remaining -= alloc;
                      } else {
                        initialAlloc[s.id] = 0;
                      }
                    });
                    setSplitAllocations(initialAlloc);
                  } else if (quantity > 0) {
                    const saved = localStorage.getItem("o3_buyer_cart");
                    const cart = saved ? JSON.parse(saved) : [];
                    const newItem = {
                      id: Date.now(),
                      supplier: product.supplierName,
                      product: product.title,
                      cas: "13463-67-7", // static for mock
                      price: currentPrice,
                      quantity: quantity,
                      unit: "piece",
                      total: subtotal,
                      image: product.images[0]
                    };
                    
                    const existingIdx = cart.findIndex((x: any) => x.product === newItem.product && x.supplier === newItem.supplier);
                    if (existingIdx >= 0) {
                      cart[existingIdx].quantity += quantity;
                      cart[existingIdx].total += subtotal;
                    } else {
                      cart.push(newItem);
                    }

                    localStorage.setItem("o3_buyer_cart", JSON.stringify(cart));
                    window.dispatchEvent(new Event("cartUpdated"));
                    alert(`Added ${quantity} of ${product.title} to your cart!`);
                  } else {
                    alert("Please select a quantity first");
                  }
                }}
                className={`w-full font-bold py-2 text-sm transition-colors mt-1 rounded-full ${
                  quantity > MOCK_AVAILABLE_STOCK 
                    ? "bg-amber-100 text-amber-700 hover:bg-amber-200 border border-amber-300" 
                    : "text-indigo-600 hover:text-indigo-700"
                }`}
              >
                {quantity > MOCK_AVAILABLE_STOCK ? "Split Order to Cart" : "Add to cart"}
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
                onClick={async () => {
                  if (inquiryMessage.trim()) {
                    try {
                      // 1. Create an RFQ for the inquiry
                      const rfqRes = await fetch("http://localhost:3001/api/rfqs", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                          buyerId: user.id || "b1",
                          buyerName: user.name || "Buyer",
                          productName: product.title,
                          quantity: quantity || 1,
                          quantityUnit: "piece",
                          deliveryDate: new Date(Date.now() + 7*24*60*60*1000).toISOString().split('T')[0],
                          deliveryLocation: "Default",
                          paymentTerms: "Standard"
                        })
                      });
                      const rfq = await rfqRes.json();

                      // 2. Create a Quote room to chat in
                      const quoteRes = await fetch("http://localhost:3001/api/quotes", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                          rfqId: rfq.id,
                          supplierId: "s1", // The mock supplier ID
                          supplierName: product.supplierName,
                          price: currentPrice || 0,
                          priceUnit: "INR",
                          totalAmount: subtotal || 0,
                          quantity: quantity || 1,
                          quantityUnit: "piece",
                          leadTimeDays: 7,
                          paymentTerms: "Standard",
                          logisticsTerms: "Standard",
                          validityDays: 7,
                          validUntil: new Date(Date.now() + 7*24*60*60*1000).toISOString()
                        })
                      });
                      const quote = await quoteRes.json();

                      // 3. Send initial message via socket
                      const socket = io("http://localhost:3001");
                      socket.emit("send_message", {
                        quoteId: quote.id,
                        sender: "buyer",
                        text: `[INQUIRY for ${product.title}]\n\n${inquiryMessage}`
                      });

                      alert("Inquiry sent successfully! You can track this in your Messages.");
                      setShowInquiryModal(false);
                      setInquiryMessage("");
                      
                      // Invalidate quotes so GlobalChatWidget fetches the new quote
                      await queryClient.invalidateQueries({ queryKey: ["quotes"] });

                      // Immediately open the chat widget to this new inquiry
                      window.dispatchEvent(new CustomEvent("openChat", { detail: quote.id }));
                      
                    } catch (error) {
                      console.error("Failed to send inquiry:", error);
                      alert("Failed to send inquiry.");
                    }
                  } else {
                    alert("Please enter an inquiry message first.");
                  }
                }}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 px-8 rounded-full transition-colors"
              >
                Send inquiry
              </button>
            </div>
          </div>
        </div>
      )}

      {showAltSuppliers && (
        <AlternativeSuppliersModal
          productName={product.title}
          category={product.category || "General"}
          currentSupplier={product.supplierName}
          onClose={() => setShowAltSuppliers(false)}
        />
      )}

      {/* Split Order Modal */}
      {showSplitModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col">
            <div className="flex justify-between items-center p-5 border-b border-slate-200 bg-slate-50">
              <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <Users className="w-5 h-5 text-indigo-600" />
                Split Your Order
              </h2>
              <button onClick={() => setShowSplitModal(false)} className="text-slate-400 hover:text-slate-600 bg-white rounded-full p-1 shadow-sm">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 bg-white overflow-y-auto max-h-[70vh]">
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6 flex gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0" />
                <div>
                  <h3 className="font-bold text-amber-900 text-sm mb-1">Insufficient stock from primary supplier</h3>
                  <p className="text-sm text-amber-700">
                    You requested <strong>{quantity.toLocaleString()}</strong> units, but <strong>{product.supplierName}</strong> only has <strong>{MOCK_AVAILABLE_STOCK.toLocaleString()}</strong> units in stock. 
                    You can fulfill your remaining deficit (<strong>{(quantity - MOCK_AVAILABLE_STOCK).toLocaleString()}</strong> units) by purchasing from alternative verified suppliers below.
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-bold text-slate-900">Order Allocation</h3>
                
                {/* Primary Supplier Allocation */}
                <div className="border border-indigo-200 bg-indigo-50/50 rounded-xl p-4 flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-bold text-slate-900">{product.supplierName}</span>
                      <span className="bg-indigo-100 text-indigo-700 text-[10px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">Primary</span>
                    </div>
                    <p className="text-sm text-slate-600">₹{currentPrice.toLocaleString("en-IN", { minimumFractionDigits: 2 })} / unit</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-slate-500 mb-1">Allocated Stock</p>
                    <p className="font-bold text-indigo-700 text-lg">{MOCK_AVAILABLE_STOCK.toLocaleString()}</p>
                  </div>
                </div>

                {/* Alternative Suppliers Allocation */}
                {alternativeSellers.map(seller => (
                  <div key={seller.id} className="border border-slate-200 rounded-xl p-4 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between hover:border-indigo-300 transition-colors">
                    <div>
                      <h4 className="font-bold text-slate-900">{seller.name}</h4>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-sm text-emerald-600 font-bold">₹{seller.price.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
                        <span className="text-xs text-slate-400 line-through">₹{currentPrice.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
                      </div>
                      <div className="flex items-center gap-1 mt-1.5 text-xs text-amber-500">
                        <Star className="w-3 h-3 fill-amber-500" />
                        <span className="font-medium text-slate-700">{seller.rating} Rating</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3 w-full sm:w-auto">
                      <span className="text-sm font-medium text-slate-600">Qty:</span>
                      <input 
                        type="number" 
                        min="0"
                        value={splitAllocations[seller.id] || 0}
                        onChange={(e) => {
                          const val = parseInt(e.target.value) || 0;
                          setSplitAllocations(prev => ({ ...prev, [seller.id]: val }));
                        }}
                        className="w-24 px-3 py-1.5 rounded-lg border border-slate-300 text-sm font-bold text-center focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* Validation Summary */}
              {(() => {
                const totalAllocated = MOCK_AVAILABLE_STOCK + Object.values(splitAllocations).reduce((a, b) => a + b, 0);
                const isMatched = totalAllocated === quantity;
                return (
                  <div className={`mt-6 p-4 rounded-xl border flex items-center justify-between ${
                    isMatched ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-slate-50 border-slate-200 text-slate-700'
                  }`}>
                    <div>
                      <p className="text-sm font-medium">Total Allocated: <strong>{totalAllocated.toLocaleString()}</strong> / {quantity.toLocaleString()}</p>
                      {!isMatched && (
                        <p className="text-xs text-rose-500 font-medium mt-1">
                          You still need to allocate {Math.abs(quantity - totalAllocated).toLocaleString()} units.
                        </p>
                      )}
                    </div>
                    {isMatched && <CheckCircle2 className="w-6 h-6 text-emerald-500" />}
                  </div>
                );
              })()}
            </div>

            <div className="p-5 bg-slate-50 border-t border-slate-200 flex justify-end gap-3">
              <button 
                onClick={() => setShowSplitModal(false)}
                className="px-6 py-2.5 rounded-lg font-bold text-slate-600 hover:bg-slate-200 transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={() => {
                  const totalAllocated = MOCK_AVAILABLE_STOCK + Object.values(splitAllocations).reduce((a, b) => a + b, 0);
                  if (totalAllocated !== quantity) {
                    alert(`Please allocate exactly ${quantity} units. Currently allocated: ${totalAllocated}`);
                    return;
                  }

                  const saved = localStorage.getItem("o3_buyer_cart");
                  const cart = saved ? JSON.parse(saved) : [];
                  
                  // Helper to add item
                  const addOrUpdateCart = (item: any) => {
                    const existingIdx = cart.findIndex((x: any) => x.product === item.product && x.supplier === item.supplier);
                    if (existingIdx >= 0) {
                      cart[existingIdx].quantity += item.quantity;
                      cart[existingIdx].total += item.total;
                    } else {
                      cart.push(item);
                    }
                  };

                  // 1. Add primary supplier
                  addOrUpdateCart({
                    id: Date.now() + Math.random(),
                    supplier: product.supplierName,
                    product: product.title,
                    cas: "13463-67-7",
                    price: currentPrice,
                    quantity: MOCK_AVAILABLE_STOCK,
                    unit: "piece",
                    total: MOCK_AVAILABLE_STOCK * currentPrice,
                    image: product.images[0]
                  });

                  // 2. Add alternative suppliers
                  alternativeSellers.forEach(seller => {
                    const alloc = splitAllocations[seller.id] || 0;
                    if (alloc > 0) {
                      addOrUpdateCart({
                        id: Date.now() + Math.random(),
                        supplier: seller.name,
                        product: product.title,
                        cas: "13463-67-7",
                        price: seller.price,
                        quantity: alloc,
                        unit: "piece",
                        total: alloc * seller.price,
                        image: product.images[0]
                      });
                    }
                  });

                  localStorage.setItem("o3_buyer_cart", JSON.stringify(cart));
                  window.dispatchEvent(new Event("cartUpdated"));
                  setShowSplitModal(false);
                  
                  // Reset quantity to 0
                  setQuantity(0);
                  alert("Split order added to cart successfully!");
                  navigate("/buyer/cart");
                }}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 px-8 rounded-lg transition-colors shadow-sm"
              >
                Confirm & Add to Cart
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
