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
  purchasePrice: decimal("purchase_price", { precision: 10, scale: 2 }).notNull(),
  salePrice: decimal("sale_price", { precision: 10, scale: 2 }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const businessNews = pgTable("business_news", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  expiresAt: timestamp("expires_at").notNull(),
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
  purchasePrice: true,
}).extend({
  name: z.string().min(1, "Product name is required").refine(
    (val) => val === val.toUpperCase(),
    "Product name must be in uppercase"
  ),
  purchasePrice: z.string().min(1, "Purchase price is required").refine(
    (val) => !isNaN(parseFloat(val)) && parseFloat(val) > 0,
    "Purchase price must be a positive number"
  ),
});

export const updateProductSchema = createInsertSchema(products).pick({
  name: true,
  purchasePrice: true,
}).extend({
  name: z.string().min(1, "Product name is required").refine(
    (val) => val === val.toUpperCase(),
    "Product name must be in uppercase"
  ),
  purchasePrice: z.string().min(1, "Purchase price is required").refine(
    (val) => !isNaN(parseFloat(val)) && parseFloat(val) > 0,
    "Purchase price must be a positive number"
  ),
});

export const insertBusinessNewsSchema = createInsertSchema(businessNews).pick({
  title: true,
  content: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertProduct = z.infer<typeof insertProductSchema>;
export type UpdateProduct = z.infer<typeof updateProductSchema>;
export type Product = typeof products.$inferSelect;
export type InsertBusinessNews = z.infer<typeof insertBusinessNewsSchema>;
export type BusinessNews = typeof businessNews.$inferSelect;
