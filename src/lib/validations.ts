import { z } from "zod";

// ─── Auth ────────────────────────────────────────────────────────────────────

export const loginSchema = z.object({
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  role: z.enum(["buyer", "supplier"], { required_error: "Please select a role" }),
});

export const registerSchema = z.object({
  businessName: z.string().min(2, "Business name is required"),
  contactName: z.string().min(2, "Contact name is required"),
  email: z.string().email("Please enter a valid email"),
  mobile: z
    .string()
    .regex(/^[6-9]\d{9}$/, "Please enter a valid 10-digit mobile number"),
  gstin: z.string().min(1, "GSTIN is required"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string(),
  role: z.enum(["buyer", "supplier"]),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

export const otpSchema = z.object({
  otp: z.string().length(6, "OTP must be 6 digits"),
});

// ─── KYC ────────────────────────────────────────────────────────────────────

export const kycStep1Schema = z.object({
  businessName: z.string().min(2),
  businessType: z.enum(["pvt_ltd", "llp", "partnership", "proprietorship", "public_ltd"]),
  incorporationDate: z.string().min(1, "Required"),
  registeredAddress: z.string().min(5),
  operatingAddress: z.string().optional(),
  website: z.string().optional(),
  annualTurnover: z.string().min(1, "Required"),
});

export const kycStep2Schema = z.object({
  gstin: z.string().min(1, "GSTIN is required"),
  panNumber: z.string().min(1, "PAN is required"),
  gstRegistrationDate: z.string().min(1, "Required"),
  gstType: z.enum(["regular", "composition", "sez"]),
  bankAccountNumber: z.string().min(9, "Invalid account number"),
  ifscCode: z.string().min(1, "IFSC is required"),
  bankName: z.string().min(2),
});

// ─── RFQ ─────────────────────────────────────────────────────────────────────

export const rfqSchema = z.object({
  productName: z.string().min(2, "Product name is required"),
  casNumber: z.string().optional(),
  quantity: z.number().positive("Quantity must be positive"),
  quantityUnit: z.enum(["kg", "mt", "litre", "drum", "bag"]),
  grade: z.string().min(1, "Grade is required"),
  deliveryDate: z.string().min(1, "Delivery date is required"),
  deliveryLocation: z.string().min(2, "Delivery location is required"),
  paymentTerms: z.enum(["advance", "net_30", "net_60", "lc", "cad"]),
  targetPrice: z.number().optional(),
  notes: z.string().optional(),
  expiryDays: z.number().int().min(1).max(30),
  dispatchMethod: z.enum(["auto", "shortlist"]),
});

// ─── Quote ───────────────────────────────────────────────────────────────────

export const quoteSchema = z.object({
  price: z.number().positive("Price must be positive"),
  quantity: z.number().positive("Quantity must be positive"),
  leadTimeDays: z.number().int().positive("Lead time must be positive"),
  paymentTerms: z.string().min(1, "Required"),
  logisticsTerms: z.enum(["ex_works", "fob", "cif", "door_delivery"]),
  validityDays: z.number().int().min(7).max(90),
  notes: z.string().optional(),
});

// ─── Product Listing (Supplier) ──────────────────────────────────────────────

export const productListingSchema = z.object({
  name: z.string().min(2, "Product name is required"),
  casNumber: z.string().optional(),
  hsnCode: z.string().min(4, "HSN code is required"),
  grade: z.string().min(1, "Grade is required"),
  moq: z.number().positive("MOQ must be positive"),
  moqUnit: z.enum(["kg", "mt", "litre", "drum", "bag"]),
  price: z.number().positive("Price must be positive"),
  priceUnit: z.string().min(1, "Required"),
  quantity: z.number().positive("Available quantity must be positive"),
  leadTimeDays: z.number().int().positive("Lead time must be positive"),
  description: z.string().optional(),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type OtpInput = z.infer<typeof otpSchema>;
export type KycStep1Input = z.infer<typeof kycStep1Schema>;
export type KycStep2Input = z.infer<typeof kycStep2Schema>;
export type RFQInput = z.infer<typeof rfqSchema>;
export type QuoteInput = z.infer<typeof quoteSchema>;
export type ProductListingInput = z.infer<typeof productListingSchema>;
