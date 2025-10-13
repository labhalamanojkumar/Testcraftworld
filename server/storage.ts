import { type User, type InsertUser, type Category, type InsertCategory, type Article, type InsertArticle } from "@shared/schema";
import { randomUUID } from "crypto";
import { db } from "./db";
import { users, categories, articles } from "../shared/schema";
import { eq, and } from "drizzle-orm";

// modify the interface with any CRUD methods
// you might need

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, user: Partial<InsertUser>): Promise<User | undefined>;
  getCategories(): Promise<Category[]>;
  getCategory(id: string): Promise<Category | undefined>;
  createCategory(category: InsertCategory): Promise<Category>;
  getArticles(): Promise<Article[]>;
  getArticle(id: string): Promise<Article | undefined>;
  getArticlesByCategory(categoryId: string): Promise<Article[]>;
  getArticlesByAuthor(authorId: string): Promise<Article[]>;
  createArticle(article: InsertArticle): Promise<Article>;
  updateArticle(id: string, article: Partial<InsertArticle>): Promise<Article | undefined>;
  deleteArticle(id: string): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private categories: Map<string, Category>;
  private articles: Map<string, Article>;

  constructor() {
    this.users = new Map();
    this.categories = new Map();
    this.articles = new Map();
    // Seed some data
    this.seedData();
  }

  private seedData() {
    // Create super admin
    const adminId = randomUUID();
    this.users.set(adminId, {
      id: adminId,
      username: process.env.SUPER_ADMIN_USERNAME || "superadmin",
      email: "admin@testcraft.world",
      password: process.env.SUPER_ADMIN_PASSWORD || "password",
      name: "Super Admin",
      bio: "Platform administrator",
      avatar: null,
      role: "admin",
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // Create categories
    const categoriesData = [
      { name: "Business", slug: "business", description: "Business articles" },
      { name: "Design", slug: "design", description: "Design articles" },
      { name: "Technology", slug: "technology", description: "Technology articles" },
      { name: "Lifestyle", slug: "lifestyle", description: "Lifestyle articles" },
      { name: "Latest News", slug: "latest-news", description: "Latest news" },
      { name: "Marketing", slug: "marketing", description: "Marketing articles" },
      { name: "News", slug: "news", description: "News articles" },
      { name: "Others", slug: "others", description: "Other articles" },
    ];

    categoriesData.forEach((cat) => {
      const id = randomUUID();
      this.categories.set(id, { id, ...cat });
    });
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = {
      ...insertUser,
      id,
      bio: insertUser.bio ?? null,
      avatar: insertUser.avatar ?? null,
      role: insertUser.role ?? "user",
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.users.set(id, user);
    return user;
  }

  async getCategories(): Promise<Category[]> {
    return Array.from(this.categories.values());
  }

  async getCategory(id: string): Promise<Category | undefined> {
    return this.categories.get(id);
  }

  async createCategory(insertCategory: InsertCategory): Promise<Category> {
    const id = randomUUID();
    const category: Category = { id, name: insertCategory.name, slug: insertCategory.slug, description: insertCategory.description ?? null };
    this.categories.set(id, category);
    return category;
  }

  async getArticles(): Promise<Article[]> {
    return Array.from(this.articles.values()).filter(a => a.published);
  }

  async getArticle(id: string): Promise<Article | undefined> {
    return this.articles.get(id);
  }

  async getArticlesByCategory(categoryId: string): Promise<Article[]> {
    return Array.from(this.articles.values()).filter(a => a.categoryId === categoryId && a.published);
  }

  async createArticle(insertArticle: InsertArticle): Promise<Article> {
    const id = randomUUID();
    const article: Article = { 
      ...insertArticle, 
      id, 
      createdAt: new Date(), 
      updatedAt: new Date(),
      excerpt: insertArticle.excerpt ?? null,
      tags: insertArticle.tags ?? null,
      metaTitle: insertArticle.metaTitle ?? null,
      metaDescription: insertArticle.metaDescription ?? null,
      categoryId: insertArticle.categoryId ?? null,
      authorId: insertArticle.authorId ?? null,
      published: insertArticle.published ?? false,
    };
    this.articles.set(id, article);
    return article;
  }

  async updateArticle(id: string, update: Partial<InsertArticle>): Promise<Article | undefined> {
    const article = this.articles.get(id);
    if (!article) return undefined;
    const updated = { ...article, ...update, updatedAt: new Date() };
    this.articles.set(id, updated);
    return updated;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.email === email);
  }

  async updateUser(id: string, updates: Partial<InsertUser>): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;

    const updatedUser: User = {
      ...user,
      ...updates,
      updatedAt: new Date(),
    };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  async getArticlesByAuthor(authorId: string): Promise<Article[]> {
    return Array.from(this.articles.values()).filter(article => article.authorId === authorId);
  }

  async deleteArticle(id: string): Promise<boolean> {
    return this.articles.delete(id);
  }
}

export class DbStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
    return result[0];
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.username, username)).limit(1);
    return result[0];
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.email, email)).limit(1);
    return result[0];
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = {
      ...insertUser,
      id,
      bio: insertUser.bio ?? null,
      avatar: insertUser.avatar ?? null,
      role: insertUser.role ?? "user",
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await db.insert(users).values(user);
    return user;
  }

  async updateUser(id: string, updates: Partial<InsertUser>): Promise<User | undefined> {
    await db
      .update(users)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(users.id, id));

    return await this.getUser(id);
  }

  async getCategories(): Promise<Category[]> {
    return await db.select().from(categories);
  }

  async getCategory(id: string): Promise<Category | undefined> {
    const result = await db.select().from(categories).where(eq(categories.id, id)).limit(1);
    return result[0];
  }

  async createCategory(insertCategory: InsertCategory): Promise<Category> {
    const id = randomUUID();
    const category: Category = {
      id,
      name: insertCategory.name,
      slug: insertCategory.slug,
      description: insertCategory.description ?? null,
    };

    await db.insert(categories).values(category);
    return category;
  }

  async getArticles(): Promise<Article[]> {
    return await db.select().from(articles).where(eq(articles.published, true));
  }

  async getArticle(id: string): Promise<Article | undefined> {
    const result = await db.select().from(articles).where(eq(articles.id, id)).limit(1);
    return result[0];
  }

  async getArticlesByCategory(categoryId: string): Promise<Article[]> {
    return await db
      .select()
      .from(articles)
      .where(and(eq(articles.categoryId, categoryId), eq(articles.published, true)));
  }

  async getArticlesByAuthor(authorId: string): Promise<Article[]> {
    return await db.select().from(articles).where(eq(articles.authorId, authorId));
  }

  async createArticle(insertArticle: InsertArticle): Promise<Article> {
    const id = randomUUID();
    const article: Article = {
      ...insertArticle,
      id,
      createdAt: new Date(),
      updatedAt: new Date(),
      excerpt: insertArticle.excerpt ?? null,
      tags: insertArticle.tags ?? null,
      metaTitle: insertArticle.metaTitle ?? null,
      metaDescription: insertArticle.metaDescription ?? null,
      categoryId: insertArticle.categoryId ?? null,
      authorId: insertArticle.authorId ?? null,
      published: insertArticle.published ?? false,
    };

    await db.insert(articles).values(article);
    return article;
  }

  async updateArticle(id: string, update: Partial<InsertArticle>): Promise<Article | undefined> {
    await db
      .update(articles)
      .set({ ...update, updatedAt: new Date() })
      .where(eq(articles.id, id));

    return await this.getArticle(id);
  }

  async deleteArticle(id: string): Promise<boolean> {
    try {
      await db.delete(articles).where(eq(articles.id, id));
      return true;
    } catch (error) {
      return false;
    }
  }
}

export const storage = new DbStorage();
