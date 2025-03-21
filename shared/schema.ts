import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  avatar: text("avatar"),
  bio: text("bio"),
  level: integer("level").notNull().default(1),
  experience: integer("experience").notNull().default(0),
});

export const badges = pgTable("badges", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  icon: text("icon").notNull(),
});

export const userBadges = pgTable("user_badges", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  badgeId: integer("badge_id").notNull(),
  earnedAt: timestamp("earned_at").defaultNow(),
});

export const posts = pgTable("posts", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  content: text("content").notNull(),
  image: text("image"),
  tags: text("tags").array(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Nouvelles tables pour le forum
export const forumCategories = pgTable("forum_categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  slug: text("slug").notNull().unique(),
  icon: text("icon"),
  order: integer("order").notNull().default(0),
});

export const forumThreads = pgTable("forum_threads", {
  id: serial("id").primaryKey(),
  categoryId: integer("category_id").notNull(),
  userId: integer("user_id").notNull(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  isPinned: boolean("is_pinned").notNull().default(false),
  isLocked: boolean("is_locked").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const forumReplies = pgTable("forum_replies", {
  id: serial("id").primaryKey(),
  threadId: integer("thread_id").notNull(),
  userId: integer("user_id").notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Tables pour les projets collaboratifs
export const projects = pgTable("projects", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  repository: text("repository"),
  websiteUrl: text("website_url"),
  userId: integer("user_id").notNull(),
  status: text("status").notNull().default("active"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const projectMembers = pgTable("project_members", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id").notNull(),
  userId: integer("user_id").notNull(),
  role: text("role").notNull().default("member"),
  joinedAt: timestamp("joined_at").defaultNow(),
});

// Nouvelles tables pour la modération
export const moderators = pgTable("moderators", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  permissions: text("permissions").array(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const reports = pgTable("reports", {
  id: serial("id").primaryKey(),
  reporterId: integer("reporter_id").notNull(),
  targetType: text("target_type").notNull(), // 'post', 'thread', 'reply'
  targetId: integer("target_id").notNull(),
  reason: text("reason").notNull(),
  status: text("status").notNull().default("pending"),
  moderatorId: integer("moderator_id"),
  resolution: text("resolution"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Schémas d'insertion
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertPostSchema = createInsertSchema(posts).pick({
  content: true,
  image: true,
  tags: true,
});

export const insertBadgeSchema = createInsertSchema(badges);

export const insertForumThreadSchema = createInsertSchema(forumThreads).pick({
  categoryId: true,
  title: true,
  content: true,
});

export const insertForumReplySchema = createInsertSchema(forumReplies).pick({
  threadId: true,
  content: true,
});

export const insertProjectSchema = createInsertSchema(projects).pick({
  name: true,
  description: true,
  repository: true,
  websiteUrl: true,
});

// Schémas d'insertion pour la modération
export const insertReportSchema = createInsertSchema(reports).pick({
  targetType: true,
  targetId: true,
  reason: true,
});

// Types exportés
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type Post = typeof posts.$inferSelect;
export type InsertPost = z.infer<typeof insertPostSchema>;
export type Badge = typeof badges.$inferSelect;
export type UserBadge = typeof userBadges.$inferSelect;
export type ForumCategory = typeof forumCategories.$inferSelect;
export type ForumThread = typeof forumThreads.$inferSelect;
export type ForumReply = typeof forumReplies.$inferSelect;
export type Project = typeof projects.$inferSelect;
export type ProjectMember = typeof projectMembers.$inferSelect;

// Table pour les modèles de contenu
export const contentTemplates = pgTable("content_templates", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  category: text("category").notNull(), // anime_review, tutorial, project, etc.
  content: text("content").notNull(),
  createdBy: integer("created_by").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Table pour les évaluations
export const ratings = pgTable("ratings", {
  id: serial("id").primaryKey(),
  targetType: text("target_type").notNull(), // 'post', 'thread', 'project', etc.
  targetId: integer("target_id").notNull(),
  userId: integer("user_id").notNull(),
  score: integer("score").notNull(), // 1-5 étoiles
  createdAt: timestamp("created_at").defaultNow(),
});

// Table pour les favoris
export const favorites = pgTable("favorites", {
  id: serial("id").primaryKey(),
  targetType: text("target_type").notNull(), // 'post', 'thread', 'project', etc.
  targetId: integer("target_id").notNull(),
  userId: integer("user_id").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Schémas d'insertion
export const insertTemplateSchema = createInsertSchema(contentTemplates).pick({
  name: true,
  description: true,
  category: true,
  content: true,
});

export const insertRatingSchema = createInsertSchema(ratings).pick({
  targetType: true,
  targetId: true,
  score: true,
});

// Types exportés pour la modération
export type Moderator = typeof moderators.$inferSelect;
export type Report = typeof reports.$inferSelect;
export type InsertReport = z.infer<typeof insertReportSchema>;

// Types exportés pour les nouvelles fonctionnalités
export type ContentTemplate = typeof contentTemplates.$inferSelect;
export type Rating = typeof ratings.$inferSelect;
export type Favorite = typeof favorites.$inferSelect;
export type InsertTemplate = z.infer<typeof insertTemplateSchema>;
export type InsertRating = z.infer<typeof insertRatingSchema>;