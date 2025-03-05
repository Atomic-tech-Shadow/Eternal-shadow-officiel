import type { Express, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
import { storage } from "./storage";
import { insertPostSchema, insertForumThreadSchema, insertForumReplySchema, insertProjectSchema, insertReportSchema } from "@shared/schema";

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

  const httpServer = createServer(app);
  return httpServer;
}