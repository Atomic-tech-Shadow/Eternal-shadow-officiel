import { db } from "./db";
import * as schema from "@shared/schema";
import { and, eq, like, or, sql, desc } from "drizzle-orm";
import session from "express-session";
import connectPg from "connect-pg-simple";
import type { 
  Post, User, InsertUser, InsertPost, Badge, UserBadge,
  ForumCategory, ForumThread, ForumReply, Project, ProjectMember,
  Moderator, Report
} from "@shared/schema";
import { pool } from "./db";

// Importation des tables du schéma
const { 
  users, posts, badges, userBadges, 
  forumCategories, forumThreads, forumReplies,
  projects, projectMembers, moderators, reports,
  contentTemplates, ratings, favorites
} = schema;

const PostgresSessionStore = connectPg(session);

export interface IStorage {
  // Méthodes existantes
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  getAllPosts(): Promise<Post[]>;
  createPost(post: InsertPost & { userId: number }): Promise<Post>;
  getUserBadges(userId: number): Promise<Badge[]>;
  addExperience(userId: number, amount: number): Promise<User>;
  awardBadge(userId: number, badgeId: number): Promise<void>;
  sessionStore: session.Store;

  // Nouvelles méthodes pour le forum
  getForumCategories(): Promise<ForumCategory[]>;
  getForumThreads(categoryId: number): Promise<ForumThread[]>;
  getForumThread(threadId: number): Promise<ForumThread | undefined>;
  createForumThread(thread: Omit<ForumThread, "id" | "createdAt" | "updatedAt">): Promise<ForumThread>;
  getThreadReplies(threadId: number): Promise<ForumReply[]>;
  createThreadReply(reply: Omit<ForumReply, "id" | "createdAt" | "updatedAt">): Promise<ForumReply>;

  // Nouvelles méthodes pour les projets
  getProjects(): Promise<Project[]>;
  getProject(id: number): Promise<Project | undefined>;
  createProject(project: Omit<Project, "id" | "createdAt" | "updatedAt">): Promise<Project>;
  getProjectMembers(projectId: number): Promise<(ProjectMember & { user: User })[]>;
  addProjectMember(projectId: number, userId: number, role: string): Promise<ProjectMember>;

  // Méthodes de modération
  getModerator(userId: number): Promise<Moderator | undefined>;
  createModerator(userId: number, permissions: string[]): Promise<Moderator>;
  getReports(status?: string): Promise<Report[]>;
  createReport(report: Omit<Report, "id" | "status" | "createdAt" | "updatedAt">): Promise<Report>;
  updateReportStatus(reportId: number, status: string, moderatorId: number, resolution?: string): Promise<Report>;

  // Méthodes de recherche
  searchPosts(query: string): Promise<Post[]>;
  searchThreads(query: string): Promise<ForumThread[]>;
  searchProjects(query: string): Promise<Project[]>;

  // Nouvelles fonctions pour templates, notations et favoris
  getContentTemplates(category?: string): Promise<schema.ContentTemplate[]>;
  getContentTemplate(id: number): Promise<schema.ContentTemplate | null>;
  createContentTemplate(data: Omit<schema.InsertTemplate, "createdBy"> & { createdBy: number }): Promise<schema.ContentTemplate>;
  getRatings(targetType: string, targetId: number): Promise<schema.Rating[]>;
  getAverageRating(targetType: string, targetId: number): Promise<{ average: number; count: number }>;
  createOrUpdateRating(data: { targetType: string; targetId: number; userId: number; score: number }): Promise<schema.Rating>;
  getUserFavorites(userId: number): Promise<schema.Favorite[]>;
  addToFavorites(data: { targetType: string; targetId: number; userId: number }): Promise<schema.Favorite>;
  removeFromFavorites(data: { targetType: string; targetId: number; userId: number }): Promise<schema.Favorite[]>;
}

export class DatabaseStorage implements IStorage {
  sessionStore: session.Store;

  constructor() {
    this.sessionStore = new PostgresSessionStore({
      pool,
      createTableIfMissing: true,
    });
  }

  // Méthodes existantes
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async getAllPosts(): Promise<Post[]> {
    return await db.select().from(posts).orderBy(desc(posts.createdAt));
  }

  async createPost(post: InsertPost & { userId: number }): Promise<Post> {
    const [newPost] = await db.insert(posts).values(post).returning();
    await this.addExperience(post.userId, 10);
    return newPost;
  }

  async getUserBadges(userId: number): Promise<Badge[]> {
    const userBadgesWithDetails = await db
      .select({
        badge: badges,
        earnedAt: userBadges.earnedAt,
      })
      .from(userBadges)
      .where(eq(userBadges.userId, userId))
      .innerJoin(badges, eq(userBadges.badgeId, badges.id));

    return userBadgesWithDetails.map(({ badge }) => badge);
  }

