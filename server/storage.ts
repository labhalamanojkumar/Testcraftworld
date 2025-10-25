import { type User, type InsertUser, type Category, type InsertCategory, type Article, type InsertArticle, type Visitor, type InsertVisitor, type Session, type InsertSession, type PageView, type InsertPageView, type Like, type InsertLike, type Comment, type InsertComment } from "@shared/schema";
import { randomUUID } from "crypto";
import { db } from "./db";
import { users, categories, articles, visitors, sessions, pageViews, likes, comments } from "../shared/schema";
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
  // Paginated articles (published only)
  getArticlesPaginated(page: number, limit: number, includeDrafts?: boolean, userId?: string): Promise<{ items: Article[]; total: number }>;
  getArticle(id: string): Promise<Article | undefined>;
  getArticleBySlug(slug: string): Promise<Article | undefined>;
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
  // Analytics methods
  createVisitor(visitor: InsertVisitor): Promise<Visitor>;
  getVisitorByIp(ipAddress: string): Promise<Visitor | undefined>;
  updateVisitor(id: string, updates: Partial<InsertVisitor>): Promise<Visitor | undefined>;
  createSession(session: InsertSession): Promise<Session>;
  getSessionById(sessionId: string): Promise<Session | undefined>;
  updateSession(id: string, updates: Partial<InsertSession>): Promise<Session | undefined>;
  createPageView(pageView: InsertPageView): Promise<PageView>;
  getDetailedAnalytics(): Promise<{
    totalVisitors: number;
    uniqueVisitors: number;
    totalSessions: number;
    totalPageViews: number;
    avgSessionDuration: number;
    bounceRate: number;
    topPages: Array<{ url: string; title: string; views: number }>;
    trafficSources: Array<{ source: string; sessions: number; percentage: number }>;
    deviceStats: Array<{ device: string; visitors: number; percentage: number }>;
    realtimeData: {
      activeUsers: number;
      todayViews: number;
      todayVisitors: number;
    };
    hourlyStats: Array<{ hour: number; views: number; visitors: number }>;
    dailyStats: Array<{ date: string; views: number; visitors: number; sessions: number }>;
  }>;
  // Likes and comments methods
  createLike(like: InsertLike): Promise<Like>;
  deleteLike(articleId: string, userId: string | null, ipAddress: string | null): Promise<boolean>;
  getLikesByArticle(articleId: string): Promise<Like[]>;
  getLikesCount(articleId: string): Promise<number>;
  getUserLike(articleId: string, userId: string | null, ipAddress: string | null): Promise<Like | undefined>;
  createComment(comment: InsertComment): Promise<Comment>;
  updateComment(id: string, content: string): Promise<Comment | undefined>;
  deleteComment(id: string): Promise<boolean>;
  getCommentsByArticle(articleId: string): Promise<Comment[]>;
  getCommentsCount(articleId: string): Promise<number>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private categories: Map<string, Category>;
  private articles: Map<string, Article>;
  private visitors: Map<string, Visitor>;
  private sessions: Map<string, Session>;
  private pageViews: Map<string, PageView>;
  private likes: Map<string, Like>;
  private comments: Map<string, Comment>;

  constructor() {
    this.users = new Map();
    this.categories = new Map();
    this.articles = new Map();
    this.visitors = new Map();
    this.sessions = new Map();
    this.pageViews = new Map();
    this.likes = new Map();
    this.comments = new Map();
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

  async getArticlesPaginated(page: number, limit: number, includeDrafts = false, userId?: string): Promise<{ items: Article[]; total: number }> {
    let all = Array.from(this.articles.values());
    if (!includeDrafts) {
      all = all.filter(a => a.published);
    } else if (includeDrafts && userId) {
      // include published and drafts authored by user
      all = all.filter(a => a.published || a.authorId === userId);
    } else if (includeDrafts && !userId) {
      // include all (published + drafts)
      // keep all as-is
    }

    const total = all.length;
    const start = Math.max(0, (page - 1) * limit);
    const items = all.slice(start, start + limit);
    return { items, total };
  }

  async getArticle(id: string): Promise<Article | undefined> {
    return this.articles.get(id);
  }

  async getArticleBySlug(slug: string): Promise<Article | undefined> {
    return Array.from(this.articles.values()).find(a => a.slug === slug);
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

  // Analytics methods
  async createVisitor(insertVisitor: InsertVisitor): Promise<Visitor> {
    const id = randomUUID();
    const visitor: Visitor = {
      ...insertVisitor,
      id,
      firstVisit: insertVisitor.firstVisit || new Date(),
      lastVisit: insertVisitor.lastVisit || new Date(),
      visitCount: insertVisitor.visitCount || 1,
      isUnique: insertVisitor.isUnique ?? true,
      country: insertVisitor.country || null,
      city: insertVisitor.city || null,
      deviceType: insertVisitor.deviceType || null,
      browser: insertVisitor.browser || null,
      os: insertVisitor.os || null,
      ipAddress: insertVisitor.ipAddress || null,
      userAgent: insertVisitor.userAgent || null,
      referrer: insertVisitor.referrer || null,
    };
    this.visitors.set(id, visitor);
    return visitor;
  }

  async getVisitorByIp(ipAddress: string): Promise<Visitor | undefined> {
    return Array.from(this.visitors.values()).find(v => v.ipAddress === ipAddress);
  }

  async updateVisitor(id: string, updates: Partial<InsertVisitor>): Promise<Visitor | undefined> {
    const visitor = this.visitors.get(id);
    if (!visitor) return undefined;
    const updated = { ...visitor, ...updates };
    this.visitors.set(id, updated);
    return updated;
  }

  async createSession(insertSession: InsertSession): Promise<Session> {
    const id = randomUUID();
    const session: Session = {
      ...insertSession,
      id,
      startTime: insertSession.startTime || new Date(),
      pageViews: insertSession.pageViews || 1,
      bounce: insertSession.bounce ?? false,
      source: insertSession.source || null,
      duration: insertSession.duration || null,
      visitorId: insertSession.visitorId || null,
      endTime: insertSession.endTime || null,
      campaign: insertSession.campaign || null,
      landingPage: insertSession.landingPage || null,
    };
    this.sessions.set(id, session);
    return session;
  }

  async getSessionById(sessionId: string): Promise<Session | undefined> {
    return Array.from(this.sessions.values()).find(s => s.sessionId === sessionId);
  }

  async updateSession(id: string, updates: Partial<InsertSession>): Promise<Session | undefined> {
    const session = this.sessions.get(id);
    if (!session) return undefined;
    const updated = { ...session, ...updates };
    this.sessions.set(id, updated);
    return updated;
  }

  async createPageView(insertPageView: InsertPageView): Promise<PageView> {
    const id = randomUUID();
    const pageView: PageView = {
      ...insertPageView,
      id,
      timestamp: insertPageView.timestamp || new Date(),
      title: insertPageView.title || null,
      categoryId: insertPageView.categoryId || null,
      visitorId: insertPageView.visitorId || null,
      sessionId: insertPageView.sessionId || null,
      timeOnPage: insertPageView.timeOnPage || null,
      articleId: insertPageView.articleId || null,
    };
    this.pageViews.set(id, pageView);
    return pageView;
  }

  async getDetailedAnalytics(): Promise<{
    totalVisitors: number;
    uniqueVisitors: number;
    totalSessions: number;
    totalPageViews: number;
    avgSessionDuration: number;
    bounceRate: number;
    topPages: Array<{ url: string; title: string; views: number }>;
    trafficSources: Array<{ source: string; sessions: number; percentage: number }>;
    deviceStats: Array<{ device: string; visitors: number; percentage: number }>;
    realtimeData: { activeUsers: number; todayViews: number; todayVisitors: number };
    hourlyStats: Array<{ hour: number; views: number; visitors: number }>;
    dailyStats: Array<{ date: string; views: number; visitors: number; sessions: number }>;
  }> {
    const allVisitors = Array.from(this.visitors.values());
    const allSessions = Array.from(this.sessions.values());
    const allPageViews = Array.from(this.pageViews.values());

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const lastHour = new Date(now.getTime() - 60 * 60 * 1000);

    // Calculate metrics
    const totalVisitors = allVisitors.length;
    const uniqueVisitors = allVisitors.filter(v => v.isUnique).length;
    const totalSessions = allSessions.length;
    const totalPageViews = allPageViews.length;

    const completedSessions = allSessions.filter(s => s.duration && s.duration > 0);
    const avgSessionDuration = completedSessions.length > 0
      ? completedSessions.reduce((sum, s) => sum + (s.duration || 0), 0) / completedSessions.length
      : 0;

    const bounceRate = totalSessions > 0 ? (allSessions.filter(s => s.bounce).length / totalSessions) * 100 : 0;

    // Top pages
    const pageStats = new Map<string, { title: string; views: number }>();
    allPageViews.forEach(pv => {
      const key = pv.url;
      const existing = pageStats.get(key) || { title: pv.title || '', views: 0 };
      pageStats.set(key, { title: existing.title, views: existing.views + 1 });
    });
    const topPages = Array.from(pageStats.entries())
      .sort((a, b) => b[1].views - a[1].views)
      .slice(0, 10)
      .map(([url, stats]) => ({ url, title: stats.title, views: stats.views }));

    // Traffic sources
    const sourceStats = new Map<string, number>();
    allSessions.forEach(s => {
      const source = s.source || 'direct';
      sourceStats.set(source, (sourceStats.get(source) || 0) + 1);
    });
    const trafficSources = Array.from(sourceStats.entries())
      .map(([source, sessions]) => ({
        source,
        sessions,
        percentage: totalSessions > 0 ? (sessions / totalSessions) * 100 : 0
      }))
      .sort((a, b) => b.sessions - a.sessions);

    // Device stats
    const deviceStatsMap = new Map<string, number>();
    allVisitors.forEach(v => {
      const device = v.deviceType || 'unknown';
      deviceStatsMap.set(device, (deviceStatsMap.get(device) || 0) + 1);
    });
    const deviceStats = Array.from(deviceStatsMap.entries())
      .map(([device, visitors]) => ({
        device,
        visitors,
        percentage: totalVisitors > 0 ? (visitors / totalVisitors) * 100 : 0
      }))
      .sort((a, b) => b.visitors - a.visitors);

    // Real-time data (last hour)
    const activeUsers = allSessions.filter(s => s.startTime && new Date(s.startTime) > lastHour).length;
    const todayViews = allPageViews.filter(pv => pv.timestamp && new Date(pv.timestamp) >= today).length;
    const todayVisitors = allVisitors.filter(v => v.lastVisit && new Date(v.lastVisit) >= today).length;

    // Hourly stats (last 24 hours)
    const hourlyStats = [];
    for (let i = 23; i >= 0; i--) {
      const hourStart = new Date(now.getTime() - i * 60 * 60 * 1000);
      const hourEnd = new Date(hourStart.getTime() + 60 * 60 * 1000);

      const hourViews = allPageViews.filter(pv =>
        pv.timestamp && new Date(pv.timestamp) >= hourStart && new Date(pv.timestamp) < hourEnd
      ).length;

      const hourVisitors = allVisitors.filter(v =>
        v.lastVisit && new Date(v.lastVisit) >= hourStart && new Date(v.lastVisit) < hourEnd
      ).length;

      hourlyStats.push({
        hour: hourStart.getHours(),
        views: hourViews,
        visitors: hourVisitors
      });
    }

    // Daily stats (last 30 days)
    const dailyStats = [];
    for (let i = 29; i >= 0; i--) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const dateStart = new Date(date.getFullYear(), date.getMonth(), date.getDate());
      const dateEnd = new Date(dateStart.getTime() + 24 * 60 * 60 * 1000);

      const dayViews = allPageViews.filter(pv =>
        pv.timestamp && new Date(pv.timestamp) >= dateStart && new Date(pv.timestamp) < dateEnd
      ).length;

      const dayVisitors = allVisitors.filter(v =>
        v.lastVisit && new Date(v.lastVisit) >= dateStart && new Date(v.lastVisit) < dateEnd
      ).length;

      const daySessions = allSessions.filter(s =>
        s.startTime && new Date(s.startTime) >= dateStart && new Date(s.startTime) < dateEnd
      ).length;

      dailyStats.push({
        date: dateStart.toISOString().split('T')[0],
        views: dayViews,
        visitors: dayVisitors,
        sessions: daySessions
      });
    }

    return {
      totalVisitors,
      uniqueVisitors,
      totalSessions,
      totalPageViews,
      avgSessionDuration,
      bounceRate,
      topPages,
      trafficSources,
      deviceStats,
      realtimeData: { activeUsers, todayViews, todayVisitors },
      hourlyStats,
      dailyStats,
    };
  }

  // Likes and comments methods for MemStorage
  async createLike(insertLike: InsertLike): Promise<Like> {
    const id = randomUUID();
    const like: Like = {
      id,
      articleId: insertLike.articleId,
      userId: insertLike.userId ?? null,
      ipAddress: insertLike.ipAddress ?? null,
      createdAt: new Date(),
    };
    this.likes.set(id, like);
    return like;
  }

  async deleteLike(articleId: string, userId: string | null, ipAddress: string | null): Promise<boolean> {
    const like = Array.from(this.likes.values()).find(
      (l) => l.articleId === articleId && 
             (userId ? l.userId === userId : l.ipAddress === ipAddress)
    );
    if (like) {
      this.likes.delete(like.id);
      return true;
    }
    return false;
  }

  async getLikesByArticle(articleId: string): Promise<Like[]> {
    return Array.from(this.likes.values()).filter(
      (like) => like.articleId === articleId
    );
  }

  async getLikesCount(articleId: string): Promise<number> {
    return Array.from(this.likes.values()).filter(
      (like) => like.articleId === articleId
    ).length;
  }

  async getUserLike(articleId: string, userId: string | null, ipAddress: string | null): Promise<Like | undefined> {
    return Array.from(this.likes.values()).find(
      (l) => l.articleId === articleId && 
             (userId ? l.userId === userId : l.ipAddress === ipAddress)
    );
  }

  async createComment(insertComment: InsertComment): Promise<Comment> {
    const id = randomUUID();
    const comment: Comment = {
      id,
      content: insertComment.content,
      articleId: insertComment.articleId,
      userId: insertComment.userId ?? null,
      parentId: insertComment.parentId ?? null,
      authorName: insertComment.authorName ?? null,
      authorEmail: insertComment.authorEmail ?? null,
      isApproved: insertComment.isApproved ?? true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.comments.set(id, comment);
    return comment;
  }

  async updateComment(id: string, content: string): Promise<Comment | undefined> {
    const comment = this.comments.get(id);
    if (comment) {
      comment.content = content;
      comment.updatedAt = new Date();
      this.comments.set(id, comment);
      return comment;
    }
    return undefined;
  }

  async deleteComment(id: string): Promise<boolean> {
    return this.comments.delete(id);
  }

  async getCommentsByArticle(articleId: string): Promise<Comment[]> {
    return Array.from(this.comments.values())
      .filter((comment) => comment.articleId === articleId)
      .sort((a, b) => {
        const aTime = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const bTime = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return aTime - bTime;
      });
  }

  async getCommentsCount(articleId: string): Promise<number> {
    return Array.from(this.comments.values()).filter(
      (comment) => comment.articleId === articleId
    ).length;
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

  async getArticlesPaginated(page: number, limit: number, includeDrafts = false, userId?: string): Promise<{ items: Article[]; total: number }> {
    const offset = Math.max(0, (page - 1) * limit);

    // Build where clause based on includeDrafts and userId
    const publishedCondition = eq(articles.published, true);

    let totalQuery;
    let rowsQuery;

    if (!includeDrafts) {
      totalQuery = db.select({ count: sql<number>`count(*)` }).from(articles).where(publishedCondition);
      rowsQuery = db
        .select()
        .from(articles)
        .where(publishedCondition)
        .orderBy(sql`${articles.createdAt} desc`)
        .limit(limit)
        .offset(offset);
    } else if (includeDrafts && userId) {
      // published OR authored by user
      totalQuery = db
        .select({ count: sql<number>`count(*)` })
        .from(articles)
        .where(sql`(${articles.published} = 1 OR ${articles.authorId} = ${userId})`);

      rowsQuery = db
        .select()
        .from(articles)
        .where(sql`(${articles.published} = 1 OR ${articles.authorId} = ${userId})`)
        .orderBy(sql`${articles.createdAt} desc`)
        .limit(limit)
        .offset(offset);
    } else {
      // include all (published + drafts) - admin scenario
      totalQuery = db.select({ count: sql<number>`count(*)` }).from(articles);
      rowsQuery = db
        .select()
        .from(articles)
        .orderBy(sql`${articles.createdAt} desc`)
        .limit(limit)
        .offset(offset);
    }

    const [countRow] = await totalQuery;
    const total = countRow?.count || 0;
    const rows = await rowsQuery;

    return { items: rows, total };
  }

  async getArticle(id: string): Promise<Article | undefined> {
    const result = await db.select().from(articles).where(eq(articles.id, id)).limit(1);
    return result[0];
  }

  async getArticleBySlug(slug: string): Promise<Article | undefined> {
    const result = await db.select().from(articles).where(eq(articles.slug, slug)).limit(1);
    return result[0] as Article | undefined;
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

  // Analytics methods
  async createVisitor(insertVisitor: InsertVisitor): Promise<Visitor> {
    const id = randomUUID();
    const visitor: Visitor = {
      ...insertVisitor,
      id,
      firstVisit: insertVisitor.firstVisit || new Date(),
      lastVisit: insertVisitor.lastVisit || new Date(),
      visitCount: insertVisitor.visitCount || 1,
      isUnique: insertVisitor.isUnique ?? true,
      ipAddress: insertVisitor.ipAddress || null,
      userAgent: insertVisitor.userAgent || null,
      referrer: insertVisitor.referrer || null,
      country: insertVisitor.country || null,
      city: insertVisitor.city || null,
      deviceType: insertVisitor.deviceType || null,
      browser: insertVisitor.browser || null,
      os: insertVisitor.os || null,
    };

    await db.insert(visitors).values(visitor);
    return visitor;
  }

  async getVisitorByIp(ipAddress: string): Promise<Visitor | undefined> {
    const result = await db.select().from(visitors).where(eq(visitors.ipAddress, ipAddress)).limit(1);
    return result[0];
  }

  async updateVisitor(id: string, updates: Partial<InsertVisitor>): Promise<Visitor | undefined> {
    await db
      .update(visitors)
      .set({ ...updates, lastVisit: new Date() })
      .where(eq(visitors.id, id));

    return await this.getVisitorById(id);
  }

  async getVisitorById(id: string): Promise<Visitor | undefined> {
    const result = await db.select().from(visitors).where(eq(visitors.id, id)).limit(1);
    return result[0];
  }

  async createSession(insertSession: InsertSession): Promise<Session> {
    const id = randomUUID();
    const session: Session = {
      ...insertSession,
      id,
      startTime: insertSession.startTime || new Date(),
      pageViews: insertSession.pageViews || 1,
      bounce: insertSession.bounce ?? false,
      source: insertSession.source || null,
      duration: insertSession.duration || null,
      visitorId: insertSession.visitorId || null,
      endTime: insertSession.endTime || null,
      campaign: insertSession.campaign || null,
      landingPage: insertSession.landingPage || null,
    };

    await db.insert(sessions).values(session);
    return session;
  }

  async getSessionById(sessionId: string): Promise<Session | undefined> {
    const result = await db.select().from(sessions).where(eq(sessions.sessionId, sessionId)).limit(1);
    return result[0];
  }

  async updateSession(id: string, updates: Partial<InsertSession>): Promise<Session | undefined> {
    await db
      .update(sessions)
      .set(updates)
      .where(eq(sessions.id, id));

    return await this.getSessionByIdFromDb(id);
  }

  async getSessionByIdFromDb(id: string): Promise<Session | undefined> {
    const result = await db.select().from(sessions).where(eq(sessions.id, id)).limit(1);
    return result[0];
  }

  async createPageView(insertPageView: InsertPageView): Promise<PageView> {
    const id = randomUUID();
    const pageView: PageView = {
      ...insertPageView,
      id,
      timestamp: insertPageView.timestamp || new Date(),
      title: insertPageView.title || null,
      categoryId: insertPageView.categoryId || null,
      visitorId: insertPageView.visitorId || null,
      sessionId: insertPageView.sessionId || null,
      timeOnPage: insertPageView.timeOnPage || null,
      articleId: insertPageView.articleId || null,
    };

    await db.insert(pageViews).values(pageView);
    return pageView;
  }

  async getDetailedAnalytics(): Promise<{
    totalVisitors: number;
    uniqueVisitors: number;
    totalSessions: number;
    totalPageViews: number;
    avgSessionDuration: number;
    bounceRate: number;
    topPages: Array<{ url: string; title: string; views: number }>;
    trafficSources: Array<{ source: string; sessions: number; percentage: number }>;
    deviceStats: Array<{ device: string; visitors: number; percentage: number }>;
    realtimeData: { activeUsers: number; todayViews: number; todayVisitors: number };
    hourlyStats: Array<{ hour: number; views: number; visitors: number }>;
    dailyStats: Array<{ date: string; views: number; visitors: number; sessions: number }>;
  }> {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const lastHour = new Date(now.getTime() - 60 * 60 * 1000);

    // Get total counts
    const [visitorCounts] = await db
      .select({
        total: sql<number>`count(*)`,
        unique: sql<number>`sum(case when ${visitors.isUnique} = 1 then 1 else 0 end)`,
      })
      .from(visitors);

    const [sessionCounts] = await db
      .select({
        total: sql<number>`count(*)`,
        avgDuration: sql<number>`avg(${sessions.duration})`,
        bounceCount: sql<number>`sum(case when ${sessions.bounce} = 1 then 1 else 0 end)`,
      })
      .from(sessions);

    const [pageViewCounts] = await db
      .select({ total: sql<number>`count(*)` })
      .from(pageViews);

    // Top pages
    const topPagesResult = await db
      .select({
        url: pageViews.url,
        title: pageViews.title,
        views: sql<number>`count(*)`,
      })
      .from(pageViews)
      .groupBy(pageViews.url, pageViews.title)
      .orderBy(sql`count(*) desc`)
      .limit(10);

    // Traffic sources
    const trafficSourcesResult = await db
      .select({
        source: sessions.source,
        sessions: sql<number>`count(*)`,
      })
      .from(sessions)
      .groupBy(sessions.source)
      .orderBy(sql`count(*) desc`);

    const totalSessions = sessionCounts?.total || 0;
    const trafficSources = trafficSourcesResult.map(row => ({
      source: row.source || 'direct',
      sessions: row.sessions,
      percentage: totalSessions > 0 ? (row.sessions / totalSessions) * 100 : 0,
    }));

    // Device stats
    const deviceStatsResult = await db
      .select({
        device: visitors.deviceType,
        visitors: sql<number>`count(*)`,
      })
      .from(visitors)
      .groupBy(visitors.deviceType)
      .orderBy(sql`count(*) desc`);

    const totalVisitors = visitorCounts?.total || 0;
    const deviceStats = deviceStatsResult.map(row => ({
      device: row.device || 'unknown',
      visitors: row.visitors,
      percentage: totalVisitors > 0 ? (row.visitors / totalVisitors) * 100 : 0,
    }));

    // Real-time data
    const [activeUsers] = await db
      .select({ count: sql<number>`count(*)` })
      .from(sessions)
      .where(sql`${sessions.startTime} > ${lastHour}`);

    const [todayViews] = await db
      .select({ count: sql<number>`count(*)` })
      .from(pageViews)
      .where(sql`${pageViews.timestamp} >= ${today}`);

    const [todayVisitors] = await db
      .select({ count: sql<number>`count(*)` })
      .from(visitors)
      .where(sql`${visitors.lastVisit} >= ${today}`);

    // Hourly stats (last 24 hours)
    const hourlyStats = [];
    for (let i = 23; i >= 0; i--) {
      const hourStart = new Date(now.getTime() - i * 60 * 60 * 1000);
      const hourEnd = new Date(hourStart.getTime() + 60 * 60 * 1000);

      const [hourViews] = await db
        .select({ count: sql<number>`count(*)` })
        .from(pageViews)
        .where(sql`${pageViews.timestamp} >= ${hourStart} and ${pageViews.timestamp} < ${hourEnd}`);

      const [hourVisitors] = await db
        .select({ count: sql<number>`count(*)` })
        .from(visitors)
        .where(sql`${visitors.lastVisit} >= ${hourStart} and ${visitors.lastVisit} < ${hourEnd}`);

      hourlyStats.push({
        hour: hourStart.getHours(),
        views: hourViews?.count || 0,
        visitors: hourVisitors?.count || 0,
      });
    }

    // Daily stats (last 30 days)
    const dailyStats = [];
    for (let i = 29; i >= 0; i--) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const dateStart = new Date(date.getFullYear(), date.getMonth(), date.getDate());
      const dateEnd = new Date(dateStart.getTime() + 24 * 60 * 60 * 1000);

      const [dayViews] = await db
        .select({ count: sql<number>`count(*)` })
        .from(pageViews)
        .where(sql`${pageViews.timestamp} >= ${dateStart} and ${pageViews.timestamp} < ${dateEnd}`);

      const [dayVisitors] = await db
        .select({ count: sql<number>`count(*)` })
        .from(visitors)
        .where(sql`${visitors.lastVisit} >= ${dateStart} and ${visitors.lastVisit} < ${dateEnd}`);

      const [daySessions] = await db
        .select({ count: sql<number>`count(*)` })
        .from(sessions)
        .where(sql`${sessions.startTime} >= ${dateStart} and ${sessions.startTime} < ${dateEnd}`);

      dailyStats.push({
        date: dateStart.toISOString().split('T')[0],
        views: dayViews?.count || 0,
        visitors: dayVisitors?.count || 0,
        sessions: daySessions?.count || 0,
      });
    }

    return {
      totalVisitors: visitorCounts?.total || 0,
      uniqueVisitors: visitorCounts?.unique || 0,
      totalSessions: sessionCounts?.total || 0,
      totalPageViews: pageViewCounts?.total || 0,
      avgSessionDuration: sessionCounts?.avgDuration || 0,
      bounceRate: totalSessions > 0 ? ((sessionCounts?.bounceCount || 0) / totalSessions) * 100 : 0,
      topPages: topPagesResult.map(row => ({
        url: row.url,
        title: row.title || '',
        views: row.views,
      })),
      trafficSources,
      deviceStats,
      realtimeData: {
        activeUsers: activeUsers?.count || 0,
        todayViews: todayViews?.count || 0,
        todayVisitors: todayVisitors?.count || 0,
      },
      hourlyStats,
      dailyStats,
    };
  }

  // Likes methods
  async createLike(like: InsertLike): Promise<Like> {
    const id = randomUUID();
    await db.insert(likes).values({ ...like, id });
    const created = await db.select().from(likes).where(eq(likes.id, id)).limit(1);
    return created[0];
  }

  async deleteLike(articleId: string, userId: string | null, ipAddress: string | null): Promise<boolean> {
    try {
      if (userId) {
        await db.delete(likes)
          .where(and(eq(likes.articleId, articleId), eq(likes.userId, userId)));
        return true;
      } else if (ipAddress) {
        await db.delete(likes)
          .where(and(eq(likes.articleId, articleId), eq(likes.ipAddress, ipAddress)));
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }

  async getLikesByArticle(articleId: string): Promise<Like[]> {
    return await db.select().from(likes).where(eq(likes.articleId, articleId));
  }

  async getLikesCount(articleId: string): Promise<number> {
    const [result] = await db
      .select({ count: sql<number>`count(*)` })
      .from(likes)
      .where(eq(likes.articleId, articleId));
    return result?.count || 0;
  }

  async getUserLike(articleId: string, userId: string | null, ipAddress: string | null): Promise<Like | undefined> {
    if (userId) {
      const result = await db.select().from(likes)
        .where(and(eq(likes.articleId, articleId), eq(likes.userId, userId)))
        .limit(1);
      return result[0];
    } else if (ipAddress) {
      const result = await db.select().from(likes)
        .where(and(eq(likes.articleId, articleId), eq(likes.ipAddress, ipAddress)))
        .limit(1);
      return result[0];
    }
    return undefined;
  }

  // Comments methods
  async createComment(comment: InsertComment): Promise<Comment> {
    const id = randomUUID();
    await db.insert(comments).values({ ...comment, id });
    const created = await db.select().from(comments).where(eq(comments.id, id)).limit(1);
    return created[0];
  }

  async updateComment(id: string, content: string): Promise<Comment | undefined> {
    await db.update(comments)
      .set({ content, updatedAt: new Date() })
      .where(eq(comments.id, id));
    const updated = await db.select().from(comments).where(eq(comments.id, id)).limit(1);
    return updated[0];
  }

  async deleteComment(id: string): Promise<boolean> {
    try {
      await db.delete(comments).where(eq(comments.id, id));
      return true;
    } catch {
      return false;
    }
  }

  async getCommentsByArticle(articleId: string): Promise<Comment[]> {
    return await db.select().from(comments)
      .where(and(eq(comments.articleId, articleId), eq(comments.isApproved, true)))
      .orderBy(comments.createdAt);
  }

  async getCommentsCount(articleId: string): Promise<number> {
    const [result] = await db
      .select({ count: sql<number>`count(*)` })
      .from(comments)
      .where(and(eq(comments.articleId, articleId), eq(comments.isApproved, true)));
    return result?.count || 0;
  }
}

export const storage = new DbStorage();
