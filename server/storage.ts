import { type User, type InsertUser, type Category, type InsertCategory, type Article, type InsertArticle } from "@shared/schema";
import { randomUUID } from "crypto";
import { db } from "./db";
import { users, categories, articles } from "../shared/schema";
import { eq, and, sql } from "drizzle-orm";

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
  incrementArticleViews(id: string): Promise<boolean>;
  incrementCategoryViews(id: string): Promise<boolean>;
  getAnalytics(): Promise<{
    totalArticles: number;
    totalPublishedArticles: number;
    totalCategories: number;
    totalViews: number;
    topArticles: Array<{ id: string; title: string; viewCount: number; slug: string }>;
    topCategories: Array<{ id: string; name: string; viewCount: number; slug: string }>;
  }>;
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
      this.categories.set(id, { id, ...cat, viewCount: 0 });
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
    const category: Category = { 
      id, 
      name: insertCategory.name, 
      slug: insertCategory.slug, 
      description: insertCategory.description ?? null,
      viewCount: insertCategory.viewCount ?? 0
    };
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
      viewCount: insertArticle.viewCount ?? 0,
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

  async incrementArticleViews(id: string): Promise<boolean> {
    const article = this.articles.get(id);
    if (!article) return false;
    article.viewCount = (article.viewCount || 0) + 1;
    this.articles.set(id, article);
    return true;
  }

  async incrementCategoryViews(id: string): Promise<boolean> {
    const category = this.categories.get(id);
    if (!category) return false;
    category.viewCount = (category.viewCount || 0) + 1;
    this.categories.set(id, category);
    return true;
  }

  async getAnalytics(): Promise<{
    totalArticles: number;
    totalPublishedArticles: number;
    totalCategories: number;
    totalViews: number;
    topArticles: Array<{ id: string; title: string; viewCount: number; slug: string }>;
    topCategories: Array<{ id: string; name: string; viewCount: number; slug: string }>;
  }> {
    const allArticles = Array.from(this.articles.values());
    const allCategories = Array.from(this.categories.values());

    const publishedArticles = allArticles.filter(a => a.published);
    const totalViews = allArticles.reduce((sum, a) => sum + (a.viewCount || 0), 0) +
                      allCategories.reduce((sum, c) => sum + (c.viewCount || 0), 0);

    const topArticles = publishedArticles
      .sort((a, b) => (b.viewCount || 0) - (a.viewCount || 0))
      .slice(0, 10)
      .map(a => ({ id: a.id, title: a.title, viewCount: a.viewCount || 0, slug: a.slug }));

    const topCategories = allCategories
      .sort((a, b) => (b.viewCount || 0) - (a.viewCount || 0))
      .slice(0, 10)
      .map(c => ({ id: c.id, name: c.name, viewCount: c.viewCount || 0, slug: c.slug }));

    return {
      totalArticles: allArticles.length,
      totalPublishedArticles: publishedArticles.length,
      totalCategories: allCategories.length,
      totalViews,
      topArticles,
      topCategories,
    };
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
      viewCount: insertCategory.viewCount ?? 0,
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
      viewCount: insertArticle.viewCount ?? 0,
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

  async incrementArticleViews(id: string): Promise<boolean> {
    try {
      await db
        .update(articles)
        .set({ viewCount: sql`${articles.viewCount} + 1` })
        .where(eq(articles.id, id));
      return true;
    } catch (error) {
      return false;
    }
  }

  async incrementCategoryViews(id: string): Promise<boolean> {
    try {
      await db
        .update(categories)
        .set({ viewCount: sql`${categories.viewCount} + 1` })
        .where(eq(categories.id, id));
      return true;
    } catch (error) {
      return false;
    }
  }

  async getAnalytics(): Promise<{
    totalArticles: number;
    totalPublishedArticles: number;
    totalCategories: number;
    totalViews: number;
    topArticles: Array<{ id: string; title: string; viewCount: number; slug: string }>;
    topCategories: Array<{ id: string; name: string; viewCount: number; slug: string }>;
  }> {
    // Get total counts
    const [articleCounts] = await db
      .select({
        total: sql<number>`count(*)`,
        published: sql<number>`sum(case when ${articles.published} = 1 then 1 else 0 end)`,
        totalViews: sql<number>`coalesce(sum(${articles.viewCount}), 0)`,
      })
      .from(articles);

    const [categoryCounts] = await db
      .select({
        total: sql<number>`count(*)`,
        totalViews: sql<number>`coalesce(sum(${categories.viewCount}), 0)`,
      })
      .from(categories);

    // Get top articles
    const topArticlesResult = await db
      .select({
        id: articles.id,
        title: articles.title,
        viewCount: articles.viewCount,
        slug: articles.slug,
      })
      .from(articles)
      .where(eq(articles.published, true))
      .orderBy(sql`${articles.viewCount} desc`)
      .limit(10);

    // Get top categories
    const topCategoriesResult = await db
      .select({
        id: categories.id,
        name: categories.name,
        viewCount: categories.viewCount,
        slug: categories.slug,
      })
      .from(categories)
      .orderBy(sql`${categories.viewCount} desc`)
      .limit(10);

    return {
      totalArticles: articleCounts?.total || 0,
      totalPublishedArticles: articleCounts?.published || 0,
      totalCategories: categoryCounts?.total || 0,
      totalViews: (articleCounts?.totalViews || 0) + (categoryCounts?.totalViews || 0),
      topArticles: topArticlesResult.map(a => ({
        id: a.id,
        title: a.title,
        viewCount: a.viewCount || 0,
        slug: a.slug,
      })),
      topCategories: topCategoriesResult.map(c => ({
        id: c.id,
        name: c.name,
        viewCount: c.viewCount || 0,
        slug: c.slug,
      })),
    };
  }
}

export const storage = new DbStorage();