  async addExperience(userId: number, amount: number): Promise<User> {
    const user = await this.getUser(userId);
    if (!user) throw new Error("User not found");

    const newExperience = user.experience + amount;
    const newLevel = Math.floor(Math.sqrt(newExperience / 100)) + 1;

    const [updatedUser] = await db
      .update(users)
      .set({
        experience: newExperience,
        level: newLevel,
      })
      .where(eq(users.id, userId))
      .returning();

    return updatedUser;
  }

  async awardBadge(userId: number, badgeId: number): Promise<void> {
    const [existingBadge] = await db
      .select()
      .from(userBadges)
      .where(eq(userBadges.userId, userId))
      .where(eq(userBadges.badgeId, badgeId));

    if (!existingBadge) {
      await db.insert(userBadges).values({
        userId,
        badgeId,
      });
    }
  }

  // Nouvelles méthodes pour le forum
  async getForumCategories(): Promise<ForumCategory[]> {
    return await db.select().from(forumCategories).orderBy(forumCategories.order);
  }

  async getForumThreads(categoryId: number): Promise<ForumThread[]> {
    return await db
      .select()
      .from(forumThreads)
      .where(eq(forumThreads.categoryId, categoryId))
      .orderBy(desc(forumThreads.updatedAt));
  }

  async getForumThread(threadId: number): Promise<ForumThread | undefined> {
    const [thread] = await db
      .select()
      .from(forumThreads)
      .where(eq(forumThreads.id, threadId));
    return thread;
  }

  async createForumThread(thread: Omit<ForumThread, "id" | "createdAt" | "updatedAt">): Promise<ForumThread> {
    const [newThread] = await db.insert(forumThreads).values(thread).returning();
    await this.addExperience(thread.userId, 20);
    return newThread;
  }

  async getThreadReplies(threadId: number): Promise<ForumReply[]> {
    return await db
      .select()
      .from(forumReplies)
      .where(eq(forumReplies.threadId, threadId))
      .orderBy(forumReplies.createdAt);
  }

  async createThreadReply(reply: Omit<ForumReply, "id" | "createdAt" | "updatedAt">): Promise<ForumReply> {
    const [newReply] = await db.insert(forumReplies).values(reply).returning();
    await this.addExperience(reply.userId, 5);
    return newReply;
  }

  // Nouvelles méthodes pour les projets
  async getProjects(): Promise<Project[]> {
    return await db.select().from(projects).orderBy(desc(projects.updatedAt));
  }

  async getProject(id: number): Promise<Project | undefined> {
    const [project] = await db.select().from(projects).where(eq(projects.id, id));
    return project;
  }

  async createProject(project: Omit<Project, "id" | "createdAt" | "updatedAt">): Promise<Project> {
    const [newProject] = await db.insert(projects).values(project).returning();
    await this.addExperience(project.userId, 50);
    return newProject;
  }

  async getProjectMembers(projectId: number): Promise<(ProjectMember & { user: User })[]> {
    return await db
      .select({
        ...projectMembers,
        user: users,
      })
      .from(projectMembers)
      .where(eq(projectMembers.projectId, projectId))
      .innerJoin(users, eq(projectMembers.userId, users.id));
  }

  async addProjectMember(projectId: number, userId: number, role: string): Promise<ProjectMember> {
    const [member] = await db
      .insert(projectMembers)
      .values({ projectId, userId, role })
      .returning();
    return member;
  }

  // Implémentation des méthodes de modération
  async getModerator(userId: number): Promise<Moderator | undefined> {
    const [moderator] = await db
      .select()
      .from(moderators)
      .where(eq(moderators.userId, userId));
    return moderator;
  }

  async createModerator(userId: number, permissions: string[]): Promise<Moderator> {
    const [moderator] = await db
      .insert(moderators)
      .values({ userId, permissions })
      .returning();
    return moderator;
  }

  async getReports(status?: string): Promise<Report[]> {
    let query = db.select().from(reports);
    if (status) {
      query = query.where(eq(reports.status, status));
    }
    return await query.orderBy(desc(reports.createdAt));
  }

  async createReport(report: Omit<Report, "id" | "status" | "createdAt" | "updatedAt">): Promise<Report> {
    const [newReport] = await db
      .insert(reports)
      .values(report)
      .returning();
    return newReport;
  }

  async updateReportStatus(reportId: number, status: string, moderatorId: number, resolution?: string): Promise<Report> {
    const [updatedReport] = await db
      .update(reports)
      .set({
        status,
        moderatorId,
        resolution,
        updatedAt: new Date(),
      })
      .where(eq(reports.id, reportId))
      .returning();
    return updatedReport;
  }

