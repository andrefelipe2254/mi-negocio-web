import { pgTable, text, serial, integer, boolean, timestamp, decimal } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  barcode: text("barcode"),
  purchasePrice: decimal("purchase_price", { precision: 10, scale: 2 }).notNull(),
  salePrice: decimal("sale_price", { precision: 10, scale: 2 }).notNull(),
  profitMargin: decimal("profit_margin", { precision: 5, scale: 2 }).notNull().default("20.00"),
  buyerName: text("buyer_name"),
  stock: integer("stock").default(0),
  minStock: integer("min_stock").default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const businessNews = pgTable("business_news", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  isPermanent: boolean("is_permanent").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  expiresAt: timestamp("expires_at"),
});

export const suppliers = pgTable("suppliers", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  contact: text("contact"),
  phone: text("phone"),
  email: text("email"),
  address: text("address"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const supplierProducts = pgTable("supplier_products", {
  id: serial("id").primaryKey(),
  supplierId: integer("supplier_id").references(() => suppliers.id).notNull(),
  productName: text("product_name").notNull(),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const settings = pgTable("settings", {
  id: serial("id").primaryKey(),
  defaultProfitMargin: decimal("default_profit_margin", { precision: 5, scale: 2 }).notNull().default("20.00"),
  enableStock: boolean("enable_stock").default(false).notNull(),
  enableBarcode: boolean("enable_barcode").default(false).notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
}).extend({
  username: z.string().min(1, "Username is required").refine(
    (val) => val === val.toUpperCase(),
    "Username must be in uppercase"
  ),
  password: z.string().min(8, "Password must be at least 8 characters").refine(
    (val) => /^[A-Z0-9]+$/.test(val),
    "Password must contain only uppercase letters and numbers"
  ),
});

export const insertProductSchema = createInsertSchema(products).pick({
  name: true,
  barcode: true,
  purchasePrice: true,
  profitMargin: true,
  buyerName: true,
  stock: true,
  minStock: true,
}).extend({
  name: z.string().min(1, "Product name is required").refine(
    (val) => val === val.toUpperCase(),
    "Product name must be in uppercase"
  ),
  barcode: z.string().optional(),
  purchasePrice: z.string().min(1, "Purchase price is required").refine(
    (val) => !isNaN(parseFloat(val)) && parseFloat(val) > 0,
    "Purchase price must be a positive number"
  ),
  profitMargin: z.string().optional(),
  buyerName: z.string().optional(),
  stock: z.number().optional(),
  minStock: z.number().optional(),
});

export const updateProductSchema = createInsertSchema(products).pick({
  name: true,
  barcode: true,
  purchasePrice: true,
  profitMargin: true,
  buyerName: true,
  stock: true,
  minStock: true,
}).extend({
  name: z.string().min(1, "Product name is required").refine(
    (val) => val === val.toUpperCase(),
    "Product name must be in uppercase"
  ),
  barcode: z.string().optional(),
  purchasePrice: z.string().min(1, "Purchase price is required").refine(
    (val) => !isNaN(parseFloat(val)) && parseFloat(val) > 0,
    "Purchase price must be a positive number"
  ),
  profitMargin: z.string().optional(),
  buyerName: z.string().optional(),
  stock: z.number().optional(),
  minStock: z.number().optional(),
});

export const insertBusinessNewsSchema = createInsertSchema(businessNews).pick({
  title: true,
  content: true,
  isPermanent: true,
});

export const insertSupplierSchema = createInsertSchema(suppliers).pick({
  name: true,
  contact: true,
  phone: true,
  email: true,
  address: true,
});

export const insertSupplierProductSchema = createInsertSchema(supplierProducts).pick({
  supplierId: true,
  productName: true,
  price: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertProduct = z.infer<typeof insertProductSchema>;
export type UpdateProduct = z.infer<typeof updateProductSchema>;
export type Product = typeof products.$inferSelect;
export type InsertBusinessNews = z.infer<typeof insertBusinessNewsSchema>;
export type BusinessNews = typeof businessNews.$inferSelect;
export type InsertSupplier = z.infer<typeof insertSupplierSchema>;
export type Supplier = typeof suppliers.$inferSelect;
export type InsertSupplierProduct = z.infer<typeof insertSupplierProductSchema>;
export type SupplierProduct = typeof supplierProducts.$inferSelect;
export type Settings = typeof settings.$inferSelect;
