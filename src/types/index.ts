// ─── Core Entity Types ───────────────────────────────────────────────────────

export type UserRole = 'buyer' | 'supplier';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  companyName: string;
  avatar?: string;
  gstin?: string;
  mobile: string;
  verified: boolean;
  kycStatus: 'pending' | 'in_review' | 'approved' | 'rejected';
  createdAt: string;
}

// ─── Product ─────────────────────────────────────────────────────────────────

export interface Product {
  id: string;
  name: string;
  casNumber: string;
  hsnCode: string;
  grade: string;
  category: string;
  price: number;
  priceUnit: string;
  currency: 'INR';
  moq: number;
  moqUnit: string;
  supplierId: string;
  supplierName: string;
  location: string;
  leadTimeDays: number;
  rating: number;
  reviewCount: number;
  imageUrl?: string;
  description: string;
  tags: string[];
  inStock: boolean;
  createdAt: string;
}

// ─── Supplier ────────────────────────────────────────────────────────────────

export interface Supplier {
  id: string;
  name: string;
  contactName: string;
  email: string;
  mobile: string;
  gstin: string;
  location: string;
  city: string;
  state: string;
  rating: number;
  reviewCount: number;
  categories: string[];
  verified: boolean;
  o3Assured: boolean;
  memberSince: string;
  totalOrders: number;
  responseRate: number;
  avatar?: string;
}

// ─── Buyer ───────────────────────────────────────────────────────────────────

export interface Buyer {
  id: string;
  name: string;
  contactName: string;
  email: string;
  mobile: string;
  gstin: string;
  location: string;
  industry: string;
  totalSpend: number;
  totalOrders: number;
  memberSince: string;
}

// ─── RFQ ─────────────────────────────────────────────────────────────────────

export type RFQStatus = 'draft' | 'sent' | 'viewed' | 'quote_received' | 'expired' | 'closed' | 'rejected';

export interface RFQ {
  id: string;
  rfqNumber: string;
  buyerId: string;
  buyerName: string;
  productName: string;
  casNumber: string;
  quantity: number;
  quantityUnit: string;
  grade: string;
  deliveryDate: string;
  deliveryLocation: string;
  paymentTerms: string;
  notes?: string;
  status: RFQStatus;
  quotesReceived: number;
  createdAt: string;
  expiresAt: string;
  targetPrice?: number;
}

// ─── Quote ───────────────────────────────────────────────────────────────────

export type QuoteStatus = 'pending' | 'accepted' | 'rejected' | 'negotiating' | 'expired';

export interface Quote {
  id: string;
  quoteNumber: string;
  rfqId: string;
  supplierId: string;
  supplierName: string;
  supplierRating: number;
  price: number;
  priceUnit: string;
  totalAmount: number;
  quantity: number;
  quantityUnit: string;
  leadTimeDays: number;
  paymentTerms: string;
  logisticsTerms: string;
  validityDays: number;
  validUntil: string;
  status: QuoteStatus;
  notes?: string;
  createdAt: string;
}

// ─── Order ───────────────────────────────────────────────────────────────────

export type OrderStatus = 'confirmed' | 'invoice_generated' | 'dispatched' | 'in_transit' | 'delivered' | 'cancelled';

export interface ShipmentEvent {
  status: OrderStatus;
  label: string;
  timestamp: string;
  location?: string;
  completed: boolean;
}

export interface Order {
  id: string;
  poNumber: string;
  rfqId: string;
  quoteId: string;
  buyerId: string;
  buyerName: string;
  supplierId: string;
  supplierName: string;
  productName: string;
  quantity: number;
  quantityUnit: string;
  unitPrice: number;
  totalAmount: number;
  status: OrderStatus;
  paymentStatus: 'pending' | 'paid' | 'overdue';
  shipmentEvents: ShipmentEvent[];
  createdAt: string;
  expectedDelivery: string;
  invoiceUrl?: string;
  poUrl?: string;
  ewayBillUrl?: string;
}

// ─── Notification ────────────────────────────────────────────────────────────

export type NotificationCategory = 'rfq' | 'order' | 'kyc' | 'shipment' | 'price_alert' | 'quote';

export interface Notification {
  id: string;
  title: string;
  message: string;
  category: NotificationCategory;
  read: boolean;
  timestamp: string;
  actionUrl?: string;
  priority: 'low' | 'medium' | 'high';
}

// ─── Chat / Negotiation ──────────────────────────────────────────────────────

export interface NegotiationMessage {
  id: string;
  sender: 'buyer' | 'supplier' | 'system';
  senderName: string;
  message: string;
  timestamp: string;
  offerRevision?: {
    price: number;
    quantity: number;
    leadTimeDays: number;
    paymentTerms: string;
  };
}

// ─── KYC ────────────────────────────────────────────────────────────────────

export interface KYCDocument {
  type: 'gst_certificate' | 'pan_card' | 'coi';
  label: string;
  fileName?: string;
  status: 'pending' | 'uploaded' | 'verified' | 'rejected';
}

// ─── AI Search ───────────────────────────────────────────────────────────────

export interface AISearchResult {
  product: string;
  supplier: string;
  supplierRating: number;
  price: number;
  priceUnit: string;
  leadTimeDays: number;
  location: string;
  o3Assured: boolean;
}

// ─── Price Intelligence ──────────────────────────────────────────────────────

export interface PriceDataPoint {
  date: string;
  price: number;
  volume?: number;
}

// ─── Content ─────────────────────────────────────────────────────────────────

export interface ContentArticle {
  id: string;
  title: string;
  summary: string;
  category: 'market_news' | 'chemical_insights' | 'industry_reports';
  author: string;
  publishedAt: string;
  readTimeMinutes: number;
  imageUrl?: string;
  premium: boolean;
}