  // Implémentation des méthodes de recherche
  async searchPosts(query: string): Promise<Post[]> {
    return await db
      .select()
      .from(posts)
      .where(ilike(posts.content, `%${query}%`))
      .orderBy(desc(posts.createdAt));
  }

  async searchThreads(query: string): Promise<ForumThread[]> {
    return await db
      .select()
      .from(forumThreads)
      .where(
        or(
          ilike(forumThreads.title, `%${query}%`),
          ilike(forumThreads.content, `%${query}%`)
        )
      )
      .orderBy(desc(forumThreads.updatedAt));
  }

  async searchProjects(query: string): Promise<Project[]> {
    return await db
      .select()
      .from(projects)
      .where(
        or(
          ilike(projects.name, `%${query}%`),
          ilike(projects.description, `%${query}%`)
        )
      )
      .orderBy(desc(projects.updatedAt));
  }

  // Nouvelles fonctions pour les templates de contenu
  async getContentTemplates(category?: string): Promise<schema.ContentTemplate[]> {
    if (category) {
      return await db.select().from(schema.contentTemplates).where(eq(schema.contentTemplates.category, category));
    }
    return await db.select().from(schema.contentTemplates);
  }

  async getContentTemplate(id: number): Promise<schema.ContentTemplate | null> {
    const [template] = await db.select().from(schema.contentTemplates).where(eq(schema.contentTemplates.id, id));
    return template || null;
  }

  async createContentTemplate(data: Omit<schema.InsertTemplate, "createdBy"> & { createdBy: number }): Promise<schema.ContentTemplate> {
    const [newTemplate] = await db.insert(schema.contentTemplates).values(data).returning();
    return newTemplate;
  }

  // Fonctions pour les évaluations
  async getRatings(targetType: string, targetId: number): Promise<schema.Rating[]> {
    return await db.select().from(schema.ratings)
      .where(and(
        eq(schema.ratings.targetType, targetType),
        eq(schema.ratings.targetId, targetId)
      ));
  }

  async getAverageRating(targetType: string, targetId: number): Promise<{ average: number; count: number }> {
    const result = await db.select({
      average: sql`avg(${schema.ratings.score})`,
      count: sql`count(*)`,
    }).from(schema.ratings)
      .where(and(
        eq(schema.ratings.targetType, targetType),
        eq(schema.ratings.targetId, targetId)
      ));

    return {
      average: result[0]?.average ? parseFloat(result[0].average.toString()) : 0,
      count: parseInt(result[0]?.count?.toString() || "0"),
    };
  }

  async createOrUpdateRating(data: { targetType: string; targetId: number; userId: number; score: number }): Promise<schema.Rating> {
    // Vérifier si l'utilisateur a déjà noté cet élément
    const existingRating = await db.select().from(schema.ratings)
      .where(and(
        eq(schema.ratings.targetType, data.targetType),
        eq(schema.ratings.targetId, data.targetId),
        eq(schema.ratings.userId, data.userId)
      )).then(rows => rows[0] || null);

    if (existingRating) {
      // Mettre à jour la note existante
      const [updatedRating] = await db.update(schema.ratings)
        .set({ score: data.score })
        .where(eq(schema.ratings.id, existingRating.id))
        .returning();
      return updatedRating;
    } else {
      // Créer une nouvelle note
      const [newRating] = await db.insert(schema.ratings)
        .values(data)
        .returning();
      return newRating;
    }
  }

  // Fonctions pour les favoris
  async getUserFavorites(userId: number): Promise<schema.Favorite[]> {
    return await db.select().from(schema.favorites)
      .where(eq(schema.favorites.userId, userId));
  }

  async addToFavorites(data: { targetType: string; targetId: number; userId: number }): Promise<schema.Favorite> {
    // Vérifier si déjà dans les favoris
    const existing = await db.select().from(schema.favorites)
      .where(and(
        eq(schema.favorites.targetType, data.targetType),
        eq(schema.favorites.targetId, data.targetId),
        eq(schema.favorites.userId, data.userId)
      )).then(rows => rows[0] || null);

    if (existing) {
      return existing;
    }

    const [newFavorite] = await db.insert(schema.favorites)
      .values(data)
      .returning();
    return newFavorite;
  }

  async removeFromFavorites(data: { targetType: string; targetId: number; userId: number }): Promise<schema.Favorite[]> {
    const deletedFavorites = await db.delete(schema.favorites)
      .where(and(
        eq(schema.favorites.targetType, data.targetType),
        eq(schema.favorites.targetId, data.targetId),
        eq(schema.favorites.userId, data.userId)
      ))
      .returning();
    return deletedFavorites;
  }
}

export const storage = new DatabaseStorage();