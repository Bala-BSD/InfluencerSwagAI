import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { aiService } from "./ai-service";
import {
  generateContentRequestSchema,
  generateScriptRequestSchema,
  generateHashtagsRequestSchema,
  generateMoreIdeasRequestSchema,
  ContentPackage,
} from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Generate complete content package
  app.post("/api/content/generate", async (req, res) => {
    try {
      const validatedData = generateContentRequestSchema.parse(req.body);

      // Get or create project
      let project;
      if (validatedData.projectId) {
        // Use existing project and update its metadata with latest values
        project = await storage.getContentProject(validatedData.projectId);
        if (!project) {
          res.status(404).json({ error: "Project not found" });
          return;
        }
        
        // Update project with latest metadata from request
        const updatedProject = await storage.updateProject(validatedData.projectId, {
          productName: validatedData.productName,
          productDescription: validatedData.productDescription,
          targetAudience: validatedData.targetAudience,
          brandVoice: validatedData.brandVoice,
          campaignObjective: validatedData.campaignObjective,
          contentStyle: validatedData.contentStyle,
        });
        
        if (updatedProject) {
          project = updatedProject;
        }
      } else {
        // Create new project (legacy flow - not used in current multi-project workflow)
        project = await storage.createContentProject(validatedData);
      }

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

  // Get content package for specific project
  app.get("/api/content/package", async (req, res) => {
    try {
      const projectId = req.query.projectId as string;
      
      if (!projectId) {
        res.status(400).json({ error: "projectId query parameter is required" });
        return;
      }
      
      const contentPackage = await storage.getContentPackage(projectId);
      
      if (!contentPackage) {
        res.status(404).json({ error: "No content package found for this project" });
        return;
      }

      res.json(contentPackage);
    } catch (error) {
      console.error("Error fetching content package:", error);
      res.status(500).json({ error: "Failed to fetch content package" });
    }
  });

  // Generate more ideas for a specific funnel stage
  app.post("/api/content/generate-more-ideas", async (req, res) => {
    try {
      const validatedData = generateMoreIdeasRequestSchema.parse(req.body);
      
      // Generate more ideas for the specific funnel stage
      const newIdeas = await aiService.generateMoreIdeas(validatedData, validatedData.projectId);
      
      // Get current content package and deduplicate before appending
      const currentPackage = await storage.getContentPackage(validatedData.projectId);
      if (currentPackage) {
        // Create a Set of existing idea IDs for efficient lookup
        const existingIds = new Set(currentPackage.ideas.map(idea => idea.id));
        
        // Filter out any new ideas that have duplicate IDs
        const uniqueNewIdeas = newIdeas.filter(idea => !existingIds.has(idea.id));
        
        const updatedPackage = {
          ...currentPackage,
          ideas: [...currentPackage.ideas, ...uniqueNewIdeas],
        };
        await storage.saveContentPackage(validatedData.projectId, updatedPackage);
        
        // Return only the unique new ideas that were actually added
        res.json(uniqueNewIdeas);
      } else {
        // No existing package, just return all new ideas
        res.json(newIdeas);
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: "Invalid request data", details: error.errors });
      } else {
        console.error("Error generating more ideas:", error);
        res.status(500).json({ error: "Failed to generate more ideas" });
      }
    }
  });

  // Generate script for specific idea
  app.post("/api/content/script", async (req, res) => {
    try {
      const validatedData = generateScriptRequestSchema.parse(req.body);
      const script = await aiService.generateScript(validatedData);
      
      console.log("Generated script:", JSON.stringify(script, null, 2));
      console.log("Script has scenes?", !!script.scenes);
      console.log("Number of scenes:", script.scenes?.length);
      
      // Save to storage with projectId
      await storage.saveScript(validatedData.ideaId, validatedData.duration, script, validatedData.projectId);
      
      console.log("Returning script to client:", JSON.stringify(script, null, 2));
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

  // Get script for specific idea and duration
  app.get("/api/content/script/:ideaId/:duration", async (req, res) => {
    try {
      const { ideaId, duration } = req.params;
      const script = await storage.getScript(ideaId, duration);
      
      if (!script) {
        res.status(404).json({ error: "Script not found" });
        return;
      }
      
      res.json(script);
    } catch (error) {
      console.error("Error fetching script:", error);
      res.status(500).json({ error: "Failed to fetch script" });
    }
  });

  // Generate hashtags for specific idea
  app.post("/api/content/hashtags", async (req, res) => {
    try {
      const validatedData = generateHashtagsRequestSchema.parse(req.body);
      const hashtags = await aiService.generateHashtags(validatedData);
      
      // Save to storage with projectId
      await storage.saveHashtags(validatedData.ideaId, hashtags, validatedData.projectId);
      
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

  // Get hashtags for specific idea
  app.get("/api/content/hashtags/:ideaId", async (req, res) => {
    try {
      const { ideaId } = req.params;
      const hashtags = await storage.getHashtags(ideaId);
      
      if (!hashtags) {
        res.status(404).json({ error: "Hashtags not found" });
        return;
      }
      
      res.json(hashtags);
    } catch (error) {
      console.error("Error fetching hashtags:", error);
      res.status(500).json({ error: "Failed to fetch hashtags" });
    }
  });

  // Project management routes
  app.get("/api/projects", async (req, res) => {
    try {
      const projects = await storage.getAllProjects();
      res.json(projects);
    } catch (error) {
      console.error("Error fetching projects:", error);
      res.status(500).json({ error: "Failed to fetch projects" });
    }
  });

  app.post("/api/projects", async (req, res) => {
    try {
      const project = await storage.createContentProject(req.body);
      res.status(201).json(project);
    } catch (error) {
      console.error("Error creating project:", error);
      res.status(500).json({ error: "Failed to create project" });
    }
  });

  app.get("/api/projects/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const project = await storage.getContentProject(id);
      
      if (!project) {
        res.status(404).json({ error: "Project not found" });
        return;
      }
      
      res.json(project);
    } catch (error) {
      console.error("Error fetching project:", error);
      res.status(500).json({ error: "Failed to fetch project" });
    }
  });

  app.patch("/api/projects/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const updated = await storage.updateProject(id, req.body);
      
      if (!updated) {
        res.status(404).json({ error: "Project not found" });
        return;
      }
      
      res.json(updated);
    } catch (error) {
      console.error("Error updating project:", error);
      res.status(500).json({ error: "Failed to update project" });
    }
  });

  app.delete("/api/projects/:id", async (req, res) => {
    try {
      const { id } = req.params;
      await storage.deleteProject(id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting project:", error);
      res.status(500).json({ error: "Failed to delete project" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
