import type { Express, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
import { storage } from "./storage";
import { insertPostSchema, insertForumThreadSchema, insertForumReplySchema, insertProjectSchema, insertReportSchema } from "@shared/schema";
import { ilike } from "drizzle-orm";

export async function registerRoutes(app: Express): Promise<Server> {
  setupAuth(app);

  // Routes existantes
  app.get("/api/posts", async (req, res) => {
    const posts = await storage.getAllPosts();
    res.json(posts);
  });

  app.post("/api/posts", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);

    const result = insertPostSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json(result.error);
    }

    const post = await storage.createPost({
      ...result.data,
      userId: req.user.id,
    });
    res.status(201).json(post);
  });

  app.get("/api/users/:userId/badges", async (req, res) => {
    const badges = await storage.getUserBadges(parseInt(req.params.userId));
    res.json(badges);
  });

  app.get("/api/users/:userId/level", async (req, res) => {
    const user = await storage.getUser(parseInt(req.params.userId));
    if (!user) return res.status(404).json({ message: "User not found" });

    res.json({
      level: user.level,
      experience: user.experience,
      nextLevelExperience: Math.pow((user.level + 1) - 1, 2) * 100,
    });
  });

  // Nouvelles routes pour le forum
  app.get("/api/forum/categories", async (req, res) => {
    const categories = await storage.getForumCategories();
    res.json(categories);
  });

  app.get("/api/forum/categories/:categoryId/threads", async (req, res) => {
    const threads = await storage.getForumThreads(parseInt(req.params.categoryId));
    res.json(threads);
  });

  app.get("/api/forum/threads/:threadId", async (req, res) => {
    const thread = await storage.getForumThread(parseInt(req.params.threadId));
    if (!thread) return res.status(404).json({ message: "Thread not found" });
    res.json(thread);
  });

  app.post("/api/forum/threads", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);

    const result = insertForumThreadSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json(result.error);
    }

    const thread = await storage.createForumThread({
      ...result.data,
      userId: req.user.id,
      isPinned: false,
      isLocked: false,
    });
    res.status(201).json(thread);
  });

  app.get("/api/forum/threads/:threadId/replies", async (req, res) => {
    const replies = await storage.getThreadReplies(parseInt(req.params.threadId));
    res.json(replies);
  });

  app.post("/api/forum/threads/:threadId/replies", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);

    const result = insertForumReplySchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json(result.error);
    }

    const reply = await storage.createThreadReply({
      ...result.data,
      userId: req.user.id,
    });
    res.status(201).json(reply);
  });

  // Nouvelles routes pour les projets
  app.get("/api/projects", async (req, res) => {
    const projects = await storage.getProjects();
    res.json(projects);
  });

  app.get("/api/projects/:projectId", async (req, res) => {
    const project = await storage.getProject(parseInt(req.params.projectId));
    if (!project) return res.status(404).json({ message: "Project not found" });
    res.json(project);
  });

  app.post("/api/projects", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);

    const result = insertProjectSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json(result.error);
    }

    const project = await storage.createProject({
      ...result.data,
      userId: req.user.id,
      status: "active",
    });
    res.status(201).json(project);
  });

  app.get("/api/projects/:projectId/members", async (req, res) => {
    const members = await storage.getProjectMembers(parseInt(req.params.projectId));
    res.json(members);
  });

  app.post("/api/projects/:projectId/members", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);

    const { userId, role } = req.body;
    if (!userId || !role) {
      return res.status(400).json({ message: "Missing userId or role" });
    }

    const member = await storage.addProjectMember(
      parseInt(req.params.projectId),
      userId,
      role
    );
    res.status(201).json(member);
  });

  // Middleware pour vérifier si l'utilisateur est modérateur
  async function isModerator(req: any, res: Response, next: NextFunction) {
    if (!req.isAuthenticated()) return res.sendStatus(401);

    const moderator = await storage.getModerator(req.user.id);
    if (!moderator) return res.sendStatus(403);

    req.moderator = moderator;
    next();
  }

  // Routes de modération
  app.post("/api/reports", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);

    const result = insertReportSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json(result.error);
    }

    const report = await storage.createReport({
      ...result.data,
      reporterId: req.user.id,
    });
    res.status(201).json(report);
  });

  app.get("/api/reports", isModerator, async (req, res) => {
    const status = req.query.status as string | undefined;
    const reports = await storage.getReports(status);
    res.json(reports);
  });

  app.patch("/api/reports/:reportId", isModerator, async (req, res) => {
    const { status, resolution } = req.body;
    if (!status) {
      return res.status(400).json({ message: "Status is required" });
    }

    const report = await storage.updateReportStatus(
      parseInt(req.params.reportId),
      status,
      req.user.id,
      resolution
    );
    res.json(report);
  });

  // Routes de recherche
  app.get("/api/search/posts", async (req, res) => {
    const query = req.query.q as string;
    if (!query) return res.status(400).json({ message: "Query parameter is required" });

    const posts = await storage.searchPosts(query);
    res.json(posts);
  });

  app.get("/api/search/forum", async (req, res) => {
    const query = req.query.q as string;
    if (!query) return res.status(400).json({ message: "Query parameter is required" });

    const threads = await storage.searchThreads(query);
    res.json(threads);
  });

  app.get("/api/search/projects", async (req, res) => {
    const query = req.query.q as string;
    if (!query) return res.status(400).json({ message: "Query parameter is required" });

    const projects = await storage.searchProjects(query);
    res.json(projects);
  });

  // Routes pour les modèles de contenu
  app.get("/api/templates", async (req, res) => {
    const category = req.query.category as string | undefined;
    const templates = await storage.getContentTemplates(category);
    res.json(templates);
  });

  app.get("/api/templates/:templateId", async (req, res) => {
    const template = await storage.getContentTemplate(parseInt(req.params.templateId));
    if (!template) return res.status(404).json({ message: "Template not found" });
    res.json(template);
  });

  app.post("/api/templates", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);

    const result = insertTemplateSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json(result.error);
    }

    const template = await storage.createContentTemplate({
      ...result.data,
      createdBy: req.user.id,
    });
    res.status(201).json(template);
  });

  // Routes pour les évaluations (ratings)
  app.get("/api/ratings/:targetType/:targetId", async (req, res) => {
    const { targetType, targetId } = req.params;
    const ratings = await storage.getRatings(targetType, parseInt(targetId));
    res.json(ratings);
  });

  app.get("/api/ratings/:targetType/:targetId/average", async (req, res) => {
    const { targetType, targetId } = req.params;
    const average = await storage.getAverageRating(targetType, parseInt(targetId));
    res.json(average);
  });

  app.post("/api/ratings", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);

    const result = insertRatingSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json(result.error);
    }

    const rating = await storage.createOrUpdateRating({
      ...result.data,
      userId: req.user.id,
    });
    res.status(201).json(rating);
  });

  // Routes pour les favoris
  app.get("/api/users/:userId/favorites", async (req, res) => {
    const favorites = await storage.getUserFavorites(parseInt(req.params.userId));
    res.json(favorites);
  });

  app.post("/api/favorites", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);

    const { targetType, targetId } = req.body;
    if (!targetType || !targetId) {
      return res.status(400).json({ message: "Missing targetType or targetId" });
    }

    const favorite = await storage.addToFavorites({
      targetType,
      targetId,
      userId: req.user.id,
    });
    res.status(201).json(favorite);
  });

  app.delete("/api/favorites/:targetType/:targetId", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);

    const { targetType, targetId } = req.params;
    
    await storage.removeFromFavorites({
      targetType,
      targetId: parseInt(targetId),
      userId: req.user.id,
    });
    res.sendStatus(204);
  });

  const httpServer = createServer(app);
  return httpServer;
}