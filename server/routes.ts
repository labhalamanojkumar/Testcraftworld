import type { Express } from "express";
import express from "express";
import { createServer, type Server } from "http";
import { createRequire } from "module";
import { storage } from "./storage";
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import session from "express-session";
import { pool } from "./db";
import multer from "multer";
import path from "path";
import fs from "fs";

const require = createRequire(import.meta.url);
const MySQLStore = require('connect-mysql-session')(session);

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);

  // Setup multer for file uploads
  const upload = multer({
    dest: 'uploads/',
    limits: {
      fileSize: 5 * 1024 * 1024, // 5MB limit
    },
    fileFilter: (req, file, cb) => {
      // Allow only image files
      if (file.mimetype.startsWith('image/')) {
        cb(null, true);
      } else {
        cb(new Error('Only image files are allowed'));
      }
    },
  });

  // Create uploads directory if it doesn't exist
  if (!fs.existsSync('uploads')) {
    fs.mkdirSync('uploads');
  }

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
    
    try {
      const { title, content, categoryId, authorId, tags, slug, metaTitle, metaDescription, focusKeyword, published = false } = req.body;

      // Basic validation
      if (!title?.trim() || !content?.trim()) {
        return res.status(400).json({ error: "Title and content are required" });
      }

      // Generate slug if not provided
      const finalSlug = slug?.trim() || title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

      const articleData = {
        title: title.trim(),
        content: content.trim(),
        categoryId: categoryId || null,
        authorId: (req.user as any).id,
        tags: tags ? JSON.stringify(tags) : null,
        slug: finalSlug,
        metaTitle: metaTitle?.trim() || null,
        metaDescription: metaDescription?.trim() || null,
        published: Boolean(published),
      };

      const article = await storage.createArticle(articleData);
      res.json(article);
    } catch (error) {
      console.error("Create article error:", error);
      res.status(500).json({ error: "Failed to create article" });
    }
  });

  app.put("/api/articles/:id", async (req, res) => {
    if (!req.user) return res.status(401).json({ error: "Unauthorized" });
    
    try {
      const { title, content, categoryId, tags, slug, metaTitle, metaDescription, focusKeyword, published = false } = req.body;

      // Check if article exists and user owns it
      const existingArticle = await storage.getArticle(req.params.id);
      if (!existingArticle) {
        return res.status(404).json({ error: "Article not found" });
      }

      if (existingArticle.authorId !== (req.user as any).id) {
        return res.status(403).json({ error: "Forbidden" });
      }

      // Generate slug if not provided
      const finalSlug = slug?.trim() || (title ? title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') : existingArticle.slug);

      const updateData = {
        title: title?.trim() || existingArticle.title,
        content: content?.trim() || existingArticle.content,
        categoryId: categoryId || existingArticle.categoryId,
        tags: tags ? JSON.stringify(tags) : existingArticle.tags,
        slug: finalSlug,
        metaTitle: metaTitle?.trim() || existingArticle.metaTitle,
        metaDescription: metaDescription?.trim() || existingArticle.metaDescription,
        published: Boolean(published),
      };

      const article = await storage.updateArticle(req.params.id, updateData);
      if (!article) return res.status(404).json({ error: "Article not found" });
      res.json(article);
    } catch (error) {
      console.error("Update article error:", error);
      res.status(500).json({ error: "Failed to update article" });
    }
  });

  app.delete("/api/articles/:id", async (req, res) => {
    if (!req.user) return res.status(401).json({ error: "Unauthorized" });
    const deleted = await storage.deleteArticle(req.params.id);
    res.json({ success: deleted });
  });

  // Get user's drafts
  app.get("/api/drafts", async (req, res) => {
    if (!req.user) return res.status(401).json({ error: "Unauthorized" });
    const drafts = await storage.getArticlesByAuthor((req.user as any).id);
    // Filter to only return unpublished articles (drafts)
    const userDrafts = drafts.filter(article => !article.published);
    res.json(userDrafts);
  });

  // Image upload endpoint
  app.post("/api/upload", upload.single('image'), async (req, res) => {
    if (!req.user) return res.status(401).json({ error: "Unauthorized" });

    try {
      if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
      }

      // Generate unique filename
      const ext = path.extname(req.file.originalname);
      const filename = `${Date.now()}-${Math.random().toString(36).substring(2)}${ext}`;
      const filepath = path.join('uploads', filename);

      // Move file to final location
      fs.renameSync(req.file.path, filepath);

      // Return the URL for the uploaded image
      const imageUrl = `/uploads/${filename}`;
      res.json({ url: imageUrl });
    } catch (error) {
      console.error("Upload error:", error);
      res.status(500).json({ error: "Failed to upload image" });
    }
  });

  // Serve uploaded images
  app.use('/uploads', express.static('uploads'));

  // Health check endpoint for deployment platforms
  app.get('/health', (req, res) => {
    res.status(200).json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      service: 'BlogStreamPro',
      version: '1.0.0'
    });
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
