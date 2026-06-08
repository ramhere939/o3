const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const MOCK_DOCS = [
  { id: "d1", name: "GST Certificate", type: "KYC", size: "245 KB", uploadedAt: "2024-08-15", status: "verified", format: "PDF" },
  { id: "d2", name: "PAN Card", type: "KYC", size: "180 KB", uploadedAt: "2024-08-15", status: "verified", format: "PDF" },
  { id: "d3", name: "COA — TiO2 Rutile Batch Aug24", type: "COA", size: "320 KB", uploadedAt: "2024-09-04", status: "active", format: "PDF" },
  { id: "d4", name: "TDS — Titanium Dioxide Supplier", type: "TDS", size: "180 KB", uploadedAt: "2024-09-04", status: "active", format: "PDF" },
  { id: "d5", name: "PO-2024-0001", type: "PO", size: "95 KB", uploadedAt: "2024-08-28", status: "active", format: "PDF" },
  { id: "d6", name: "PO-2024-0002", type: "PO", size: "88 KB", uploadedAt: "2024-08-28", status: "active", format: "PDF" },
  { id: "d7", name: "Invoice INV-0001", type: "Invoice", size: "145 KB", uploadedAt: "2024-08-29", status: "active", format: "PDF" },
  { id: "d8", name: "Invoice INV-0002", type: "Invoice", size: "138 KB", uploadedAt: "2024-08-29", status: "active", format: "PDF" },
  { id: "d9", name: "E-way Bill — PO-2024-0001", type: "Eway Bill", size: "75 KB", uploadedAt: "2024-09-01", status: "active", format: "PDF" },
  { id: "d10", name: "SDS — Hydrochloric Acid", type: "SDS/MSDS", size: "520 KB", uploadedAt: "2024-09-02", status: "active", format: "PDF" },
  { id: "d11", name: "SDS — Caustic Soda Flakes", type: "SDS/MSDS", size: "490 KB", uploadedAt: "2024-09-02", status: "active", format: "PDF" },
  { id: "d12", name: "NDA — Aditya Chemicals", type: "Legal", size: "215 KB", uploadedAt: "2024-08-01", status: "active", format: "PDF" },
];

async function main() {
  for (const doc of MOCK_DOCS) {
    await prisma.document.upsert({
      where: { id: doc.id },
      update: {},
      create: {
        id: doc.id,
        name: doc.name,
        type: doc.type,
        size: doc.size,
        status: doc.status,
        format: doc.format,
        uploadedAt: new Date(doc.uploadedAt)
      }
    });
  }
  console.log('Seeded documents successfully');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
