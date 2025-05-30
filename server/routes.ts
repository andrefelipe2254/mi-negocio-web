import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth as authSetup } from "./auth";
import { insertProductSchema, updateProductSchema, insertBusinessNewsSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup authentication routes
  authSetup(app);

  // Products routes
  app.get("/api/products", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const products = await storage.getAllProducts();
      res.json(products);
    } catch (error) {
      console.error("Error fetching products:", error);
      res.status(500).json({ message: "Error fetching products" });
    }
  });

  app.get("/api/products/search", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const query = req.query.q as string;
      if (!query) {
        return res.json([]);
      }
      
      const products = await storage.searchProducts(query);
      res.json(products);
    } catch (error) {
      console.error("Error searching products:", error);
      res.status(500).json({ message: "Error searching products" });
    }
  });

  app.get("/api/products/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid product ID" });
      }
      
      const product = await storage.getProductById(id);
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      
      res.json(product);
    } catch (error) {
      console.error("Error fetching product:", error);
      res.status(500).json({ message: "Error fetching product" });
    }
  });

  app.post("/api/products", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const validatedData = insertProductSchema.parse(req.body);
      
      // Check for duplicate product name
      const existingProduct = await storage.getProductByName(validatedData.name);
      if (existingProduct) {
        return res.status(400).json({ message: "Product with this name already exists" });
      }
      
      const product = await storage.createProduct(validatedData);
      res.status(201).json(product);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Validation error", 
          errors: error.errors 
        });
      }
      console.error("Error creating product:", error);
      res.status(500).json({ message: "Error creating product" });
    }
  });

  app.put("/api/products/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid product ID" });
      }
      
      const validatedData = updateProductSchema.parse(req.body);
      
      // Check if product exists
      const existingProduct = await storage.getProductById(id);
      if (!existingProduct) {
        return res.status(404).json({ message: "Product not found" });
      }
      
      // Check for duplicate name (excluding current product)
      const duplicateProduct = await storage.getProductByName(validatedData.name);
      if (duplicateProduct && duplicateProduct.id !== id) {
        return res.status(400).json({ message: "Product with this name already exists" });
      }
      
      const product = await storage.updateProduct(id, validatedData);
      res.json(product);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Validation error", 
          errors: error.errors 
        });
      }
      console.error("Error updating product:", error);
      res.status(500).json({ message: "Error updating product" });
    }
  });

  app.delete("/api/products/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid product ID" });
      }
      
      const success = await storage.deleteProduct(id);
      if (!success) {
        return res.status(404).json({ message: "Product not found" });
      }
      
      res.sendStatus(204);
    } catch (error) {
      console.error("Error deleting product:", error);
      res.status(500).json({ message: "Error deleting product" });
    }
  });

  // Business News routes
  app.get("/api/business-news", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const news = await storage.getAllBusinessNews();
      res.json(news);
    } catch (error) {
      console.error("Error fetching business news:", error);
      res.status(500).json({ message: "Error fetching business news" });
    }
  });

  app.post("/api/business-news", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const validatedData = insertBusinessNewsSchema.parse(req.body);
      const news = await storage.createBusinessNews(validatedData);
      res.status(201).json(news);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Validation error", 
          errors: error.errors 
        });
      }
      console.error("Error creating business news:", error);
      res.status(500).json({ message: "Error creating business news" });
    }
  });

  app.delete("/api/business-news/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid news ID" });
      }
      
      const success = await storage.deleteBusinessNews(id);
      if (!success) {
        return res.status(404).json({ message: "News not found" });
      }
      
      res.sendStatus(204);
    } catch (error) {
      console.error("Error deleting business news:", error);
      res.status(500).json({ message: "Error deleting business news" });
    }
  });

  // Cleanup expired news endpoint
  app.post("/api/business-news/cleanup", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const deletedCount = await storage.deleteExpiredNews();
      res.json({ deletedCount });
    } catch (error) {
      console.error("Error cleaning up expired news:", error);
      res.status(500).json({ message: "Error cleaning up expired news" });
    }
  });

  // Dashboard stats
  app.get("/api/stats", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const products = await storage.getAllProducts();
      const news = await storage.getAllBusinessNews();
      
      res.json({
        totalProducts: products.length,
        activeNews: news.length,
        lastUpdate: products.length > 0 ? products[0].updatedAt : new Date(),
      });
    } catch (error) {
      console.error("Error fetching stats:", error);
      res.status(500).json({ message: "Error fetching stats" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
