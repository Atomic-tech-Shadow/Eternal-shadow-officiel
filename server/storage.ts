import { db } from "./db";
import { users, posts, badges, userBadges } from "@shared/schema";
import { eq } from "drizzle-orm";
import session from "express-session";
import connectPg from "connect-pg-simple";
import type { Post, User, InsertUser, InsertPost, Badge, UserBadge } from "@shared/schema";
import { pool } from "./db";

const PostgresSessionStore = connectPg(session);

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  getAllPosts(): Promise<Post[]>;
  createPost(post: InsertPost & { userId: number }): Promise<Post>;
  getUserBadges(userId: number): Promise<Badge[]>;
  addExperience(userId: number, amount: number): Promise<User>;
  awardBadge(userId: number, badgeId: number): Promise<void>;
  sessionStore: session.Store;
}

export class DatabaseStorage implements IStorage {
  sessionStore: session.Store;

  constructor() {
    this.sessionStore = new PostgresSessionStore({
      pool,
      createTableIfMissing: true,
    });
  }

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
    return await db.select().from(posts).orderBy(posts.createdAt);
  }

  async createPost(post: InsertPost & { userId: number }): Promise<Post> {
    const [newPost] = await db.insert(posts).values(post).returning();

    // Award experience points for creating a post
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
    // Check if user already has this badge
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
}

export const storage = new DatabaseStorage();