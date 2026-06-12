import { Routes, Route, Navigate } from "react-router-dom";
import { AppProvider, useApp } from "./context/AppContext";
import { AppShell } from "./components/layout/AppShell";

// Auth & Onboarding
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import OtpVerify from "./pages/auth/OtpVerify";
import KycWizard from "./pages/kyc/KycWizard";

// Buyer Pages
import BuyerDashboard from "./pages/buyer/BuyerDashboard";
import BuyerMessages from "./pages/buyer/BuyerMessages";
import ProductCatalog from "./pages/buyer/ProductCatalog";
import ProductDetails from "./pages/buyer/ProductDetails";
import BuyerCart from "./pages/buyer/BuyerCart";
import BuyerFavorites from "./pages/buyer/BuyerFavorites";
import BuyerAccount from "./pages/buyer/BuyerAccount";
import AISearchHub from "./pages/buyer/AISearchHub";
import CreateRFQ from "./pages/buyer/CreateRFQ";
import RFQTracker from "./pages/buyer/RFQTracker";
import QuoteCompare from "./pages/buyer/QuoteCompare";
import QuoteNegotiate from "./pages/buyer/QuoteNegotiate";
import PurchaseOrders from "./pages/buyer/PurchaseOrders";
import ShipmentTracking from "./pages/buyer/ShipmentTracking";
import DocumentsVault from "./pages/buyer/DocumentsVault";

// Supplier Pages
import SupplierDashboard from "./pages/supplier/SupplierDashboard";
import RFQInbox from "./pages/supplier/RFQInbox";
import QuoteGenerator from "./pages/supplier/QuoteGenerator";
import SupplierQuoteNegotiate from "./pages/supplier/QuoteNegotiate";
import InventoryManagement from "./pages/supplier/InventoryManagement";
import SmartPosting from "./pages/supplier/SmartPosting";
import SupplierFulfillment from "./pages/supplier/SupplierFulfillment";
import SupplierEarnings from "./pages/supplier/SupplierEarnings";

// Shared / Platform Pages
import PriceIntelligence from "./pages/ai/PriceIntelligence";
import SDSAssistant from "./pages/ai/SDSAssistant";
import ContentHub from "./pages/content/ContentHub";
import NotificationsPage from "./pages/notifications/NotificationsPage";

function AppRoutes() {
  const { role } = useApp();

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/otp" element={<OtpVerify />} />
      <Route path="/kyc" element={<KycWizard />} />

      {/* Protected Routes (wrapped in AppShell) */}
      <Route element={<AppShell />}>
        {/* Buyer Routes */}
        <Route path="/buyer/dashboard" element={<BuyerDashboard />} />
        <Route path="/buyer/messages" element={<BuyerMessages />} />
        <Route path="/buyer/catalog" element={<ProductCatalog />} />
        <Route path="/buyer/product/:id" element={<ProductDetails />} />
        <Route path="/buyer/cart" element={<BuyerCart />} />
        <Route path="/buyer/favorites" element={<BuyerFavorites />} />
        <Route path="/buyer/account" element={<BuyerAccount />} />
        <Route path="/buyer/search" element={<AISearchHub />} />
        <Route path="/buyer/rfq/create" element={<CreateRFQ />} />
        <Route path="/buyer/rfq/tracker" element={<RFQTracker />} />
        <Route path="/buyer/quotes/compare" element={<QuoteCompare />} />
        <Route path="/buyer/quotes/negotiate" element={<QuoteNegotiate />} />
        <Route path="/buyer/orders" element={<PurchaseOrders />} />
        <Route path="/buyer/shipments" element={<ShipmentTracking />} />
        <Route path="/buyer/documents" element={<DocumentsVault />} />

        {/* Supplier Routes */}
        <Route path="/supplier/dashboard" element={<SupplierDashboard />} />
        <Route path="/supplier/rfq-inbox" element={<RFQInbox />} />
        <Route path="/supplier/quotes" element={<QuoteGenerator />} />
        <Route path="/supplier/quotes/negotiate" element={<SupplierQuoteNegotiate />} />
        <Route path="/supplier/inventory" element={<InventoryManagement />} />
        <Route path="/supplier/inventory/post" element={<SmartPosting />} />
        <Route path="/supplier/fulfillment" element={<SupplierFulfillment />} />
        <Route path="/supplier/earnings" element={<SupplierEarnings />} />

        {/* Shared / AI / Content Routes */}
        <Route path="/price-intelligence" element={<PriceIntelligence />} />
        <Route path="/sds-assistant" element={<SDSAssistant />} />
        <Route path="/content-hub" element={<ContentHub />} />
        <Route path="/notifications" element={<NotificationsPage />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to={role === "buyer" ? "/buyer/dashboard" : "/supplier/dashboard"} replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppRoutes />
    </AppProvider>
  );
}
