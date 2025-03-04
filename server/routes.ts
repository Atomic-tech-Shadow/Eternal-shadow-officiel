import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
import { storage } from "./storage";
import { insertPostSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  setupAuth(app);

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

  const httpServer = createServer(app);
  return httpServer;
}
