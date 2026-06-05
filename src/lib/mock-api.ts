import { delay } from "./utils";
import type {
  Product,
  Supplier,
  Buyer,
  RFQ,
  Quote,
  Order,
  Notification,
} from "@/types";

export interface Document {
  id: string;
  name: string;
  type: string;
  size: string;
  format: string;
  status: string;
  uploadedAt: string;
}

import suppliersData from "@/mock-data/suppliers.json";
import buyersData from "@/mock-data/buyers.json";
import notificationsData from "@/mock-data/notifications.json";

const suppliers = suppliersData as Supplier[];
const buyers = buyersData as Buyer[];
const notifications = notificationsData as Notification[];

// ─── HTTP Helper ─────────────────────────────────────────────────────────────

async function fetchAPI<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`/api${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
  });
  if (!res.ok) {
    throw new Error(`API Error: ${res.statusText}`);
  }
  return res.json();
}

// ─── Products ────────────────────────────────────────────────────────────────

export async function getProducts(filters?: {
  search?: string;
  category?: string;
  location?: string;
  minPrice?: number;
  maxPrice?: number;
  grade?: string;
}): Promise<Product[]> {
  let result = await fetchAPI<Product[]>("/products");
  if (filters?.search) {
    const q = filters.search.toLowerCase();
    result = result.filter(
      (p) =>
        (p.name && p.name.toLowerCase().includes(q)) ||
        (p.casNumber && p.casNumber.toLowerCase().includes(q)) ||
        (typeof p.tags === 'string' 
          ? p.tags.toLowerCase().includes(q) 
          : Array.isArray(p.tags) && p.tags.some((t: string) => t.toLowerCase().includes(q)))
    );
  }
  if (filters?.category) {
    result = result.filter((p) => p.category === filters.category);
  }
  if (filters?.location) {
    result = result.filter((p) =>
      p.location.toLowerCase().includes(filters.location!.toLowerCase())
    );
  }
  if (filters?.minPrice !== undefined) {
    result = result.filter((p) => p.price >= filters.minPrice!);
  }
  if (filters?.maxPrice !== undefined) {
    result = result.filter((p) => p.price <= filters.maxPrice!);
  }
  if (filters?.grade) {
    result = result.filter((p) =>
      p.grade.toLowerCase().includes(filters.grade!.toLowerCase())
    );
  }
  return result;
}

export async function createProduct(data: Partial<Product>): Promise<Product> {
  return fetchAPI<Product>("/products", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function getProductById(id: string): Promise<Product | undefined> {
  const products = await fetchAPI<Product[]>("/products");
  return products.find((p) => p.id === id);
}

export async function getProductCategories(): Promise<string[]> {
  const products = await fetchAPI<Product[]>("/products");
  return [...new Set(products.map((p) => p.category))].sort();
}

// ─── Suppliers ───────────────────────────────────────────────────────────────

export async function getSuppliers(): Promise<Supplier[]> {
  await delay(400);
  return suppliers;
}

export async function getSupplierById(id: string): Promise<Supplier | undefined> {
  await delay(200);
  return suppliers.find((s) => s.id === id);
}

// ─── Buyers ──────────────────────────────────────────────────────────────────

export async function getBuyers(): Promise<Buyer[]> {
  await delay(400);
  return buyers;
}

// ─── RFQs ────────────────────────────────────────────────────────────────────

export async function getRFQs(filters?: {
  buyerId?: string;
  status?: string;
  supplierId?: string;
}): Promise<RFQ[]> {
  const params = new URLSearchParams();
  if (filters?.buyerId) params.append("buyerId", filters.buyerId);
  if (filters?.status) params.append("status", filters.status);
  
  return fetchAPI<RFQ[]>(`/rfqs?${params.toString()}`);
}

export async function createRFQ(data: Partial<RFQ>): Promise<RFQ> {
  return fetchAPI<RFQ>("/rfqs", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function getRFQById(id: string): Promise<RFQ | undefined> {
  const rfqs = await fetchAPI<RFQ[]>("/rfqs");
  return rfqs.find((r) => r.id === id);
}

// ─── Quotes ──────────────────────────────────────────────────────────────────

export async function getQuotes(filters?: {
  rfqId?: string;
  supplierId?: string;
  status?: string;
}): Promise<Quote[]> {
  const params = new URLSearchParams();
  if (filters?.rfqId) params.append("rfqId", filters.rfqId);
  if (filters?.supplierId) params.append("supplierId", filters.supplierId);
  
  let quotes = await fetchAPI<Quote[]>(`/quotes?${params.toString()}`);
  if (filters?.status) {
    quotes = quotes.filter((q) => q.status === filters.status);
  }
  return quotes;
}

export async function createQuote(data: Partial<Quote>): Promise<Quote> {
  return fetchAPI<Quote>("/quotes", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function getQuoteById(id: string): Promise<Quote | undefined> {
  const quotes = await fetchAPI<Quote[]>("/quotes");
  return quotes.find((q) => q.id === id);
}

export async function acceptQuote(quoteId: string): Promise<Order> {
  return fetchAPI<Order>(`/quotes/${quoteId}/accept`, { method: "POST" });
}

// ─── Orders ──────────────────────────────────────────────────────────────────

export async function getOrders(filters?: {
  buyerId?: string;
  supplierId?: string;
  status?: string;
}): Promise<Order[]> {
  const params = new URLSearchParams();
  if (filters?.buyerId) params.append("buyerId", filters.buyerId);
  if (filters?.supplierId) params.append("supplierId", filters.supplierId);
  
  let orders = await fetchAPI<Order[]>(`/orders?${params.toString()}`);
  if (filters?.status) {
    orders = orders.filter((o) => o.status === filters.status);
  }
  return orders;
}

export async function createOrder(data: Partial<Order>): Promise<Order> {
  return fetchAPI<Order>("/orders", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function getOrderById(id: string): Promise<Order | undefined> {
  const orders = await fetchAPI<Order[]>("/orders");
  return orders.find((o) => o.id === id);
}

// ─── Notifications ───────────────────────────────────────────────────────────

export async function getNotifications(filters?: {
  category?: string;
  read?: boolean;
}): Promise<Notification[]> {
  await delay(300);
  let result = [...notifications];
  if (filters?.category) {
    result = result.filter((n) => n.category === filters.category);
  }
  if (filters?.read !== undefined) {
    result = result.filter((n) => n.read === filters.read);
  }
  return result.sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );
}

// ─── Dashboard Stats ─────────────────────────────────────────────────────────

export async function getBuyerDashboardStats(buyerId = "b1") {
  const [rfqs, orders] = await Promise.all([
    fetchAPI<RFQ[]>(`/rfqs?buyerId=${buyerId}`),
    fetchAPI<Order[]>(`/orders?buyerId=${buyerId}`)
  ]);
  
  const activeRFQs = rfqs.filter(
    (r) => r.status === "sent" || r.status === "viewed"
  ).length;
  const quotesReceived = rfqs.reduce((s, r) => s + r.quotesReceived, 0);
  const totalOrders = orders.length;
  const spend = orders.reduce((s, o) => s + o.totalAmount, 0);
  return { activeRFQs, quotesReceived, totalOrders, spend };
}

export async function getSupplierDashboardStats(supplierId = "s1") {
  const [quotes, orders, allRfqs] = await Promise.all([
    fetchAPI<Quote[]>(`/quotes?supplierId=${supplierId}`),
    fetchAPI<Order[]>(`/orders?supplierId=${supplierId}`),
    fetchAPI<RFQ[]>('/rfqs')
  ]);
  
  const openRFQs = allRfqs.filter(
    (r) => r.status === "sent" || r.status === "viewed"
  ).length;
  const activeQuotes = quotes.filter(
    (q) => q.status === "pending" || q.status === "negotiating"
  ).length;
  const revenue = orders.reduce((s, o) => s + o.totalAmount, 0);
  return {
    openRFQs,
    activeQuotes,
    totalOrders: orders.length,
    revenue,
  };
}

// ─── AI Search ───────────────────────────────────────────────────────────────

export async function aiSearch(query: string) {
  await delay(1200);
  const products = await fetchAPI<Product[]>("/products");
  const q = query.toLowerCase();
  let matchedProducts = products.filter(
    (p) =>
      (p.name && p.name.toLowerCase().includes(q.split(" ").find((w) => w.length > 4) || q)) ||
      (typeof p.tags === 'string' 
        ? p.tags.toLowerCase().includes(q) 
        : Array.isArray(p.tags) && p.tags.some((t: string) => q.includes(t.toLowerCase()))) ||
      (p.category && p.category.toLowerCase().includes(q))
  );
  if (matchedProducts.length === 0) {
    matchedProducts = products.slice(0, 6);
  }
  return matchedProducts.slice(0, 6).map((p) => {
    const supplier = suppliers.find((s) => s.id === p.supplierId);
    return {
      product: p.name,
      supplier: p.supplierName,
      supplierRating: supplier?.rating || p.rating,
      price: p.price,
      priceUnit: p.priceUnit,
      leadTimeDays: p.leadTimeDays,
      location: p.location,
      o3Assured: supplier?.o3Assured || false,
    };
  });
}

// ─── Price Intelligence ──────────────────────────────────────────────────────

export async function getPriceTrend(
  productName: string,
  days: 7 | 30 | 90
): Promise<{ date: string; price: number }[]> {
  await delay(600);
  const products = await fetchAPI<Product[]>("/products");
  const baseProduct = products.find((p) =>
    p.name.toLowerCase().includes(productName.toLowerCase())
  );
  const basePrice = baseProduct?.price || 100;
  const result = [];
  const now = new Date();
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const noise = (Math.random() - 0.5) * 0.06 * basePrice;
    const trend = (i / days) * 0.05 * basePrice * (Math.random() > 0.5 ? 1 : -1);
    result.push({
      date: d.toISOString().split("T")[0],
      price: Math.round((basePrice + noise + trend) * 100) / 100,
    });
  }
  return result;
}

// ─── Spend Analytics ─────────────────────────────────────────────────────────

export async function getMonthlySpend(buyerId = "b1") {
  await delay(400);
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return months.slice(0, 9).map((month, i) => ({
    month,
    spend: Math.round(100000 + Math.random() * 800000),
    rfqs: Math.round(2 + Math.random() * 8),
  }));
}

export async function getRevenueByMonth(supplierId = "s1") {
  await delay(400);
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep"];
  return months.map((month) => ({
    month,
    revenue: Math.round(200000 + Math.random() * 1500000),
    orders: Math.round(3 + Math.random() * 12),
  }));
}

// ─── Content Hub ─────────────────────────────────────────────────────────────

export async function getContentArticles() {
  await delay(350);
  return [
    { id: "c1", title: "India's Specialty Chemicals Sector to Hit $64B by 2025", summary: "India's specialty chemicals industry is witnessing unprecedented growth, driven by the China+1 strategy being adopted by global manufacturers.", category: "market_news", author: "O3 Research Team", publishedAt: "2024-09-05", readTimeMinutes: 4, premium: false },
    { id: "c2", title: "TiO2 Price Outlook: Q4 2024", summary: "Rutile and anatase grades of titanium dioxide face price pressure as Chinese exports increase. Analysis of demand-supply dynamics.", category: "chemical_insights", author: "Priya Sharma, CFA", publishedAt: "2024-09-04", readTimeMinutes: 6, premium: false },
    { id: "c3", title: "API Procurement Best Practices for Indian Formulations", summary: "A comprehensive guide to sourcing active pharmaceutical ingredients while ensuring compliance with CDSCO and FDA requirements.", category: "industry_reports", author: "Dr. Ramesh Kumar", publishedAt: "2024-09-03", readTimeMinutes: 12, premium: true },
    { id: "c4", title: "Caustic Soda Market: Production Constraints & Opportunities", summary: "Global chlor-alkali production cuts are pushing caustic soda prices higher. Impact on textile, paper, and alumina sectors.", category: "market_news", author: "O3 Research Team", publishedAt: "2024-09-02", readTimeMinutes: 5, premium: false },
    { id: "c5", title: "Green Chemistry Trends in Indian Manufacturing", summary: "How India's chemical manufacturers are adopting sustainable processes, green solvents, and circular economy principles.", category: "chemical_insights", author: "Anjali Nair", publishedAt: "2024-09-01", readTimeMinutes: 7, premium: false },
    { id: "c6", title: "2024 India Agrochemical Procurement Report", summary: "Full-year analysis of fertilizer and pesticide procurement trends, pricing, and supply chain disruptions in Indian agriculture.", category: "industry_reports", author: "O3 Analytics", publishedAt: "2024-08-30", readTimeMinutes: 18, premium: true },
    { id: "c7", title: "Methanol-to-Olefins: Impact on Indian Petrochemicals", summary: "China's MTO expansion is reshaping global methanol demand. What this means for Indian buyers and petrochemical feedstock prices.", category: "chemical_insights", author: "Vikram Bose", publishedAt: "2024-08-28", readTimeMinutes: 8, premium: false },
    { id: "c8", title: "Digital Transformation in Chemical Distribution", summary: "How B2B platforms are reshaping chemical distribution in India — reducing intermediaries and improving price transparency.", category: "market_news", author: "O3 Research Team", publishedAt: "2024-08-26", readTimeMinutes: 5, premium: false },
    { id: "c9", title: "Pharmaceutical Supply Chain Risk Management 2024", summary: "Strategies for diversifying API and excipient supply chains to mitigate geopolitical and logistical risks.", category: "industry_reports", author: "Meenakshi Rao, PharmD", publishedAt: "2024-08-24", readTimeMinutes: 15, premium: true },
  ];
}

// ─── Documents ─────────────────────────────────────────────────────────────

export async function getDocuments(): Promise<Document[]> {
  return fetchAPI<Document[]>("/documents");
}

export async function uploadDocument(data: Partial<Document>): Promise<Document> {
  return fetchAPI<Document>("/documents", {
    method: "POST",
    body: JSON.stringify(data),
  });
}
