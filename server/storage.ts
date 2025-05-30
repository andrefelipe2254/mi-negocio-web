import { users, products, businessNews, type User, type InsertUser, type Product, type InsertProduct, type UpdateProduct, type BusinessNews, type InsertBusinessNews } from "@shared/schema";
import { db } from "./db";
import { eq, asc, like, lt } from "drizzle-orm";
import session from "express-session";
import connectPg from "connect-pg-simple";
import { pool } from "./db";

const PostgresSessionStore = connectPg(session);

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Products
  getAllProducts(): Promise<Product[]>;
  getProductById(id: number): Promise<Product | undefined>;
  getProductByName(name: string): Promise<Product | undefined>;
  searchProducts(query: string): Promise<Product[]>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProduct(id: number, product: UpdateProduct): Promise<Product | undefined>;
  deleteProduct(id: number): Promise<boolean>;
  
  // Business News
  getAllBusinessNews(): Promise<BusinessNews[]>;
  createBusinessNews(news: InsertBusinessNews): Promise<BusinessNews>;
  deleteBusinessNews(id: number): Promise<boolean>;
  deleteExpiredNews(): Promise<number>;
  
  sessionStore: session.SessionStore;
}

export class DatabaseStorage implements IStorage {
  sessionStore: session.SessionStore;

  constructor() {
    this.sessionStore = new PostgresSessionStore({ 
      pool, 
      createTableIfMissing: true 
    });
  }

  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  // Products
  async getAllProducts(): Promise<Product[]> {
    return await db.select().from(products).orderBy(asc(products.name));
  }

  async getProductById(id: number): Promise<Product | undefined> {
    const [product] = await db.select().from(products).where(eq(products.id, id));
    return product || undefined;
  }

  async getProductByName(name: string): Promise<Product | undefined> {
    const [product] = await db.select().from(products).where(eq(products.name, name));
    return product || undefined;
  }

  async searchProducts(query: string): Promise<Product[]> {
    return await db.select().from(products)
      .where(like(products.name, `%${query.toUpperCase()}%`))
      .orderBy(asc(products.name))
      .limit(10);
  }

  async createProduct(insertProduct: InsertProduct): Promise<Product> {
    const purchasePrice = parseFloat(insertProduct.purchasePrice);
    const salePrice = (purchasePrice * 1.2).toFixed(2);
    
    const [product] = await db
      .insert(products)
      .values({
        name: insertProduct.name,
        purchasePrice: insertProduct.purchasePrice,
        salePrice: salePrice,
        updatedAt: new Date(),
      })
      .returning();
    return product;
  }

  async updateProduct(id: number, updateProduct: UpdateProduct): Promise<Product | undefined> {
    const purchasePrice = parseFloat(updateProduct.purchasePrice);
    const salePrice = (purchasePrice * 1.2).toFixed(2);
    
    const [product] = await db
      .update(products)
      .set({
        name: updateProduct.name,
        purchasePrice: updateProduct.purchasePrice,
        salePrice: salePrice,
        updatedAt: new Date(),
      })
      .where(eq(products.id, id))
      .returning();
    return product || undefined;
  }

  async deleteProduct(id: number): Promise<boolean> {
    const result = await db.delete(products).where(eq(products.id, id));
    return result.rowCount > 0;
  }

  // Business News
  async getAllBusinessNews(): Promise<BusinessNews[]> {
    // Only return non-expired news
    return await db.select().from(businessNews)
      .where(lt(new Date(), businessNews.expiresAt))
      .orderBy(asc(businessNews.createdAt));
  }

  async createBusinessNews(insertNews: InsertBusinessNews): Promise<BusinessNews> {
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 3); // Expires in 3 days
    
    const [news] = await db
      .insert(businessNews)
      .values({
        ...insertNews,
        expiresAt,
      })
      .returning();
    return news;
  }

  async deleteBusinessNews(id: number): Promise<boolean> {
    const result = await db.delete(businessNews).where(eq(businessNews.id, id));
    return result.rowCount > 0;
  }

  async deleteExpiredNews(): Promise<number> {
    const result = await db.delete(businessNews)
      .where(lt(businessNews.expiresAt, new Date()));
    return result.rowCount;
  }
}

export const storage = new DatabaseStorage();
