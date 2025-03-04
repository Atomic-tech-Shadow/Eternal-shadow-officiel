import { db } from "./db";
import { users, posts, badges, userBadges, forumCategories, forumThreads, forumReplies, projects, projectMembers } from "@shared/schema";
import { eq, desc } from "drizzle-orm";
import session from "express-session";
import connectPg from "connect-pg-simple";
import type { 
  Post, User, InsertUser, InsertPost, Badge, UserBadge,
  ForumCategory, ForumThread, ForumReply, Project, ProjectMember
} from "@shared/schema";
import { pool } from "./db";

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
}

export const storage = new DatabaseStorage();