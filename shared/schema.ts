import { sql } from "drizzle-orm";
import { mysqlTable, text, varchar, boolean, timestamp, datetime, int } from "drizzle-orm/mysql-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = mysqlTable("users", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`(UUID())`),
  username: varchar("username", { length: 255 }).notNull().unique(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  password: text("password").notNull(),
  name: text("name").notNull(),
  bio: text("bio"),
  avatar: text("avatar"),
  role: text("role").default("user"), // "user" or "admin"
  isActive: boolean("is_active").default(true),
  createdAt: datetime("created_at").default(sql`NOW()`),
  updatedAt: datetime("updated_at").default(sql`NOW()`),
});

export const categories = mysqlTable("categories", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`(UUID())`),
  name: varchar("name", { length: 255 }).notNull().unique(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  description: text("description"),
  viewCount: int("view_count").default(0), // Number of times category page was viewed
});

export const articles = mysqlTable("articles", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`(UUID())`),
  title: text("title").notNull(),
  content: text("content").notNull(),
  excerpt: text("excerpt"),
  categoryId: varchar("category_id", { length: 36 }).references(() => categories.id),
  authorId: varchar("author_id", { length: 36 }).references(() => users.id),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  metaTitle: text("meta_title"),
  metaDescription: text("meta_description"),
  tags: text("tags"),
  published: boolean("published").default(false),
  viewCount: int("view_count").default(0), // Number of times article was viewed
  createdAt: datetime("created_at").default(sql`NOW()`),
  updatedAt: datetime("updated_at").default(sql`NOW()`),
});

// Analytics tables for visitor tracking
export const visitors = mysqlTable("visitors", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`(UUID())`),
  ipAddress: varchar("ip_address", { length: 45 }), // Support both IPv4 and IPv6
  userAgent: text("user_agent"),
  referrer: text("referrer"),
  country: varchar("country", { length: 100 }),
  city: varchar("city", { length: 100 }),
  deviceType: varchar("device_type", { length: 50 }), // desktop, mobile, tablet
  browser: varchar("browser", { length: 100 }),
  os: varchar("os", { length: 100 }),
  firstVisit: datetime("first_visit").default(sql`NOW()`),
  lastVisit: datetime("last_visit").default(sql`NOW()`),
  visitCount: int("visit_count").default(1),
  isUnique: boolean("is_unique").default(true),
});

export const sessions = mysqlTable("sessions", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`(UUID())`),
  visitorId: varchar("visitor_id", { length: 36 }).references(() => visitors.id),
  sessionId: varchar("session_id", { length: 255 }).notNull(),
  startTime: datetime("start_time").default(sql`NOW()`),
  endTime: datetime("end_time"),
  duration: int("duration"), // Duration in seconds
  pageViews: int("page_views").default(1),
  bounce: boolean("bounce").default(false), // Single page session
  source: varchar("source", { length: 255 }), // organic, direct, social, referral
  campaign: varchar("campaign", { length: 255 }),
  landingPage: text("landing_page"),
});

export const pageViews = mysqlTable("page_views", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`(UUID())`),
  sessionId: varchar("session_id", { length: 36 }).references(() => sessions.id),
  visitorId: varchar("visitor_id", { length: 36 }).references(() => visitors.id),
  url: text("url").notNull(),
  title: text("title"),
  timestamp: datetime("timestamp").default(sql`NOW()`),
  timeOnPage: int("time_on_page"), // Time spent on page in seconds
  articleId: varchar("article_id", { length: 36 }).references(() => articles.id),
  categoryId: varchar("category_id", { length: 36 }).references(() => categories.id),
});

// API Keys table for external AI tool integration
export const apiKeys = mysqlTable("api_keys", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`(UUID())`),
  name: varchar("name", { length: 255 }).notNull(),
  key: varchar("key", { length: 255 }).notNull().unique(),
  hashedKey: text("hashed_key").notNull(),
  permissions: text("permissions").notNull(), // JSON string of permissions array
  createdBy: varchar("created_by", { length: 36 }).references(() => users.id),
  createdAt: datetime("created_at").default(sql`NOW()`),
  lastUsed: datetime("last_used"),
  isActive: boolean("is_active").default(true),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  email: true,
  password: true,
  name: true,
  bio: true,
  avatar: true,
  role: true,
});

export const insertCategorySchema = createInsertSchema(categories).pick({
  name: true,
  slug: true,
  description: true,
  viewCount: true,
});

export const insertArticleSchema = createInsertSchema(articles).pick({
  title: true,
  content: true,
  excerpt: true,
  categoryId: true,
  authorId: true,
  slug: true,
  metaTitle: true,
  metaDescription: true,
  tags: true,
  published: true,
  viewCount: true,
});

export const insertVisitorSchema = createInsertSchema(visitors).pick({
  ipAddress: true,
  userAgent: true,
  referrer: true,
  country: true,
  city: true,
  deviceType: true,
  browser: true,
  os: true,
  firstVisit: true,
  lastVisit: true,
  visitCount: true,
  isUnique: true,
});

export const insertSessionSchema = createInsertSchema(sessions).pick({
  visitorId: true,
  sessionId: true,
  startTime: true,
  endTime: true,
  duration: true,
  pageViews: true,
  bounce: true,
  source: true,
  campaign: true,
  landingPage: true,
});

export const insertPageViewSchema = createInsertSchema(pageViews).pick({
  sessionId: true,
  visitorId: true,
  url: true,
  title: true,
  timestamp: true,
  timeOnPage: true,
  articleId: true,
  categoryId: true,
});

export const insertApiKeySchema = createInsertSchema(apiKeys).pick({
  name: true,
  key: true,
  hashedKey: true,
  permissions: true,
  createdBy: true,
  createdAt: true,
  lastUsed: true,
  isActive: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertCategory = z.infer<typeof insertCategorySchema>;
export type Category = typeof categories.$inferSelect;
export type InsertArticle = z.infer<typeof insertArticleSchema>;
export type Article = typeof articles.$inferSelect;
export type InsertVisitor = z.infer<typeof insertVisitorSchema>;
export type Visitor = typeof visitors.$inferSelect;
export type InsertSession = z.infer<typeof insertSessionSchema>;
export type Session = typeof sessions.$inferSelect;
export type InsertPageView = z.infer<typeof insertPageViewSchema>;
export type PageView = typeof pageViews.$inferSelect;
export type InsertApiKey = z.infer<typeof insertApiKeySchema>;
export type ApiKey = typeof apiKeys.$inferSelect;
