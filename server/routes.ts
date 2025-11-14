import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { aiService } from "./ai-service";
import {
  generateContentRequestSchema,
  generateScriptRequestSchema,
  generateHashtagsRequestSchema,
  ContentPackage,
} from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Generate complete content package
  app.post("/api/content/generate", async (req, res) => {
    try {
      const validatedData = generateContentRequestSchema.parse(req.body);

      // Create project
      const project = await storage.createContentProject(validatedData);

      // Generate content ideas and trend insights in parallel
      const [ideas, trendInsights] = await Promise.all([
        aiService.generateContentIdeas(validatedData, project.id),
        aiService.generateTrendInsights(validatedData),
      ]);

      // Create and save content package
      const contentPackage: ContentPackage = {
        project,
        ideas,
        trendInsights,
      };

      await storage.saveContentPackage(project.id, contentPackage);

      res.json(contentPackage);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: "Invalid request data", details: error.errors });
      } else {
        console.error("Error generating content:", error);
        res.status(500).json({ error: "Failed to generate content package" });
      }
    }
  });

  // Get current content package
  app.get("/api/content/package", async (req, res) => {
    try {
      const contentPackage = await storage.getCurrentPackage();
      
      if (!contentPackage) {
        res.status(404).json({ error: "No content package found" });
        return;
      }

      res.json(contentPackage);
    } catch (error) {
      console.error("Error fetching content package:", error);
      res.status(500).json({ error: "Failed to fetch content package" });
    }
  });

  // Generate script for specific idea
  app.post("/api/content/script", async (req, res) => {
    try {
      const validatedData = generateScriptRequestSchema.parse(req.body);
      const script = await aiService.generateScript(validatedData);
      res.json(script);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: "Invalid request data", details: error.errors });
      } else {
        console.error("Error generating script:", error);
        res.status(500).json({ error: "Failed to generate script" });
      }
    }
  });

  // Generate hashtags for specific idea
  app.post("/api/content/hashtags", async (req, res) => {
    try {
      const validatedData = generateHashtagsRequestSchema.parse(req.body);
      const hashtags = await aiService.generateHashtags(validatedData);
      res.json(hashtags);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: "Invalid request data", details: error.errors });
      } else {
        console.error("Error generating hashtags:", error);
        res.status(500).json({ error: "Failed to generate hashtags" });
      }
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
