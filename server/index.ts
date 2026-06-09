import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

const prisma = new PrismaClient();
const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

io.on("connection", (socket) => {
  socket.on("join_quote_room", (quoteId) => {
    socket.join(quoteId);
  });

  socket.on("send_message", async (data) => {
    try {
      const savedMessage = await prisma.message.create({
        data: {
          quoteId: data.quoteId,
          sender: data.sender,
          text: data.text,
          counterPrice: data.counterPrice,
          counterLeadTime: data.counterLeadTime,
        }
      });
      io.to(data.quoteId).emit("receive_message", savedMessage);
    } catch (error) {
      console.error("Error saving message:", error);
    }
  });
});
app.use(cors());
app.use(express.json());

// Users
app.get('/api/users', async (req, res) => {
  const users = await prisma.user.findMany();
  res.json(users);
});

// Products
app.get('/api/products', async (req, res) => {
  const { search, category, location, maxPrice } = req.query;
  const where: any = {};
  if (search) {
    where.OR = [
      { name: { contains: String(search) } },
      { casNumber: { contains: String(search) } },
    ];
  }
  if (category) where.category = String(category);
  
  const products = await prisma.product.findMany({ where });
  res.json(products);
});

app.post('/api/products', async (req, res) => {
  const data = req.body;
  const newProduct = await prisma.product.create({
    data: {
      ...data,
      createdAt: new Date(),
    }
  });
  res.json(newProduct);
});

// RFQs
app.get('/api/rfqs', async (req, res) => {
  const { buyerId, status } = req.query;
  const where: any = {};
  if (buyerId) where.buyerId = String(buyerId);
  if (status) where.status = String(status);
  
  const rfqs = await prisma.rFQ.findMany({ where, orderBy: { createdAt: 'desc' } });
  res.json(rfqs);
});

app.post('/api/rfqs', async (req, res) => {
  const data = req.body;
  const newRfq = await prisma.rFQ.create({
    data: {
      ...data,
      rfqNumber: `RFQ-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + (data.expiryDays || 7) * 24 * 60 * 60 * 1000),
      expiryDays: data.expiryDays || 7,
      dispatchMethod: data.dispatchMethod || 'auto',
      quotesReceived: 0,
      status: 'sent',
    }
  });
  res.json(newRfq);
});

// Quotes
app.get('/api/quotes', async (req, res) => {
  const { rfqId, supplierId } = req.query;
  const where: any = {};
  if (rfqId) where.rfqId = String(rfqId);
  if (supplierId) where.supplierId = String(supplierId);
  
  const quotes = await prisma.quote.findMany({ where, orderBy: { createdAt: 'desc' } });
  res.json(quotes);
});

app.post('/api/quotes', async (req, res) => {
  const data = req.body;
  const newQuote = await prisma.quote.create({
    data: {
      ...data,
      quoteNumber: `QT-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
      createdAt: new Date(),
      status: 'pending',
    }
  });
  // Update RFQ status and quotes count
  if (data.rfqId) {
    await prisma.rFQ.update({
      where: { id: data.rfqId },
      data: {
        status: 'quote_received',
        quotesReceived: { increment: 1 }
      }
    });
  }
  res.json(newQuote);
});

app.patch('/api/quotes/:id', async (req, res) => {
  const { status } = req.body;
  const updatedQuote = await prisma.quote.update({
    where: { id: req.params.id },
    data: { status }
  });
  res.json(updatedQuote);
});

