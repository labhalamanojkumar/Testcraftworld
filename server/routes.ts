import type { Express } from "express";
import { createServer, type Server } from "http";
import { createRequire } from "module";
import { storage } from "./storage";
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import session from "express-session";
import { pool } from "./db";

const require = createRequire(import.meta.url);
const MySQLStore = require('express-mysql-session')(session);

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);

  // Setup session
  app.use(session({
    secret: process.env.SESSION_SECRET || 'secret',
    resave: false,
    saveUninitialized: false,
    store: new MySQLStore({
      connection: pool,
      clearExpired: true,
      checkExpirationInterval: 900000, // 15 minutes
      expiration: 86400000, // 1 day
    }),
  }));

  // Setup passport
  passport.use(new LocalStrategy(async (username, password, done) => {
    const user = await storage.getUserByUsername(username);
    if (!user || user.password !== password) { // In real app, hash check
      return done(null, false);
    }
    return done(null, user);
  }));

  passport.serializeUser((user: any, done) => done(null, user.id));
  passport.deserializeUser(async (id: string, done) => {
    const user = await storage.getUser(id);
    done(null, user);
  });

  app.use(passport.initialize());
  app.use(passport.session());

  // Auth routes
  app.post("/api/auth/login", passport.authenticate("local"), (req, res) => {
    res.json({ user: req.user });
  });

  app.post("/api/auth/register", async (req, res) => {
    try {
      const { username, email, password, name, bio } = req.body;

      // Check if user already exists
      const existingUser = await storage.getUserByUsername(username) || await storage.getUserByEmail(email);
      if (existingUser) {
        return res.status(400).json({ message: "Username or email already exists" });
      }

      // Create new user
      const user = await storage.createUser({
        username,
        email,
        password, // In production, hash the password
        name,
        bio: bio || null,
      });

      // Log the user in after registration
      req.login(user, (err) => {
        if (err) {
          return res.status(500).json({ message: "Registration successful but login failed" });
        }
        res.json({ user });
      });
    } catch (error) {
      console.error("Registration error:", error);
      res.status(500).json({ message: "Registration failed" });
    }
  });

  app.post("/api/logout", (req, res) => {
    req.logout(() => res.json({ success: true }));
  });

  app.get("/api/me", (req, res) => {
    res.json({ user: req.user });
  });

  // User profile update
  app.put("/api/users/:id", async (req, res) => {
    if (!req.user) return res.status(401).json({ error: "Unauthorized" });

    // Only allow users to update their own profile
    if ((req.user as any).id !== req.params.id) {
      return res.status(403).json({ error: "Forbidden" });
    }

    try {
      const updatedUser = await storage.updateUser(req.params.id, req.body);
      if (!updatedUser) return res.status(404).json({ error: "User not found" });
      res.json(updatedUser);
    } catch (error) {
      console.error("User update error:", error);
      res.status(500).json({ error: "Failed to update user" });
    }
  });

  // Categories routes
  app.get("/api/categories", async (req, res) => {
    const categories = await storage.getCategories();
    res.json(categories);
  });

  app.get("/api/categories/slug/:slug", async (req, res) => {
    const categories = await storage.getCategories();
    const category = categories.find(c => c.slug === req.params.slug);
    if (!category) return res.status(404).json({ error: "Category not found" });
    res.json(category);
  });

  app.get("/api/articles/slug/:slug", async (req, res) => {
    const articles = await storage.getArticles();
    const article = articles.find(a => a.slug === req.params.slug);
    if (!article) return res.status(404).json({ error: "Article not found" });
    res.json(article);
  });

  app.post("/api/categories", async (req, res) => {
    if (!req.user) return res.status(401).json({ error: "Unauthorized" });
    const category = await storage.createCategory(req.body);
    res.json(category);
  });

  // Articles routes
  app.get("/api/articles", async (req, res) => {
    const articles = await storage.getArticles();
    res.json(articles);
  });

  app.get("/api/articles/:id", async (req, res) => {
    const article = await storage.getArticle(req.params.id);
    if (!article) return res.status(404).json({ error: "Article not found" });
    res.json(article);
  });

  app.get("/api/categories/:categoryId/articles", async (req, res) => {
    const articles = await storage.getArticlesByCategory(req.params.categoryId);
    res.json(articles);
  });

  app.post("/api/articles", async (req, res) => {
    if (!req.user) return res.status(401).json({ error: "Unauthorized" });
    const article = await storage.createArticle({ ...req.body, authorId: (req.user as any).id });
    res.json(article);
  });

  app.put("/api/articles/:id", async (req, res) => {
    if (!req.user) return res.status(401).json({ error: "Unauthorized" });
    const article = await storage.updateArticle(req.params.id, req.body);
    if (!article) return res.status(404).json({ error: "Article not found" });
    res.json(article);
  });

  app.delete("/api/articles/:id", async (req, res) => {
    if (!req.user) return res.status(401).json({ error: "Unauthorized" });
    const deleted = await storage.deleteArticle(req.params.id);
    res.json({ success: deleted });
  });

  // Contact form endpoint
  app.post("/api/contact", async (req, res) => {
    try {
      const { name, email, subject, category, message } = req.body;

      // Basic validation
      if (!name || !email || !subject || !category || !message) {
        return res.status(400).json({ error: "All fields are required" });
      }

      // Email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({ error: "Invalid email format" });
      }

      // In a real application, you would send an email here
      // For now, we'll just log the contact form submission
      console.log("Contact form submission:", {
        name,
        email,
        subject,
        category,
        message,
        timestamp: new Date().toISOString(),
      });

      // Simulate email sending (in production, integrate with email service)
      // You could use services like SendGrid, Mailgun, or AWS SES

      res.json({
        success: true,
        message: "Contact form submitted successfully. We'll get back to you soon!",
      });
    } catch (error) {
      console.error("Contact form error:", error);
      res.status(500).json({ error: "Failed to process contact form" });
    }
  });

  return httpServer;
}
