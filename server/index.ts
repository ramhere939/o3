import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const app = express();
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

app.listen(3001, () => {
  console.log('Server is running on http://localhost:3001');
});
