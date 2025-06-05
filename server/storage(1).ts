import { type User, type InsertUser, type Product, type InsertProduct, type UpdateProduct, type BusinessNews, type InsertBusinessNews } from "@shared/schema";
import session from "express-session";
import createMemoryStore from "memorystore";

const MemoryStore = createMemoryStore(session);

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
  
  sessionStore: session.Store;
}

export class MemStorage implements IStorage {
  sessionStore: session.Store;
  private users: User[] = [];
  private products: Product[] = [];
  private businessNews: BusinessNews[] = [];
  private nextUserId = 1;
  private nextProductId = 1;
  private nextNewsId = 1;

  constructor() {
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000, // 24 hours
    });
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.find(user => user.id === id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return this.users.find(user => user.username === username);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const user: User = {
      id: this.nextUserId++,
      username: insertUser.username,
      password: insertUser.password,
    };
    this.users.push(user);
    return user;
  }

  // Products
  async getAllProducts(): Promise<Product[]> {
    return [...this.products].sort((a, b) => a.name.localeCompare(b.name));
  }

  async getProductById(id: number): Promise<Product | undefined> {
    return this.products.find(product => product.id === id);
  }

  async getProductByName(name: string): Promise<Product | undefined> {
    return this.products.find(product => product.name === name);
  }

  async searchProducts(query: string): Promise<Product[]> {
    const filtered = this.products.filter(product =>
      product.name.includes(query.toUpperCase())
    );
    return filtered.sort((a, b) => a.name.localeCompare(b.name)).slice(0, 10);
  }

  async createProduct(insertProduct: InsertProduct): Promise<Product> {
    const purchasePrice = parseFloat(insertProduct.purchasePrice);
    const profitMargin = insertProduct.profitMargin ? parseFloat(insertProduct.profitMargin) : 20;
    const salePrice = (purchasePrice * (1 + profitMargin / 100)).toFixed(2);
    const now = new Date();
    
    const product: Product = {
      id: this.nextProductId++,
      name: insertProduct.name,
      barcode: insertProduct.barcode || null,
      purchasePrice: insertProduct.purchasePrice,
      salePrice: salePrice,
      profitMargin: profitMargin.toString(),
      buyerName: insertProduct.buyerName || null,
      stock: insertProduct.stock || null,
      minStock: insertProduct.minStock || null,
      createdAt: now,
      updatedAt: now,
    };
    
    this.products.push(product);
    return product;
  }

  async updateProduct(id: number, updateProduct: UpdateProduct): Promise<Product | undefined> {
    const index = this.products.findIndex(product => product.id === id);
    if (index === -1) return undefined;
    
    const purchasePrice = parseFloat(updateProduct.purchasePrice);
    const profitMargin = updateProduct.profitMargin ? parseFloat(updateProduct.profitMargin) : parseFloat(this.products[index].profitMargin);
    const salePrice = (purchasePrice * (1 + profitMargin / 100)).toFixed(2);
    
    this.products[index] = {
      ...this.products[index],
      name: updateProduct.name,
      barcode: updateProduct.barcode || this.products[index].barcode,
      purchasePrice: updateProduct.purchasePrice,
      salePrice: salePrice,
      profitMargin: profitMargin.toString(),
      buyerName: updateProduct.buyerName || this.products[index].buyerName,
      stock: updateProduct.stock !== undefined ? updateProduct.stock : this.products[index].stock,
      minStock: updateProduct.minStock !== undefined ? updateProduct.minStock : this.products[index].minStock,
      updatedAt: new Date(),
    };
    
    return this.products[index];
  }

  async deleteProduct(id: number): Promise<boolean> {
    const index = this.products.findIndex(product => product.id === id);
    if (index === -1) return false;
    
    this.products.splice(index, 1);
    return true;
  }

  // Business News
  async getAllBusinessNews(): Promise<BusinessNews[]> {
    const now = new Date();
    return this.businessNews
      .filter(news => news.isPermanent || (news.expiresAt && new Date(news.expiresAt) > now))
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  }

  async createBusinessNews(insertNews: InsertBusinessNews): Promise<BusinessNews> {
    const now = new Date();
    let expiresAt = null;
    
    if (!insertNews.isPermanent) {
      expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 3); // Expires in 3 days
    }
    
    const news: BusinessNews = {
      id: this.nextNewsId++,
      title: insertNews.title,
      content: insertNews.content,
      isPermanent: insertNews.isPermanent || false,
      createdAt: now,
      expiresAt: expiresAt,
    };
    
    this.businessNews.push(news);
    return news;
  }

  async deleteBusinessNews(id: number): Promise<boolean> {
    const index = this.businessNews.findIndex(news => news.id === id);
    if (index === -1) return false;
    
    this.businessNews.splice(index, 1);
    return true;
  }

  async deleteExpiredNews(): Promise<number> {
    const now = new Date();
    const initialLength = this.businessNews.length;
    
    this.businessNews = this.businessNews.filter(news => new Date(news.expiresAt) > now);
    
    return initialLength - this.businessNews.length;
  }
}

export const storage = new MemStorage();
