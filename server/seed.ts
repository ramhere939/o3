import { PrismaClient } from '@prisma/client';

// Importing mock data from the frontend directory
import suppliers from '../src/mock-data/suppliers.json';
import buyers from '../src/mock-data/buyers.json';
import products from '../src/mock-data/products.json';
import rfqs from '../src/mock-data/rfqs.json';
import quotes from '../src/mock-data/quotes.json';
import orders from '../src/mock-data/orders.json';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding Database...');

  // 1. Seed Users (Buyers)
  for (const buyer of buyers) {
    await prisma.user.upsert({
      where: { email: buyer.email },
      update: {},
      create: {
        id: buyer.id,
        name: buyer.name,
        email: buyer.email,
        role: 'buyer',
        companyName: buyer.name,
        mobile: buyer.mobile,
        gstin: buyer.gstin,
        verified: true,
        kycStatus: 'approved'
      }
    });
  }

  // 2. Seed Users (Suppliers)
  for (const supplier of suppliers) {
    await prisma.user.upsert({
      where: { email: supplier.email },
      update: {},
      create: {
        id: supplier.id,
        name: supplier.contactName,
        email: supplier.email,
        role: 'supplier',
        companyName: supplier.name,
        mobile: supplier.mobile,
        gstin: supplier.gstin,
        verified: supplier.verified,
        kycStatus: 'approved'
      }
    });
  }

  // 3. Seed Products
  for (const product of products) {
    await prisma.product.create({
      data: {
        id: product.id,
        name: product.name,
        casNumber: product.casNumber,
        hsnCode: product.hsnCode,
        grade: product.grade,
        category: product.category,
        price: product.price,
        priceUnit: product.priceUnit,
        currency: product.currency,
        moq: product.moq,
        moqUnit: product.moqUnit,
        supplierId: product.supplierId,
        supplierName: product.supplierName,
        location: product.location,
        leadTimeDays: product.leadTimeDays,
        rating: product.rating,
        reviewCount: product.reviewCount,
        description: product.description,
        tags: product.tags.join(','),
        inStock: product.inStock
      }
    });
  }

  // 4. Seed RFQs
  for (const rfq of rfqs) {
    await prisma.rFQ.create({
      data: {
        id: rfq.id,
        rfqNumber: rfq.rfqNumber,
        buyerId: rfq.buyerId,
        buyerName: rfq.buyerName,
        productName: rfq.productName,
        casNumber: rfq.casNumber,
        quantity: rfq.quantity,
        quantityUnit: rfq.quantityUnit,
        grade: rfq.grade,
        deliveryDate: rfq.deliveryDate,
        deliveryLocation: rfq.deliveryLocation,
        paymentTerms: rfq.paymentTerms,
        notes: rfq.notes,
        status: rfq.status,
        quotesReceived: rfq.quotesReceived,
        expiresAt: new Date(rfq.expiresAt),
        targetPrice: rfq.targetPrice
      }
    });
  }

  // 5. Seed Quotes
  for (const quote of quotes) {
    await prisma.quote.create({
      data: {
        id: quote.id,
        quoteNumber: quote.quoteNumber,
        rfqId: quote.rfqId,
        supplierId: quote.supplierId,
        supplierName: quote.supplierName,
        supplierRating: quote.supplierRating,
        price: quote.price,
        priceUnit: quote.priceUnit,
        totalAmount: quote.totalAmount,
        quantity: quote.quantity,
        quantityUnit: quote.quantityUnit,
        leadTimeDays: quote.leadTimeDays,
        paymentTerms: quote.paymentTerms,
        logisticsTerms: quote.logisticsTerms,
        validityDays: quote.validityDays,
        validUntil: new Date(quote.validUntil),
        status: quote.status,
        notes: quote.notes
      }
    });
  }

  // 6. Seed Orders
  for (const order of orders) {
    await prisma.order.create({
      data: {
        id: order.id,
        poNumber: order.poNumber,
        rfqId: order.rfqId,
        quoteId: order.quoteId,
        buyerId: order.buyerId,
        buyerName: order.buyerName,
        supplierId: order.supplierId,
        supplierName: order.supplierName,
        productName: order.productName,
        quantity: order.quantity,
        quantityUnit: order.quantityUnit,
        unitPrice: order.unitPrice,
        totalAmount: order.totalAmount,
        status: order.status,
        paymentStatus: order.paymentStatus,
        expectedDelivery: order.expectedDelivery,
        invoiceUrl: order.invoiceUrl,
        poUrl: order.poUrl,
        ewayBillUrl: order.ewayBillUrl,
        shipmentEvents: {
          create: order.shipmentEvents.map((evt) => ({
            status: evt.status,
            label: evt.label,
            timestamp: evt.timestamp,
            location: evt.location,
            completed: evt.completed
          }))
        }
      }
    });
  }

  console.log('Database Seeding Completed!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