app.post('/api/quotes/:id/accept', async (req, res) => {
  const quoteId = req.params.id;
  
  try {
    const result = await prisma.$transaction(async (tx) => {
      // 1. Update this quote to accepted
      const acceptedQuote = await tx.quote.update({
        where: { id: quoteId },
        data: { status: 'accepted' }
      });
      
      // 2. Reject all other quotes for this RFQ
      await tx.quote.updateMany({
        where: { rfqId: acceptedQuote.rfqId, id: { not: quoteId } },
        data: { status: 'rejected' }
      });
      
      // 3. Update the RFQ status to closed
      const rfq = await tx.rFQ.update({
        where: { id: acceptedQuote.rfqId },
        data: { status: 'closed' }
      });
      
      // 4. Create an Order
      const newOrder = await tx.order.create({
        data: {
          poNumber: `PO-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
          rfqId: rfq.id,
          quoteId: acceptedQuote.id,
          buyerId: rfq.buyerId,
          buyerName: rfq.buyerName,
          supplierId: acceptedQuote.supplierId,
          supplierName: acceptedQuote.supplierName,
          productName: rfq.productName,
          quantity: acceptedQuote.quantity,
          quantityUnit: acceptedQuote.quantityUnit,
          unitPrice: acceptedQuote.price,
          totalAmount: acceptedQuote.totalAmount,
          status: 'confirmed',
          paymentStatus: 'pending',
          expectedDelivery: new Date(Date.now() + (acceptedQuote.leadTimeDays * 24 * 60 * 60 * 1000)).toISOString().split('T')[0],
          createdAt: new Date(),
        }
      });
      
      // 5. Create initial ShipmentEvent
      await tx.shipmentEvent.create({
        data: {
          orderId: newOrder.id,
          status: "order_placed",
          label: "Order Placed",
          timestamp: new Date().toISOString(),
          location: "System",
          completed: true
        }
      });
      
      return newOrder;
    });
    
    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to accept quote' });
  }
});

// Orders
app.get('/api/orders', async (req, res) => {
  const { buyerId, supplierId } = req.query;
  const where: any = {};
  if (buyerId) where.buyerId = String(buyerId);
  if (supplierId) where.supplierId = String(supplierId);
  
  const orders = await prisma.order.findMany({
    where,
    include: { shipmentEvents: true },
    orderBy: { createdAt: 'desc' }
  });
  res.json(orders);
});

app.post('/api/orders', async (req, res) => {
  const data = req.body;
  const newOrder = await prisma.order.create({
    data: {
      ...data,
      poNumber: `PO-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
      createdAt: new Date(),
      status: 'confirmed',
      paymentStatus: 'pending',
    }
  });
  
  // Create an initial shipment event
  await prisma.shipmentEvent.create({
    data: {
      orderId: newOrder.id,
      status: "order_placed",
      label: "Order Placed",
      timestamp: new Date().toISOString(),
      location: "System",
      completed: true
    }
  });
  
  res.json(newOrder);
});

// Documents
app.get('/api/documents', async (req, res) => {
  const documents = await prisma.document.findMany({
    orderBy: { uploadedAt: 'desc' }
  });
  res.json(documents);
});

app.post('/api/documents', async (req, res) => {
  const data = req.body;
  const newDocument = await prisma.document.create({
    data: {
      ...data,
      uploadedAt: new Date()
    }
  });
  res.json(newDocument);
});

// Admin
app.get('/api/admin/stats', async (req, res) => {
  const totalUsers = await prisma.user.count();
  const pendingKyc = await prisma.user.count({ where: { kycStatus: 'pending' } });
  const pendingListings = await prisma.product.count();
  
  res.json({
    totalUsers,
    pendingKyc,
    pendingListings,
    openDisputes: 7, // Mocked for now
    recentActivity: [
      { id: 1, type: 'kyc_approved', message: 'KYC Approved - ChemCorp India', time: '2 mins ago', color: 'bg-green-500' },
      { id: 2, type: 'dispute_raised', message: 'New Dispute Raised - Order #4592', time: '15 mins ago', color: 'bg-yellow-500' },
      { id: 3, type: 'catalog_upload', message: 'Bulk Catalog Upload - 50 Items', time: '1 hour ago', color: 'bg-blue-500' }
    ]
  });
});

app.get('/api/quotes/:id/messages', async (req, res) => {
  try {
    const messages = await prisma.message.findMany({
      where: { quoteId: req.params.id },
      orderBy: { timestamp: 'asc' }
    });
    res.json(messages);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch messages" });
  }
});

// --- AI Endpoints ---

app.post('/api/ai/parse-rfq', async (req, res) => {
  const { prompt } = req.body;
  if (!prompt) return res.status(400).json({ error: "Prompt is required" });
  
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    const systemPrompt = `You are a procurement assistant. Extract the following from the user's text to auto-fill an RFQ. 
Return ONLY a valid JSON object with the following keys, and use null if a field is not found:
{
  "productName": "string",
  "quantity": number (in MT, convert if necessary),
  "deliveryLocation": "string (city or pincode)",
  "deliveryDate": "YYYY-MM-DD (convert relative dates like 'next week' to a real date based on today's date: ${new Date().toISOString()})"
}
Do not return markdown formatting, just the raw JSON string.`;

    const result = await model.generateContent(systemPrompt + "\nUser text: " + prompt);
    const jsonStr = result.response.text().replace(/```json/g, '').replace(/```/g, '').trim();
    res.json(JSON.parse(jsonStr));
  } catch (error) {
    console.error("AI parse error:", error);
    res.status(500).json({ error: "Failed to parse RFQ" });
  }
});

app.post('/api/ai/parse-search', async (req, res) => {
  const { prompt } = req.body;
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    const systemPrompt = `You are an AI assistant. Parse the user's B2B marketplace search query into structured filters.
Return ONLY valid JSON:
{
  "search": "string (product name or chemical, or null)",
  "location": "string (or null)",
  "maxPrice": number (or null),
  "category": "string (or null)"
}`;
    const result = await model.generateContent(systemPrompt + "\nUser query: " + prompt);
    const jsonStr = result.response.text().replace(/```json/g, '').replace(/```/g, '').trim();
    res.json(JSON.parse(jsonStr));
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to parse search" });
  }
});

app.post('/api/ai/chat', async (req, res) => {
  const { message, buyerId } = req.body;
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    
    let orderContext = "";
    if (buyerId) {
      const orders = await prisma.order.findMany({
        where: { buyerId: String(buyerId) },
        include: { shipmentEvents: true },
        take: 5,
        orderBy: { createdAt: 'desc' }
      });
      orderContext = "User's Recent Orders Data:\n" + JSON.stringify(orders, null, 2);
    }

    const systemPrompt = `You are O3's AI assistant for a B2B chemical procurement marketplace.
Answer questions helpfully. Keep answers concise and strictly related to procurement.
If the user asks to "track my order", "where is my order", or asks about their orders, use the following recent order data to answer them intelligently:
${orderContext}`;
    
    const result = await model.generateContent(systemPrompt + "\nUser: " + message);
    res.json({ reply: result.response.text() });
  } catch (error) {
    res.status(500).json({ error: "Failed to generate reply" });
  }
});

app.post('/api/ai/sds-rag', async (req, res) => {
  const { chemical, query } = req.body;
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    const systemPrompt = `You are a Safety Data Sheet (SDS) assistant. The user has uploaded an SDS document for "${chemical}".
Since we cannot actually read the PDF in this POC, use your internal knowledge base to answer the user's query as if you are reading from the official SDS document for ${chemical}. Provide a helpful, precise, and safety-focused response.`;
    
    const result = await model.generateContent(systemPrompt + "\nUser Question: " + query);
    res.json({ reply: result.response.text() });
  } catch (error) {
    res.status(500).json({ error: "Failed to generate RAG response" });
  }
});

httpServer.listen(3001, () => {
  console.log('Server is running on http://localhost:3001');
});
