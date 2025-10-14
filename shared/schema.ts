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

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertCategory = z.infer<typeof insertCategorySchema>;
export type Category = typeof categories.$inferSelect;
export type InsertArticle = z.infer<typeof insertArticleSchema>;
export type Article = typeof articles.$inferSelect;
